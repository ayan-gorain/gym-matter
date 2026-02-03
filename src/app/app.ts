import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from './services/plan';
import { PlanSelector } from './components/plan-selector/plan-selector';
import { ExercisePlan } from './components/exercise-plan/exercise-plan';
import { DietPlan } from './components/diet-plan/diet-plan';
import { Tracker } from './components/tracker/tracker';
import { NavBar } from './components/nav-bar/nav-bar';
import { PlanCreator } from './components/plan-creator/plan-creator';
import { DailyPlan } from './models/plan.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlanSelector, ExercisePlan, DietPlan, Tracker, NavBar, PlanCreator],
  templateUrl: './app.html',
  styles: []
})
export class App implements OnInit {
  plans: DailyPlan[] = [];
  selectedPlan: DailyPlan | null = null;
  selectedDayName: string = '';
  currentView: string = 'dashboard';

  constructor(private planService: PlanService) { }

  async ngOnInit() {
    this.plans = await this.planService.getPlans();
    if (this.plans.length > 0) {
      this.onDaySelected(this.plans[0].day);
    }
  }

  onNavigate(view: string) {
    this.currentView = view;
  }

  onDaySelected(day: string) {
    this.selectedDayName = day;
    this.selectedPlan = this.plans.find(p => p.day === day) || null;
  }

  async onToggleItem(item: any) {
    // Determine context (exercise or diet)
    if (!this.selectedPlan) return;

    const isScale = (i: any) => i.calories !== undefined; // Simple check if it's diet
    const type = isScale(item) ? 'diet' : 'exercises';

    await this.planService.toggleItemCompletion(this.selectedPlan.day, type as 'exercises' | 'diet', item, this.selectedPlan);
  }

  async onPlanSaved() {
    this.plans = await this.planService.getPlans();
    if (this.selectedDayName) {
      this.onDaySelected(this.selectedDayName);
    }
  }

  get exCount(): number {
    return this.selectedPlan ? this.selectedPlan.exercises.length : 0;
  }

  get exDone(): number {
    return this.selectedPlan ? this.selectedPlan.exercises.filter(x => x.completed).length : 0;
  }

  get dietCount(): number {
    return this.selectedPlan ? this.selectedPlan.diet.length : 0;
  }

  get dietDone(): number {
    return this.selectedPlan ? this.selectedPlan.diet.filter(x => x.completed).length : 0;
  }

  get totalCalories(): number {
    return this.selectedPlan ? this.selectedPlan.diet.reduce((acc, item) => acc + (item.calories || 0), 0) : 0;
  }
}
