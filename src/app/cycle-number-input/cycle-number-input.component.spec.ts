import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleNumberInputComponent } from './cycle-number-input.component';

describe('CycleNumberInputComponent', () => {
  let component: CycleNumberInputComponent;
  let fixture: ComponentFixture<CycleNumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CycleNumberInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CycleNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
