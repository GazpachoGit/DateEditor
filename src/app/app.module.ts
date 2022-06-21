import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppDateEditorComponent } from './app-date-editor/app-date-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    AppDateEditorComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
