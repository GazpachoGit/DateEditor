import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { analizeFormat, FormatElement, formatMap, FORMAT_dd, FORMAT_hh, FORMAT_mm, FORMAT_MM, FORMAT_S, FORMAT_SS, FORMAT_ss, FORMAT_SSS, FORMAT_yy, FORMAT_yyyy, getCurrentRegExp, IClickPos, IFormatMap, SEPARATOR, SEPARATOR_TYPE } from './app-date-editor.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-editor',
  templateUrl: './app-date-editor.component.html',
  styleUrls: ['./app-date-editor.component.css']
})
export class AppDateEditorComponent {
  @ViewChild('textInput') _textArea: ElementRef;
  @Input('format') format: string
  @Input('value') dateValue: string
  @Input('mode') inputMode: string

  clickPosition: IClickPos

  value: string = ""
  position: number
  formatArray: Array<FormatElement>
  initFormatedValues: { [name: string]: number }
  regExp: RegExp
  showPicker = false
  internalValue: string | null
  // get internalValue(): string | null {
  //   if (!this.doFullValidation(this.value)) {
  //     return null
  //   }
  //   //апдейт измененых значений
  //   let currentFormatedDate = this.getCurrentFormatedDate(this.value)

  //   let newDate = new Date(currentFormatedDate[FORMAT_yyyy],
  //     currentFormatedDate[FORMAT_MM],
  //     currentFormatedDate[FORMAT_dd],
  //     currentFormatedDate[FORMAT_hh],
  //     currentFormatedDate[FORMAT_mm],
  //     currentFormatedDate[FORMAT_ss],
  //     currentFormatedDate[FORMAT_SSS]
  //   ).valueOf()
  //   //поправка на мили нано секунды
  //   let stringNewDate = newDate.toString()
  //   if (this.inputMode == 'nano') {
  //     stringNewDate += "000000"
  //   }
  //   return stringNewDate
  // }
  getInternalValue() {
    if (!this.doFullValidation(this.value)) {
      return null
    }
    //апдейт измененых значений
    let currentFormatedDate = this.getCurrentFormatedDate(this.value)

    let newDate = new Date(currentFormatedDate[FORMAT_yyyy],
      currentFormatedDate[FORMAT_MM],
      currentFormatedDate[FORMAT_dd],
      currentFormatedDate[FORMAT_hh],
      currentFormatedDate[FORMAT_mm],
      currentFormatedDate[FORMAT_ss],
      currentFormatedDate[FORMAT_SSS]
    ).valueOf()
    //поправка на мили нано секунды
    let stringNewDate = newDate.toString()
    if (this.inputMode == 'nano') {
      stringNewDate += "000000"
    }
    return stringNewDate
  }

  constructor(private datePipe: DatePipe) { }

  ngOnInit() {
    this.formatArray = analizeFormat(this.format)
    this.initFormatedValues = this.getInitialFormatedValues()
    this.regExp = getCurrentRegExp(this.formatArray)
    this.value = this.getStringValue(this.dateValue)
    this.internalValue = this.getInternalValue()
  }
  getCurrentFormatedDate(value: string) {
    let currentFormatedDate = { ...this.initFormatedValues }
    for (var pos of this.formatArray) {
      if (pos.type != SEPARATOR_TYPE && pos.innerIndex == 0) {
        if (pos.type == FORMAT_SSS || pos.type == FORMAT_SS || pos.type == FORMAT_S) {
          let sss_value = value.slice(pos.startIndex, pos.endIndex + 1)
          if (sss_value.length > 0) currentFormatedDate[FORMAT_SSS] = Number((sss_value + '000').match(/\d{3}/))
        } else if (pos.type == FORMAT_yy) {
          let yy_value = value.slice(pos.startIndex, pos.endIndex + 1)
          if (yy_value.length > 0) {
            let init_yy_value = currentFormatedDate[FORMAT_yyyy].toString()
            if (init_yy_value.length > 2) {
              currentFormatedDate[FORMAT_yyyy] = Number(init_yy_value.slice(0, 2) + yy_value)
            } else {
              currentFormatedDate[FORMAT_yyyy] = Number(yy_value)
            }
          }
        }
        else {
          let newValue = value.slice(pos.startIndex, pos.endIndex + 1)
          if (newValue.length)
            currentFormatedDate[pos.type] = Number(newValue)
        }
        if (pos.type == FORMAT_MM) {
          --currentFormatedDate[pos.type]
        }
      }
    }
    return currentFormatedDate
  }

