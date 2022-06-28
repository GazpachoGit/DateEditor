import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cycle-number-input',
  templateUrl: './cycle-number-input.component.html',
  styleUrls: ['./cycle-number-input.component.css']
})
export class CycleNumberInputComponent {
  private _maxValue: number
  private _minValue: number
  private _value: number
  @Input() maxLength: number
  @Input('max')
  set maxValue(value: number) {
    this._maxValue = Number(value) + 1
  }
  get maxValue() {
    return this._maxValue
  }
  @Input('min')
  set minValue(value: number) {
    this._minValue = Number(value) - 1
  }
  get minValue() {
    return this._minValue
  }
  @Output() valueChange = new EventEmitter();
  @Output() blur = new EventEmitter()
  @Input()
  set value(num: number) {
    if (!num) {
      this._value = this._minValue + 1
    } else {
      this._value = Number(num)
    }
    this.valueChange.emit(this._value)
  }
  get value() {
    return this._value
  }
  onInput() {
    if (this.value >= this.maxValue) {
      this.value = this.minValue + 1
    }
    if (this.value <= this.minValue) {
      this.value = this.maxValue - 1
    }
  }
  onBlur() {
    this.blur.emit()
  }
  onMouseWheel(e: Event) { }
}
