import { Component, Input, OnInit } from '@angular/core';

interface Day {
  Date?: number,
  WeekDay?: number,
  monthIndex?: number
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent {
  @Input('date') dateString: string
  weekDaysName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  monthDays: Array<Day>

  ngOnInit() {
    let date = new Date(Number(this.dateString))
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    let firstWeekDay = firstDay.getDay()
    let daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    this.monthDays = []
    for (let i = 1; i < firstWeekDay; i++) {
      this.monthDays.push({})
    }
    let weekDay = firstWeekDay
    for (let i = 1; i <= daysInMonth; i++) {
      this.monthDays.push({ Date: i, WeekDay: weekDay })
      weekDay = weekDay == 7 ? 1 : ++weekDay
    }
    if (weekDay < 7) {
      for (let i = weekDay; i <= 7; i++) {
        this.monthDays.push({})
      }
    }
  }
}