  getStringValue(value: string): string {
    if (value) {
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
      if (formatPostion && formatPostion.localRegExp) {
        //валидный ввод
        if (formatPostion.localRegExp.test(event.data)) {
          //ввод нового
          if (this.position == target.value.length) {
            if (this.formatArray[this.position] && this.formatArray[this.position].type == SEPARATOR_TYPE) {
              updatedValue += this.formatArray[this.position].separator
            }
            //редактирование
          } else if (this.position - 1 < target.value.length) {
            if (this.formatArray[this.position - 1].type != SEPARATOR_TYPE) {
              updatedValue = target.value.slice(0, this.position) + target.value.slice(this.position + 1)
            }
          }
        } else {
          let sectionValue = this.value.slice(formatPostion.startIndex, formatPostion.endIndex + 1)
          if (formatPostion.innerIndex == 0 && sectionValue == '00') {
            let temp = [...this.value]
            temp[this.position] = event.data
            updatedValue = temp.join('')
            ++this.position
          } else {
            updatedValue = this.value
          }
        }
        //разделитель или конец строки
      } else {
        updatedValue = this.value
      }
      if (updatedValue.length > 0 && this.doValidationOfFormatSection(updatedValue, this.position - 1)) {
        target.value = this.convertToExistingDate(updatedValue, this.position - 1)
        this.updateCaretPostion(target, this.position)
      } else {
        target.value = this.value
        if (event.data != '0') target.setSelectionRange(this.position - 1, this.position - 1)
        else target.setSelectionRange(this.position, this.position)
      }
    } else if (event.inputType == 'deleteContentBackward') {
      if (this.value.length - target.value.length == 1) {
        if (this.formatArray[this.position].type != SEPARATOR_TYPE) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
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
        } else {
          target.value = this.value
        }
        target.setSelectionRange(this.position, this.position)
      } else if (target.value.length != 0) {
        target.value = this.value
      }
    } else {
      target.value = this.value
      target.setSelectionRange(this.position - 1, this.position - 1)
    }

    if (target.value != this.value) {
      this.value = target.value
      this.internalValue = this.getInternalValue()
    }
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
    if (!this.dateValue) {
      initDate = new Date()
    } else {
      if (this.inputMode == 'nano') {
        initDate = new Date(Number(this.dateValue.slice(0, -6)))
      } else {
        initDate = new Date(Number(this.dateValue))
      }
    }
    //получить массив значений

    let initFormatedValues: { [name: string]: number } = {
      [FORMAT_yyyy]: initDate.getFullYear(),
      [FORMAT_MM]: initDate.getMonth(),
      [FORMAT_dd]: initDate.getDate(),
      [FORMAT_hh]: initDate.getHours(),
      [FORMAT_mm]: initDate.getMinutes(),
      [FORMAT_ss]: initDate.getSeconds(),
      [FORMAT_SSS]: initDate.getMilliseconds()
    }
    return initFormatedValues
  }
  doFullValidation(value: string) {
    return this.regExp.test(value)
  }
  doValidationOfFormatSection(value: string, position: number): boolean {
    position = position == this.format.length - 1 ? position - 1 : position
    let positionFormat = this.formatArray[position]
    if (!positionFormat) return false
    let lastValue = value[positionFormat.endIndex]
    let isValid = true
    if (positionFormat.type != SEPARATOR_TYPE && lastValue) {
      let sectionValue = value.slice(positionFormat.startIndex, positionFormat.endIndex + 1)
      isValid = RegExp(positionFormat.formatRegExp as string).test(sectionValue)
    }
    return isValid
  }
  convertToExistingDate(value: string, postion: number) {
    let type = this.formatArray[postion].type
    if (type == FORMAT_dd || type == FORMAT_MM || type == FORMAT_yy || type == FORMAT_yyyy) {
      if (!value[this.formatArray[postion].endIndex]) return value
      let currentFormatedDate = this.getCurrentFormatedDate(value)
      let maxMonthDay = new Date(currentFormatedDate[FORMAT_yyyy], currentFormatedDate[FORMAT_MM] + 1, 0).getDate();
      if (currentFormatedDate[FORMAT_dd] > maxMonthDay) currentFormatedDate[FORMAT_dd] = maxMonthDay
      let newDate = new Date(currentFormatedDate[FORMAT_yyyy],
        currentFormatedDate[FORMAT_MM],
        currentFormatedDate[FORMAT_dd],
        currentFormatedDate[FORMAT_hh],
        currentFormatedDate[FORMAT_mm],
        currentFormatedDate[FORMAT_ss],
        currentFormatedDate[FORMAT_SSS]
      ).valueOf()
      let currentFormat = this.format.slice(0, value.length)
      return this.datePipe.transform(newDate, currentFormat) as string
    }
    return value

  }
  getSectionValue(value: string, sectionFormat: string) {
    let format = this.formatArray.find(f => f.type == sectionFormat)
    if (format) {
      let output = value.slice(format.startIndex, format.endIndex + 1)
      if (output.length) {
        return sectionFormat == FORMAT_yy ? Number(20 + output) : Number(output)
      }
    }
    return null
  }
  onPickerDateChange(event: string) {
    this.value = this.getStringValue(event)
    if (this.initFormatedValues[FORMAT_yyyy]) {
      this.initFormatedValues[FORMAT_yyyy] = this.inputMode == 'nano' ? (new Date(Number(event.slice(0, -6)))).getFullYear() : (new Date(Number(event))).getFullYear()
    }
    this.internalValue = this.getInternalValue()
  }
  showDatePicker(event: MouseEvent) {
    event.stopPropagation()
    if (!this.showPicker) {
      this.clickPosition = {
        clickX: event.clientX,
        clickY: event.clientY
      }
      this.showPicker = true
    } else {
      this.showPicker = false
    }
  }
  close() {
    this.showPicker = false
  }
}
