import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppDateEditorComponent } from './app-date-editor/app-date-editor.component';
import { DatePipe } from '@angular/common';
import { DatePickerComponent } from './date-picker/date-picker.component';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    AppDateEditorComponent,
    DatePickerComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
