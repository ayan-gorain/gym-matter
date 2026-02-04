import { Injectable } from '@angular/core';
import { DailyPlan, PlanItem } from '../models/plan.model';
import { db } from '../firebase.config';
import { collection, getDocs, doc, setDoc, query } from 'firebase/firestore';
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
