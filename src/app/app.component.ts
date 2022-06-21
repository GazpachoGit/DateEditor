import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  odds: number[] = []
  emms: number[] = []
  onValue(data: { value: number }) {
    if (data.value % 2 == 0) this.odds.push(data.value)
    else this.emms.push(data.value)
  }
}
