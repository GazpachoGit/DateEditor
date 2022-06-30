import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

  get internalDate() {
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
    this.onDateChange.emit(this.internalDate)
  }
  onChange() {
    this.getMonthLayout()
    this.onDateChange.emit(this.internalDate)
  }
  ngAfterViewInit() {
    console.log('1')
  }
}
