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
    {
      day: 'Monday',
      exercises: createItems(['Push-ups: 3x15', 'Squats: 3x20', 'Plank: 60s', 'Burpees: 3x10']),
      diet: createItems(['Breakfast: Oatmeal & Berries', 'Lunch: Grilled Chicken Salad', 'Dinner: Steamed Vegetables & Fish', 'Snack: Almonds'])
    },
    {
      day: 'Tuesday',
      exercises: createItems(['Running: 5km', 'Lunges: 3x15', 'Jumping Jacks: 3x30s', 'Crunches: 3x20']),
      diet: createItems(['Breakfast: Scrambled Eggs', 'Lunch: Quinoa Bowl', 'Dinner: Stir-fry Tofu', 'Snack: Greek Yogurt'])
    },
    {
      day: 'Wednesday',
      exercises: createItems(['Deadlifts: 3x10', 'Bench Press: 3x10', 'Pull-ups: 3x8', 'Dumbbell Rows: 3x12']),
      diet: createItems(['Breakfast: Smoothie', 'Lunch: Turkey Wrap', 'Dinner: Lentil Soup', 'Snack: Apple'])
    },
    {
      day: 'Thursday',
      exercises: createItems(['Yoga: 45m', 'Plank: 90s', 'V-Ups: 3x15', 'Bicycle Crunches: 3x20']),
      diet: createItems(['Breakfast: Toast & Avocado', 'Lunch: Chicken Rice Bowl', 'Dinner: Salmon & Asparagus', 'Snack: Protein Bar'])
    },
    {
      day: 'Friday',
      exercises: createItems(['HIIT: 20m', 'Jump Rope: 10m', 'Box Jumps: 3x12', 'Mountain Climbers: 3x30s']),
      diet: createItems(['Breakfast: Pancakes (Healthy)', 'Lunch: Tuna Salad', 'Dinner: Steak & Veggies', 'Snack: Fruit Salad'])
    },
    {
      day: 'Saturday',
      exercises: createItems(['Hiking: 2h', 'Stretching: 20m']),
      diet: createItems(['Breakfast: Omelette', 'Lunch: Grilled Fish', 'Dinner: Chicken Soup', 'Snack: Nuts'])
    },
    {
      day: 'Sunday',
      exercises: createItems(['Rest Day', 'Light Walk: 30m']),
      diet: createItems(['Breakfast: Waffles', 'Lunch: Roast Beef', 'Dinner: Salad', 'Snack: Dark Chocolate'])
    }
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
