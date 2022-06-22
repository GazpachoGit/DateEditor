import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { formatMap, IFormatMap, SEPARATOR } from './app-date-editor.model';

@Component({
  selector: 'app-date-editor',
  templateUrl: './app-date-editor.component.html',
  styleUrls: ['./app-date-editor.component.css']
})
//TODO
//игнорировать delete и backspace буквы и прочее
export class AppDateEditorComponent {
  @ViewChild('textInput') _textArea: ElementRef;
  value: string = "21:06:2022"
  position: number
  regExp: RegExp

  @Input('format') format: string
  ngInit() {
    let formatArray = this.format.split(SEPARATOR)
    let output: string = ""
    formatArray.forEach((f, i) => {
      output += formatMap[f].regExp
      if (i != formatArray.length - 1) output += SEPARATOR
    })
    this.regExp = new RegExp(output)
  }

  updateValue(event: Event) {
    let target = event.currentTarget as HTMLInputElement
    this.position = target.selectionStart as number
    if (target.value.length > this.format.length) {
      target.value = target.value.slice(0, this.position) + target.value.slice(this.position + 1)
      this.value = target.value
    } else {
      if (this.format[this.position] == SEPARATOR && target.value[this.position] != SEPARATOR) {
        target.value = target.value.slice(0, this.position) + SEPARATOR + target.value.slice(this.position)
      }
      this.value = target.value
    }

  }

  ngAfterViewChecked() {
    let el = this._textArea.nativeElement as HTMLInputElement
    if (this.value[this.position] == SEPARATOR) {
      el.setSelectionRange(this.position + 1, this.position + 1)
    } else {
      el.setSelectionRange(this.position, this.position)
    }
  }

}
