import { Component, Input, OnInit } from '@angular/core';

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
  @Input('date') inputDate: string | null
  @Input('mode') inputMode: string
  weekDaysName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  monthes: Array<MonthOption> = [{ value: 0, title: 'Янв' }, { value: 1, title: 'Фев' }, { value: 2, title: 'Мар' }, { value: 3, title: 'Апр' }, { value: 4, title: 'Май' }, { value: 5, title: 'Июн' }, { value: 6, title: 'Июл' }, { value: 7, title: 'Авг' }]
  monthDays: Array<Day | null>
  selectedDate: string
  selectedMonth: number
  selectedYear: number

  getMonthLayout() {
    let firstDay = new Date(this.selectedYear, this.selectedMonth, 1)
    let firstWeekDay = firstDay.getDay()
    let daysInMonth = new Date(this.selectedYear, Number(this.selectedMonth) + 1, 0).getDate();
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

  ngOnInit() {
    let date: Date
    if (this.inputDate && Number(this.inputDate)) {
      if (this.inputMode == 'nano') {
        date = new Date(Number(this.inputDate.slice(0, -6)))
      } else {
        date = new Date(Number(this.inputDate))
      }
    } else {
      date = new Date()
    }
    this.selectedMonth = date.getMonth()
    this.selectedYear = date.getFullYear()
    this.getMonthLayout()
  }
}
