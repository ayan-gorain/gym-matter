import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlan } from './exercise-plan';

describe('ExercisePlan', () => {
  let component: ExercisePlan;
  let fixture: ComponentFixture<ExercisePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercisePlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercisePlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
