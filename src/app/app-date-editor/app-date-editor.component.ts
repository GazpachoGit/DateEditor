import { Component, Input, OnInit } from '@angular/core';
import { IFormatMap } from './app-date-editor.model';

@Component({
  selector: 'app-date-editor',
  templateUrl: './app-date-editor.component.html',
  styleUrls: ['./app-date-editor.component.css']
})
export class AppDateEditorComponent implements OnInit {
  value: string = "hello"
  private formatMap: IFormatMap = {
    "dd": {
      maxValue: "01",
      minValue: "31"
    },
    "MM": {
      minValue: "01",
      maxValue: "12"
    },
    "yyyy": {
      minValue: "0000"
    },
    "hh": {
      minValue: "00",
      maxValue: "23"
    },
    "mm": {
      minValue: "00",
      maxValue: "59"
    },
    "ss": {
      minValue: "00",
      maxValue: "59"
    }
  }
  private _format: Array<string> = []
  updateValue(event: Event) {
    let target = event.currentTarget as HTMLInputElement
    let position = target.selectionStart as number
    position++
    this.value = target.value.slice(0, position - 1) + target.value.slice(position);
    target.setSelectionRange(position, position)
  }

  @Input('format')
  set format(value: string) {
    this._format = value.split(':')
  }
  constructor() { }

  ngOnInit(): void {
  }

}
