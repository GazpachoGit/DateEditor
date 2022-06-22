import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { formatMap, IFormatMap, SEPARATOR } from './app-date-editor.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-editor',
  templateUrl: './app-date-editor.component.html',
  styleUrls: ['./app-date-editor.component.css']
})
//TODO
//игнорировать delete и backspace буквы и прочее
export class AppDateEditorComponent {
  @ViewChild('textInput') _textArea: ElementRef;
  value: string = ""
  internalValue: string = ""
  position: number
  regExp: RegExp
  @Input('format') format: string
  @Input('value') dateValue: string
  @Input('mode') inputMode: string

  constructor(private datePipe: DatePipe) { }

  ngOnInit() {
    this.regExp = this.getCurrentRegExp()
    this.value = this.getStringValue(this.dateValue)
    console.log(this.value)
  }

  getCurrentRegExp(): RegExp {
    let formatArray = this.format.split(SEPARATOR)
    let output: string = ""
    formatArray.forEach((f, i) => {
      output += formatMap[f].regExp
      if (i != formatArray.length - 1) output += SEPARATOR
    })
    return new RegExp(output)
  }
  getStringValue(value: string): string {
    this.internalValue = value
    if (this.inputMode == 'nano') {
      let nanoPart = value.slice(-9)
      let milisec = value.slice(0, -6)
      if (this.format.includes('n')) {
        let commonDate = this.datePipe.transform(milisec, this.format.slice(0, -10)) as string;
        return commonDate + ':' + nanoPart
      } else {
        return this.datePipe.transform(milisec, this.format) as string;
      }
    } else {
      if (this.format.includes('n')) {
        let commonDate = this.datePipe.transform(value, this.format.slice(0, -10)) as string;
        return commonDate + ':' + '0'.repeat(9)
      } else {
        return this.datePipe.transform(value, this.format) as string
      }
    }
  }

  updateValue(event: KeyboardEvent) {
    console.log(event.code)
    let target = event.currentTarget as HTMLInputElement
    this.position = target.selectionStart as number
    if (/^[0-9]$/i.test(event.key)) {
      event.preventDefault()
      //ввод нового
      if (this.position == target.value.length) {
        if (this.format[this.position] == SEPARATOR && target.value[this.position] != SEPARATOR) {
          target.value = target.value.slice(0, this.position) + SEPARATOR + target.value.slice(this.position)
        }
        //редактирование
      } else if (this.position < target.value.length) {
        target.value = target.value.slice(0, this.position) + target.value.slice(this.position + 1)
      }
    } else if (event.key == 'Backspace') {
      event.preventDefault()
      if (target.value.length) {
        if (this.format[this.position] != SEPARATOR) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
        } else {
          target.value = target.value.slice(0, this.position) + SEPARATOR + target.value.slice(this.position)
        }
      }
    } else if (event.key == 'Delete') {
      event.preventDefault()
      if (target.value.length) {
        if (this.format[this.position] != SEPARATOR) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
        } else {
          target.value = target.value.slice(0, this.position) + SEPARATOR + target.value.slice(this.position)
        }
      }
    }

    if (target.value[this.position] == SEPARATOR) {
      target.setSelectionRange(this.position + 1, this.position + 1)
    } else {
      target.setSelectionRange(this.position, this.position)
    }

    if (event.key == 'ArrowRight') {
      if (target.value[this.position] == SEPARATOR) {
        target.setSelectionRange(this.position + 1, this.position + 1)
      }
    }
    if (event.key == 'ArrowLeft') {
      if (target.value[this.position] == SEPARATOR) {
        target.setSelectionRange(this.position - 1, this.position - 1)
      }
    }
    this.value = target.value
    this.updateInternalValue()
  }
  updateInternalValue() {
    let dp = this.value.split(SEPARATOR)
    let date = new Date(+dp[2], +dp[1] - 1, +dp[0], +dp[3], +dp[4], +dp[5])
    let numberDate = date.getTime()
    if (this.inputMode == 'nano') {
      numberDate = numberDate * Math.pow(10, 6)
      numberDate += +dp[6]
      this.internalValue = numberDate.toString()
    } else {
      this.internalValue = numberDate.toString()
    }
  }
}
