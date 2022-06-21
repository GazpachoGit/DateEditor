import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDateEditorComponent } from './app-date-editor.component';

describe('AppDateEditorComponent', () => {
  let component: AppDateEditorComponent;
  let fixture: ComponentFixture<AppDateEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppDateEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
