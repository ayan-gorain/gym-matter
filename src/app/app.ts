import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from './services/plan';
import { PlanSelector } from './components/plan-selector/plan-selector';
import { ExercisePlan } from './components/exercise-plan/exercise-plan';
import { DietPlan } from './components/diet-plan/diet-plan';
import { Tracker } from './components/tracker/tracker';
import { NavBar } from './components/nav-bar/nav-bar';
import { PlanCreator } from './components/plan-creator/plan-creator';
import { LoginComponent } from './components/login/login';
import { DailyPlan } from './models/plan.model';
import { AuthService } from './services/auth.service';
import { User } from 'firebase/auth';

import { HistoryComponent } from './components/history/history';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlanSelector, ExercisePlan, DietPlan, Tracker, NavBar, PlanCreator, LoginComponent, HistoryComponent],
  templateUrl: './app.html',
  styles: []
})
export class App implements OnInit {
  plans: DailyPlan[] = [];
  selectedPlan: DailyPlan | null = null;
  selectedDayName: string = '';
  currentView: string = 'dashboard';
  user: User | null = null;
  isLoading: boolean = true;

  constructor(private planService: PlanService, public authService: AuthService) { }

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      this.user = user;
      this.isLoading = false;
      if (user) {
        await this.loadPlans();
      } else {
        this.plans = [];
        this.selectedPlan = null;
      }
    });
  }

  async loadPlans() {
    this.plans = await this.planService.getPlans();
    if (this.plans.length > 0) {
      // Keep selected day if possible, otherwise first day
      const dayToSelect = this.selectedDayName || this.plans[0].day;
      this.onDaySelected(dayToSelect);
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

    const isScale = (i: any) => i.calories !== undefined && i.duration === undefined; // Check properties strictly
    const type = isScale(item) ? 'diet' : 'exercises';

    await this.planService.toggleItemCompletion(this.selectedPlan.day, type as 'exercises' | 'diet', item, this.selectedPlan);
  }

  async onPlanSaved() {
    await this.loadPlans();
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

  get totalBurnt(): number {
    return this.selectedPlan ? this.selectedPlan.exercises
      .filter(x => x.completed)
      .reduce((acc, item) => acc + (item.calories || 0), 0) : 0;
  }

  async onFinishWeek() {
    if (confirm('Are you sure you want to finish this week? This will save your progress to history and reset the plan for a new week.')) {
      this.isLoading = true;
      await this.planService.archiveCurrentWeek();
      await this.loadPlans();
      this.isLoading = false;
      this.currentView = 'history';
    }
  }
}
