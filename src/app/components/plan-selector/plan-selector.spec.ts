import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSelector } from './plan-selector';

describe('PlanSelector', () => {
  let component: PlanSelector;
  let fixture: ComponentFixture<PlanSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
