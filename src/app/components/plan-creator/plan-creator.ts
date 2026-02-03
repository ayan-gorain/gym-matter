import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyPlan, PlanItem } from '../../models/plan.model';
import { PlanService } from '../../services/plan';

@Component({
  selector: 'app-plan-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-creator.html',
  styles: []
})
export class PlanCreator implements OnInit, OnChanges {
  newExercises: PlanItem[] = [];
  newDiet: PlanItem[] = [];
  selectedDay: string = 'Monday';
  planFocus: string = '';
  lastUpdatedDate: number | undefined;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  isSaving: boolean = false;

  @Input() plans: DailyPlan[] = [];
  @Output() planSaved = new EventEmitter<void>();

  constructor(private planService: PlanService) { }

  ngOnInit() {
    this.loadDayData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['plans']) {
      this.loadDayData();
    }
  }

  onDayChange(day: string) {
    this.selectedDay = day;
    this.loadDayData();
  }

  loadDayData() {
    const existingPlan = this.plans.find(p => p.day === this.selectedDay);
    if (existingPlan) {
      // Deep copy to avoid mutating the original plan directly before saving
      this.newExercises = JSON.parse(JSON.stringify(existingPlan.exercises));
      this.newDiet = JSON.parse(JSON.stringify(existingPlan.diet));
      this.planFocus = existingPlan.focus || '';
      this.lastUpdatedDate = existingPlan.lastUpdated;
    } else {
      // Reset if no plan exists for this day (fallback)
      this.newExercises = [];
      this.newDiet = [];
      this.planFocus = '';
    }
  }

  addExercise(content: string, time: string, calories: string = '') {
    if (content.trim()) {
      const cal = calories ? parseInt(calories, 10) : undefined;
      this.newExercises.push({
        content: content.trim(),
        completed: false, // Default to unchecked for new items
        duration: time.trim(),
        calories: cal
      });
    }
  }

  addDietItem(content: string, calories: string) {
    if (content.trim()) {
      const cal = calories ? parseInt(calories, 10) : 0;
      this.newDiet.push({
        content: content.trim(),
        completed: false, // Default to unchecked for new items
        calories: cal
      });
    }
  }

  removeExercise(index: number) {
    this.newExercises.splice(index, 1);
  }

  removeDiet(index: number) {
    this.newDiet.splice(index, 1);
  }

  get totalCalories(): number {
    return this.newDiet.reduce((acc, item) => acc + (item.calories || 0), 0);
  }

  async savePlan() {
    this.isSaving = true;
    try {
      await this.planService.updatePlan(this.selectedDay, this.newExercises, this.newDiet, this.planFocus);
      alert(`Plan for ${this.selectedDay} has been saved to database!`);
      this.newExercises = [];
      this.newDiet = [];
      this.planFocus = '';
      this.planSaved.emit();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan. Please try again.");
    } finally {
      this.isSaving = false;
    }
  }
}
