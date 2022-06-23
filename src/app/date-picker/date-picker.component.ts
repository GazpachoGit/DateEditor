import { Component, Input, OnInit } from '@angular/core';

interface Day {
  date: number,
  weekDay: number,
  monthIndex: number,
  year: number
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent {
  @Input('date') inputDate: string
  weekDaysName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  monthDays: Array<Day | null>
  selectedDate: string

  getMonthLayout(currentMonth: number, currentYear: number): Array<Day | null> {
    let firstDay = new Date(currentYear, currentMonth, 1)
    let firstWeekDay = firstDay.getDay()
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let monthDays = []
    for (let i = 1; i < firstWeekDay; i++) {
      monthDays.push(null)
    }
    let weekDay = firstWeekDay
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push({
        date: i,
        weekDay: weekDay,
        monthIndex: currentMonth,
        year: currentYear
      })
      weekDay = weekDay == 7 ? 1 : ++weekDay
    }
    if (weekDay < 7) {
      for (let i = weekDay; i <= 7; i++) {
        monthDays.push(null)
      }
    }
    return monthDays
  }

  ngOnInit() {
    let date: Date
    if (this.inputDate && Number(this.inputDate)) {
      date = new Date(Number(this.inputDate))
    } else {
      date = new Date()
    }
    this.monthDays = this.getMonthLayout(date.getMonth(), date.getFullYear())
  }
}
