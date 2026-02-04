import { Injectable } from '@angular/core';
import { DailyPlan, PlanItem } from '../models/plan.model';
import { db } from '../firebase.config';
import { collection, getDocs, doc, setDoc, query, addDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  constructor(private authService: AuthService) { }

  // Helper to get the correct collection for the current user
  private get userPlansCollection() {
    const user = this.authService.currentUser;
    if (!user) return null;
    return collection(db, `users/${user.uid}/plans`);
  }

  // Helper to get a specific document reference
  private getUserDocRef(day: string) {
    const user = this.authService.currentUser;
    if (!user) return null;
    return doc(db, `users/${user.uid}/plans`, day);
  }

  async getPlans(): Promise<DailyPlan[]> {
    if (!this.authService.currentUser) return [];

    try {
      const colRef = this.userPlansCollection;
      if (!colRef) return [];

      const q = query(colRef);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await this.seedData();
        return this.mockPlans;
      }

      const plans: DailyPlan[] = [];
      querySnapshot.forEach((doc) => {
        plans.push(doc.data() as DailyPlan);
      });

      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return plans.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    } catch (e) {
      console.error("Error fetching plans", e);
      return [];
    }
  }

  async toggleItemCompletion(day: string, type: 'exercises' | 'diet', item: PlanItem, plan: DailyPlan): Promise<void> {
    const docRef = this.getUserDocRef(day);
    if (!docRef) return;

    item.completed = !item.completed;
    await setDoc(docRef, {
      [type]: plan[type]
    }, { merge: true });
  }

  async updatePlan(day: string, exercises: PlanItem[], diet: PlanItem[], focus: string = ''): Promise<void> {
    const docRef = this.getUserDocRef(day);
    if (!docRef) throw new Error("User not authenticated");

    await setDoc(docRef, {
      day,
      exercises,
      diet,
      focus,
      lastUpdated: Date.now()
    }, { merge: true });
  }

  private mockPlans: DailyPlan[] = [
    { day: 'Monday', exercises: [], diet: [] },
    { day: 'Tuesday', exercises: [], diet: [] },
    { day: 'Wednesday', exercises: [], diet: [] },
    { day: 'Thursday', exercises: [], diet: [] },
    { day: 'Friday', exercises: [], diet: [] },
    { day: 'Saturday', exercises: [], diet: [] },
    { day: 'Sunday', exercises: [], diet: [] }
  ];

  async archiveCurrentWeek(): Promise<void> {
    const user = this.authService.currentUser;
    if (!user) return;

    const currentPlans = await this.getPlans();

    // Calculate stats for the history record
    const stats = currentPlans.reduce((acc, plan) => {
      acc.totalExercises += plan.exercises.length;
      acc.completedExercises += plan.exercises.filter(e => e.completed).length;
      acc.totalDiet += plan.diet.length;
      acc.completedDiet += plan.diet.filter(d => d.completed).length;
      acc.totalCaloriesBurnt += plan.exercises
        .filter(e => e.completed && e.calories)
        .reduce((sum, e) => sum + (e.calories || 0), 0);
      return acc;
    }, { totalExercises: 0, completedExercises: 0, totalDiet: 0, completedDiet: 0, totalCaloriesBurnt: 0 });

    const historyData = {
      completedDate: new Date().toISOString(), // Use ISO string for easier querying/sorting if needed, or stick to timestamp
      timestamp: Date.now(),
      stats,
      plans: currentPlans
    };

    // Save to history collection
    const historyColRef = collection(db, `users/${user.uid}/history`);
    await addDoc(historyColRef, historyData);

    // Reset current plans
    const updates = currentPlans.map(plan => {
      const resetExercises = plan.exercises.map(e => ({ ...e, completed: false }));
      const resetDiet = plan.diet.map(d => ({ ...d, completed: false }));

      const docRef = this.getUserDocRef(plan.day);
      if (!docRef) return Promise.resolve(); // Should not happen

      return setDoc(docRef, {
        exercises: resetExercises,
        diet: resetDiet
      }, { merge: true });
    });

    await Promise.all(updates);
  }

  async getHistory(): Promise<any[]> {
    const user = this.authService.currentUser;
    if (!user) return [];

    const historyColRef = collection(db, `users/${user.uid}/history`);
    const q = query(historyColRef); // In a real app, order by timestamp desc
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => b.timestamp - a.timestamp);
  }

  private async seedData() {
    console.log('Seeding data to Firestore for User...');
    for (const plan of this.mockPlans) {
      const docRef = this.getUserDocRef(plan.day);
      if (docRef) {
        await setDoc(docRef, plan);
      }
    }
  }
}

function createItems(items: string[]): PlanItem[] {
  return items.map(content => ({ content, completed: false }));
}
