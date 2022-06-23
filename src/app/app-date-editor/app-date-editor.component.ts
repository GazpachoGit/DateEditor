import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { analizeFormat, FormatElement, formatMap, IFormatMap, SEPARATOR, SEPARATOR_TYPE } from './app-date-editor.model';
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
      return this.datePipe.transform(milisec, this.format) as string;
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
    if (!this.value.length) this.inValidFormats = []
    // if (this.doValidation()) {
    //   this.updateInternalValue()
    //   this.isValid = true
    // } else {
    //   this.internalValue = null
    //   this.isValid = false
    // }

  }
  private updateCaretPostion(target: HTMLInputElement, position: number) {
    let nextPos = position + 1
    if (this.formatArray[nextPos].type == SEPARATOR_TYPE) {
      target.setSelectionRange(nextPos + this.formatArray[nextPos].separatorLength, nextPos + this.formatArray[nextPos].separatorLength)
    } else {
      target.setSelectionRange(nextPos, nextPos)
    }
  }
  updateInternalValue() {
    let dp = this.value.split(SEPARATOR)
    if (dp.length > 2) {
      let date = new Date(+dp[2], +dp[1] - 1, +dp[0], +dp[3] || 0, +dp[4] || 0, +dp[5] || 0)
      let numberDate = date.getTime()
      if (this.inputMode == 'nano' && dp[6]) {
        let stringDate = numberDate.toString().slice(0, -3)
        stringDate += +dp[6]
        this.internalValue = stringDate
      } else {
        this.internalValue = numberDate.toString()
      }
    } else {
      this.internalValue = null
    }

  }
  doValidationOfFormatSection(value: string) {
    let positionFormat = this.formatArray[this.position]
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
