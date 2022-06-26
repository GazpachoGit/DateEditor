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

  updateValue(ev: Event) {
    let event = ev as InputEvent
    let target = event.currentTarget as HTMLInputElement
    this.position = target.selectionStart as number
    if (event.data && /^[0-9]$/i.test(event.data)) {
      let formatPostion = this.formatArray[this.position - 1]
      let updatedValue = target.value
      if (formatPostion && formatPostion.localRegExp && formatPostion.localRegExp.test(event.data)) {
        //ввод нового
        if (this.position == target.value.length) {
          if (this.formatArray[this.position].type == SEPARATOR_TYPE) {
            updatedValue += this.formatArray[this.position].separator
          }
          //редактирование
        } else if (this.position - 1 < target.value.length) {
          updatedValue = target.value.slice(0, this.position) + target.value.slice(this.position + 1)
        }

      }
      if (updatedValue.length > 0 && this.doValidationOfFormatSection(updatedValue, this.position - 1)) {
        target.value = updatedValue
        this.updateCaretPostion(target, this.position)
      } else {
        target.value = this.value
        target.setSelectionRange(this.position - 1, this.position - 1)
      }
    } else if (event.inputType == 'deleteContentBackward') {
      if (this.value.length - target.value.length == 1) {
        if (this.formatArray[this.position].type != SEPARATOR_TYPE) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
          this.doValidationOfFormatSection(target.value, this.position)
        } else {
          target.value = this.value
        }
        this.updateCaretPostion(target, this.position, true)
      } else if (target.value.length != 0) {
        target.value = this.value
      }
    } else if (event.inputType == 'deleteContentForward') {
      if (this.value.length - target.value.length == 1) {
        if (this.formatArray[this.position].type != SEPARATOR_TYPE) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
          this.doValidationOfFormatSection(target.value, this.position)
        } else {
          target.value = this.value
        }
        target.selectionStart = this.position
      } else if (target.value.length != 0) {
        target.value = this.value
      }
    } else {
      target.value = this.value
      target.setSelectionRange(this.position - 1, this.position - 1)
    }

    this.value = target.value
    this.updateInternalValue()
    if (!this.value.length) this.inValidFormats = []
  }
  onNavigation(event: KeyboardEvent) {
    let target = event.currentTarget as HTMLInputElement
    this.position = target.selectionStart as number
    if (event.key == 'ArrowRight') {
      let prevPos = this.position - 1
      if (this.formatArray[prevPos].type == SEPARATOR_TYPE) {
        target.setSelectionRange(prevPos + this.formatArray[prevPos].separatorLength, prevPos + this.formatArray[prevPos].separatorLength)
      }
    }
    if (event.key == 'ArrowLeft') {
      let prevPos = this.position + 1
      if (this.formatArray[this.position].type == SEPARATOR_TYPE) {
        target.setSelectionRange(prevPos - this.formatArray[this.position].separatorLength, prevPos - this.formatArray[this.position].separatorLength)
      }
    }
  }
  private updateCaretPostion(target: HTMLInputElement, nextPos: number, left?: boolean) {
    if (this.formatArray[nextPos] && this.formatArray[nextPos].type == SEPARATOR_TYPE) {
      left ? nextPos -= this.formatArray[nextPos].separatorLength - 1 : nextPos += this.formatArray[nextPos].separatorLength
    }
    target.setSelectionRange(nextPos, nextPos)
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
  //Можно сделать геттер на internalValue
  // date picker будет изменять this.value
  updateInternalValue() {
    if (!this.doFullValidation(this.value)) {
      this.internalValue = ""
      return
    }
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
    let sss_value: string = ''
    let sss_position = this.formatArray.find(f => f.type == FORMAT_SSS)
    if (sss_position) {
      sss_value = this.value.slice(sss_position.startIndex, sss_position.endIndex + 1)
    }
    let stringNewDate = newDate.toString().slice(0, -3)
    if (sss_value.length > 0) {
      stringNewDate += sss_value

    } else {
      stringNewDate += this.inputMode == 'nano' ? this.dateValue.slice(-9, -6) : this.dateValue.slice(-3)
    }
    if (this.inputMode == 'nano') stringNewDate += this.dateValue.slice(-6)
    this.internalValue = stringNewDate
  }
  doFullValidation(value: string) {
    return this.regExp.test(value)
  }
  doValidationOfFormatSection(value: string, position: number): boolean {
    position = position == this.format.length ? position - 1 : position
    let positionFormat = this.formatArray[position]
    let lastValue = value[positionFormat.endIndex]
    let isValid = true
    if (positionFormat.type != SEPARATOR_TYPE && lastValue) {
      let sectionValue = value.slice(positionFormat.startIndex, positionFormat.endIndex + 1)
      isValid = RegExp(positionFormat.formatRegExp as string).test(sectionValue)
    }
    return isValid
  }
}
