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

  updateValue(event: KeyboardEvent) {
    console.log(event.code)
    let target = event.currentTarget as HTMLInputElement
    this.position = target.selectionStart as number
    if (/^[0-9]$/i.test(event.key)) {
      event.preventDefault()
      event.stopPropagation()
      // //ввод нового
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
      event.stopPropagation()
      if (target.value.length) {
        if (this.format[this.position] != SEPARATOR) {
          target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
        } else {
          target.value = target.value.slice(0, this.position) + SEPARATOR + target.value.slice(this.position)
        }
      }
    } else if (event.key == 'Delete') {
      event.preventDefault()
      event.stopPropagation()
      if (target.value.length) {
        if (this.format[this.position + 1] != SEPARATOR) {
          target.value = target.value.slice(0, this.position + 1) + "0" + target.value.slice(this.position + 1)
        } else {
          target.value = target.value.slice(0, this.position + 1) + SEPARATOR + target.value.slice(this.position + 1)
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

    // //ввод нового
    // if (this.position == target.value.length) {
    //   if (this.format[this.position] == SEPARATOR && target.value[this.position] != SEPARATOR) {
    //     target.value = target.value.slice(0, this.position) + SEPARATOR + target.value.slice(this.position)
    //   }
    // }
    // //редактирование
    // if (this.position < target.value.length) {
    //   if (this.format[this.position] != SEPARATOR) {
    //     target.value = target.value.slice(0, this.position) + "0" + target.value.slice(this.position)
    //   } else {
    //     target.value = target.value.slice(0, this.position) + target.value.slice(this.position + 1)
    //   }
    // }
    // this.value = target.value
  }

  // ngAfterViewChecked() {
  //   let el = this._textArea.nativeElement as HTMLInputElement
  //   if (this.value[this.position] == SEPARATOR) {
  //     el.setSelectionRange(this.position + 1, this.position + 1)
  //   } else {
  //     el.setSelectionRange(this.position, this.position)
  //   }
  // }

}
