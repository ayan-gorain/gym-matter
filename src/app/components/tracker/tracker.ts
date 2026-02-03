import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracker.html',
})
export class Tracker {
  @Input() exerciseCount: number = 0;
  @Input() exerciseDone: number = 0;
  @Input() dietCount: number = 0;
  @Input() dietDone: number = 0;

  get exercisePct(): number {
    return this.exerciseCount ? (this.exerciseDone / this.exerciseCount) * 100 : 0;
  }

  get dietPct(): number {
    return this.dietCount ? (this.dietDone / this.dietCount) * 100 : 0;
  }
}
