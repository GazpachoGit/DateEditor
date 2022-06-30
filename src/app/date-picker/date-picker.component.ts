import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { IClickPos } from '../app-date-editor/app-date-editor.model';

interface Day {
  date: number,
  weekDay: number,
  monthIndex: number,
  year: number
}
interface MonthOption {
  value: number,
  title: string
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent {
  @Output() onDateChange = new EventEmitter<string>()

  @Input() clickPosition: IClickPos
  pickerX = 222
  pickerY = 238
  datePickerStyle = {
    position: 'fixed',
    width: `${this.pickerX}px`,
    height: `${this.pickerY}px`,
    top: '',
    left: ''
  }


  @Input('mode') inputMode: string
  @Input() format: string
  @Input('date')
  set inputDateString(value: string | null) {
    let date: Date
    if (value && Number(value)) {
      if (this.inputMode == 'nano') {
        date = new Date(Number(value.slice(0, -6)))
      } else {
        date = new Date(Number(value))
      }
    } else {
      date = new Date()
    }
    this._inputDateString = value as string
    this.inputDate = date
    this.selectedDate = date.getDate()
    this.selectedMonth = date.getMonth()
    this.selectedYear = date.getFullYear()
    this.selectedHour = date.getHours()
    this.selectedMinute = date.getMinutes()
    this.selectedSecond = date.getSeconds()
    this.selectedMiliSecond = date.getMilliseconds()
    this.getMonthLayout()
  }
  get inputDateString(): string | null {
    return this._inputDateString
  }

  internalDate: string

  weekDaysName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  monthes: Array<MonthOption> = [{ value: 0, title: 'Янв' }, { value: 1, title: 'Фев' }, { value: 2, title: 'Мар' }, { value: 3, title: 'Апр' }, { value: 4, title: 'Май' }, { value: 5, title: 'Июн' }, { value: 6, title: 'Июл' }, { value: 7, title: 'Авг' }, { value: 8, title: 'Сен' }, { value: 9, title: 'Окт' }, { value: 10, title: 'Нояб' }, { value: 11, title: 'Дек' }]

  private _inputDateString: string
  inputDate: Date
  monthDays: Array<Day | null>
  selectedDate: number
  selectedMonth: number
  selectedYear: number
  selectedHour: number
  selectedMinute: number
  selectedSecond: number
  selectedMiliSecond: number
  _internalDate: string

  constructor() { }

  ngOnInit() {
    this.getComponentPosition()
    this.internalDate = this.getInternalDate()
  }
  getComponentPosition() {
    let windowX = document.documentElement.clientWidth
    let windowY = document.documentElement.clientHeight
    let clickX = this.clickPosition.clickX
    let clickY = this.clickPosition.clickY
    let pickerX = this.pickerX
    let pickerY = this.pickerY
    let resultX = (clickX + pickerX > windowX) ? clickX - pickerX : clickX
    let resultY = (clickY + pickerX > windowY) ? clickY - pickerY : clickY
    this.datePickerStyle.left = `${resultX}px`
    this.datePickerStyle.top = `${resultY}px`
  }
  getInternalDate() {
    let newDate = new Date(this.selectedYear, this.selectedMonth, this.selectedDate, this.selectedHour, this.selectedMinute, this.selectedSecond, this.selectedMiliSecond)
    let stringNewDate = newDate.valueOf().toString()

    //nanosec
    if (this.inputMode == 'nano') {
      if (this.inputDateString != null && this.inputDateString.length > 6) {
        stringNewDate += this.inputDateString.slice(-6)
      } else {
        stringNewDate += "000000"
      }
    }
    return stringNewDate
  }

  getMonthLayout() {
    let firstDay = new Date(this.selectedYear, this.selectedMonth, 1)
    let firstWeekDay = firstDay.getDay()
    let daysInMonth = new Date(this.selectedYear, Number(this.selectedMonth) + 1, 0).getDate();
    if (this.selectedDate > daysInMonth) this.selectedDate = 1
    let monthDays = []
    for (let i = 1; i < firstWeekDay; i++) {
      monthDays.push(null)
    }
    let weekDay = firstWeekDay
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push({
        date: i,
        weekDay: weekDay,
        monthIndex: this.selectedMonth,
        year: this.selectedYear
      })
      weekDay = weekDay == 7 ? 1 : ++weekDay
    }
    if (weekDay < 7) {
      for (let i = weekDay; i <= 7; i++) {
        monthDays.push(null)
      }
    }
    this.monthDays = monthDays
  }
  onDateClick(event: Event) {
    let target = event.target as HTMLElement
    let dateString = target.innerHTML
    if (dateString.length > 0) {
      let date = Number(dateString)
      this.selectedDate = date
    }
    this.internalDate = this.getInternalDate()
    this.onDateChange.emit(this.internalDate)
  }
  onChange() {
    this.getMonthLayout()
    this.internalDate = this.getInternalDate()
    this.onDateChange.emit(this.internalDate)
  }
}
