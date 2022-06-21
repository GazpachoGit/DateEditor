import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IFormatMap, SEPARATOR } from './app-date-editor.model';

@Component({
  selector: 'app-date-editor',
  templateUrl: './app-date-editor.component.html',
  styleUrls: ['./app-date-editor.component.css']
})
export class AppDateEditorComponent {
  @ViewChild('textInput') _textArea: ElementRef;
  value: string = "21:06:2022"
  position: number
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
    this.position = target.selectionStart as number
    this.position++
    this.value = target.value.slice(0, this.position - 1) + target.value.slice(this.position);
  }

  @Input('format')
  set format(value: string) {
    this._format = value.split(':')
  }
  constructor() { }

  ngAfterViewChecked() {
    let el = this._textArea.nativeElement as HTMLInputElement
    let a = this.value[this.position]
    if (this.value[this.position] == SEPARATOR) {
      el.setSelectionRange(this.position, this.position)
    } else {
      el.setSelectionRange(this.position - 1, this.position - 1)
    }
  }

}
