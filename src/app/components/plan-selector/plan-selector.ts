import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyPlan } from '../../models/plan.model';

@Component({
  selector: 'app-plan-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-selector.html',
  styles: []
})
export class PlanSelector {
  @Input() plans: DailyPlan[] = [];
  @Input() selectedDay: string = '';
  @Output() daySelected = new EventEmitter<string>();

  selectDay(day: string) {
    this.daySelected.emit(day);
  }
}
