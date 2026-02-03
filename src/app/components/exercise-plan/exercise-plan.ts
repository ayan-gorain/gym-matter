import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanItem } from '../../models/plan.model';

@Component({
  selector: 'app-exercise-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise-plan.html',
  styles: []
})
export class ExercisePlan {
  @Input() exercises: PlanItem[] = [];
  @Output() toggleItem = new EventEmitter<PlanItem>();

  onToggle(item: PlanItem) {
    this.toggleItem.emit(item);
  }
}
