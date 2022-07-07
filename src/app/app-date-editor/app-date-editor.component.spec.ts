import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AppDateEditorComponent } from './app-date-editor.component';

describe('AppDateEditorComponent', () => {
  let component: AppDateEditorComponent;
  let fixture: ComponentFixture<AppDateEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppDateEditorComponent],
      providers: [DatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(AppDateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  beforeEach(() => {
    component.format = 'dd!@#MM/yy HH:mm:ss:SS'
    component.dateValue = ''
    component.inputMode = 'nano'
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // it('check formated value', () => {
  //   expect(component.value).toEqual('22!@#06/22 15:26:49:14')
  // })
  it('INPUT 0-9 check initial input', () => {
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '1'
    el.setSelectionRange(1, 1)
    el.dispatchEvent(new InputEvent('input', { data: '1' }));
    expect(component.value).toEqual('1')

  })
  it('INPUT 0-9 check initial input with separator', () => {
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '11'
    el.setSelectionRange(2, 2)
    el.dispatchEvent(new InputEvent('input', { data: '1' }));
    expect(component.value).toEqual('11!@#')
    expect(el.selectionStart).toEqual(5)
  })
  it('INPUT 0-9 check valid date change', () => {
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '121!@#'
    el.setSelectionRange(2, 2)
    el.dispatchEvent(new InputEvent('input', { data: '2' }));
    expect(component.value).toEqual('12!@#')
  })
  it('INPUT 0-9 invalid date change', () => {
    component.value = '11!@#'
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '911!@#'
    el.setSelectionRange(1, 1)
    el.dispatchEvent(new InputEvent('input', { data: '9' }));
    expect(component.value).toEqual('11!@#')
  })
  it('INPUT 0-9 mounth should be changed', () => {
    component.value = '31!@#03'
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '31!@#023'
    el.setSelectionRange(7, 7)
    el.dispatchEvent(new InputEvent('input', { data: '2' }));
    expect(component.value).toEqual('28!@#02')
  })
  it('INPUT 0-9 no out of the length input', () => {
    component.value = '22!@#06/22 15:26:49:14'
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '22!@#06/22 15:26:49:141'
    el.setSelectionRange(22, 22)
    el.dispatchEvent(new InputEvent('input', { data: '1' }));
    expect(component.value).toEqual('22!@#06/22 15:26:49:14')
  })
  it('INPUT 0-9 no input on a separator position', () => {
    component.value = '22!@#06/22 '
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '221!@#06/22 '
    el.setSelectionRange(3, 3)
    el.dispatchEvent(new InputEvent('input', { data: '1' }));
    expect(component.value).toEqual('22!@#06/22 ')
  })
  it('INPUT 0-9 postion is changed on ziro input on the first section postion', () => {
    component.value = '00!@#00/00 '
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '00!@#000/00 '
    el.setSelectionRange(6, 6)
    el.dispatchEvent(new InputEvent('input', { data: '0' }));
    expect(component.value).toEqual('00!@#00/00 ')
    expect(el.selectionStart).toEqual(6)
  })
  it('NAVIGATION LEFT shift through a sepparator', () => {
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '11!@#'
    el.setSelectionRange(4, 4)
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    expect(el.selectionStart).toEqual(2)
  })
  it('NAVIGATION LEFT shit on 1 postion on a date', () => {
    let input = fixture.debugElement.query(By.css('input'));
    let el = input.nativeElement;
    el.value = '11!@#'
    el.setSelectionRange(1, 1)
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    expect(el.selectionStart).toEqual(1)
  })

});
