import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { analizeFormat, FormatElement, formatMap, FORMAT_dd, FORMAT_hh, FORMAT_mm, FORMAT_MM, FORMAT_ss, FORMAT_SSS, FORMAT_yyyy, IFormatMap, SEPARATOR, SEPARATOR_TYPE } from './app-date-editor.model';
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
  private _format: string
  value: string = ""
  internalValue: string | null = null
  position: number
  formatArray: Array<FormatElement>
  initFormatedValues: { [name: string]: number }
  regExp: RegExp
  inValidFormats: string[] = []
  get invalidMessage() {
    return `invalid sections: ${this.inValidFormats.join(',')}`
  }
  @Input('format')
  set format(value: string) {
    this._format = value
  }
  get format() {
    return this._format
  }
  @Input('value') dateValue: string
  @Input('mode') inputMode: string

  constructor(private datePipe: DatePipe) { }

  ngOnInit() {
    this.formatArray = analizeFormat(this.format)
    this.initFormatedValues = this.getInitialFormatedValues()
    this.regExp = this.getCurrentRegExp()
    this.value = this.getStringValue(this.dateValue)
  }

  getCurrentRegExp(): RegExp {
    let output: string = ""
    this.formatArray.forEach(f => {
      if (f.type != SEPARATOR_TYPE && f.innerIndex == 0) {
        output += `${f.formatRegExp}${f.separator}`
      }
    })
    return new RegExp(output)
  }
  getStringValue(value: string): string {
    if (value) {
      this.internalValue = value
      let milisec = value
      if (this.inputMode == 'nano') {
        milisec = value.slice(0, -6)
      }
      return this.datePipe.transform(Number(milisec), this.format) as string;
    }
    return ""
  }

  updateValue(event: KeyboardEvent) {
    event.preventDefault()
    let target = event.currentTarget as HTMLInputElement
    this.position = target.selectionStart as number
    if (/^[0-9]$/i.test(event.key)) {
      let formatPostion = this.formatArray[this.position]
      if (formatPostion && formatPostion.localRegExp && formatPostion.localRegExp.test(event.key)) {
        //ввод нового
        if (this.position == target.value.length) {
          if (target.value.length == this.format.length) return
          target.value += event.key
          let position = this.position + 1
          if (this.formatArray[position].type == SEPARATOR_TYPE) {
            target.value += this.formatArray[position].separator
          }
          //редактирование
        } else if (this.position < target.value.length) {
          console.log(target.value.slice(0, this.position))
          console.log(target.value.slice(this.position))
          target.value = target.value.slice(0, this.position) + event.key + target.value.slice(this.position + 1)
        }
        this.doValidationOfFormatSection(target.value)
        this.updateCaretPostion(target, this.position)
      }

    } else if (event.key == 'Backspace') {
      if (<number>target.selectionEnd == <number>target.selectionStart) {
        if (this.position != 0 && this.formatArray[this.position - 1].type != SEPARATOR_TYPE) {
          target.value = target.value.slice(0, this.position - 1) + "0" + target.value.slice(this.position)
          this.doValidationOfFormatSection(target.value)
          target.setSelectionRange(this.position - 1, this.position - 1)
        }
      } else {
        target.value = target.value.slice(0, <number>target.selectionStart) + target.value.slice(<number>target.selectionEnd)
      }
    } else if (event.key == 'Delete') {
      if (<number>target.selectionEnd == <number>target.selectionStart) {
        if (this.formatArray[this.position].type != SEPARATOR_TYPE) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position + 1)
          this.doValidationOfFormatSection(target.value)
          target.setSelectionRange(this.position, this.position)
        }
      } else {
        target.value = target.value.slice(0, <number>target.selectionStart) + target.value.slice(<number>target.selectionEnd)
      }
    }

    if (event.key == 'ArrowRight') {
      let nextPos = this.position + 1
      if (this.formatArray[this.position].type == SEPARATOR_TYPE) {
        target.setSelectionRange(this.position + this.formatArray[this.position].separatorLength, this.position + this.formatArray[this.position].separatorLength)
      } else {
        target.setSelectionRange(nextPos, nextPos)
      }
    }
    if (event.key == 'ArrowLeft') {
      let nextPos = this.position - 1
      if (this.formatArray[nextPos].type == SEPARATOR_TYPE) {
        target.setSelectionRange(this.position - this.formatArray[nextPos].separatorLength, this.position - this.formatArray[nextPos].separatorLength)
      } else {
        target.setSelectionRange(nextPos, this.position)
      }
    }
    this.value = target.value
    this.updateInternalValue()
    if (!this.value.length) this.inValidFormats = []
  }
  private updateCaretPostion(target: HTMLInputElement, position: number) {
    let nextPos = position + 1
    if (this.formatArray[nextPos] && this.formatArray[nextPos].type == SEPARATOR_TYPE) {
      target.setSelectionRange(nextPos + this.formatArray[nextPos].separatorLength, nextPos + this.formatArray[nextPos].separatorLength)
    } else {
      target.setSelectionRange(nextPos, nextPos)
    }
  }
  private getInitialFormatedValues(): { [name: string]: number } {
    let initDate: Date
    if (this.inputMode == 'nano') {
      initDate = new Date(Number(this.dateValue.slice(0, -6)))
    } else {
      initDate = new Date(Number(this.dateValue))
    }
    //получить массив значений

    let initFormatedValues: { [name: string]: number } = {
      [FORMAT_yyyy]: initDate.getFullYear(),
      [FORMAT_MM]: initDate.getMonth(),
      [FORMAT_dd]: initDate.getDate(),
      [FORMAT_hh]: initDate.getHours(),
      [FORMAT_mm]: initDate.getMinutes(),
      [FORMAT_ss]: initDate.getSeconds()
    }
    return initFormatedValues
  }
  updateInternalValue() {
    //апдейт измененых значений
    let currentFormatedDate = { ...this.initFormatedValues }
    for (var pos of this.formatArray) {
      if (pos.type != SEPARATOR_TYPE && pos.innerIndex == 0) {
        currentFormatedDate[pos.type] = Number(this.value.slice(pos.startIndex, pos.endIndex + 1))
        if (pos.type == FORMAT_MM) {
          --currentFormatedDate[pos.type]
        }
      }
    }
    let newDate = new Date(currentFormatedDate[FORMAT_yyyy],
      currentFormatedDate[FORMAT_MM],
      currentFormatedDate[FORMAT_dd],
      currentFormatedDate[FORMAT_hh],
      currentFormatedDate[FORMAT_mm],
      currentFormatedDate[FORMAT_ss],
    ).valueOf()
    //поправка на мили нано секунды
    let sss_position = this.formatArray.find(f => f.type == FORMAT_SSS)
    if (sss_position) {
      let sss_value = Number(this.value.slice(sss_position.startIndex, sss_position.endIndex + 1))
      newDate > 0 ? newDate += sss_value : newDate -= sss_value
    }
    let stringNewDate = newDate.toString()
    if (this.inputMode == 'nano') stringNewDate += this.dateValue.slice(-6)
    this.internalValue = stringNewDate
  }
  doValidationOfFormatSection(value: string) {
    let position = this.position == this.format.length ? this.position - 1 : this.position
    let positionFormat = this.formatArray[position]
    let lastValue = value[positionFormat.endIndex]
    if (positionFormat.type != SEPARATOR_TYPE && lastValue) {
      let sectionValue = value.slice(positionFormat.startIndex, positionFormat.endIndex + 1)
      let isValid = RegExp(positionFormat.formatRegExp as string).test(sectionValue)
      if (!isValid) {
        if (!this.inValidFormats.includes(positionFormat.type)) {
          this.inValidFormats.push(positionFormat.type)
        }
      } else {
        let i = this.inValidFormats.indexOf(positionFormat.type)
        if (i != -1) {
          this.inValidFormats.splice(i, 1)
        }
      }
    }
  }
  onSelect(event: Event) {
    let target = event.target as HTMLInputElement
    let start = target.selectionStart as number
    let end = target.selectionEnd as number
    if (end - start != target.value.length) target.setSelectionRange(target.selectionStart, target.selectionStart)
  }
}
