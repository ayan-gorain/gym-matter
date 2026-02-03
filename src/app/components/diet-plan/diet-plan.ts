import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanItem } from '../../models/plan.model';

@Component({
  selector: 'app-diet-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-plan.html',
  styles: []
})
export class DietPlan {
  @Input() diet: PlanItem[] = [];
  @Output() toggleItem = new EventEmitter<PlanItem>();

  onToggle(item: PlanItem) {
    this.toggleItem.emit(item);
  }
}
