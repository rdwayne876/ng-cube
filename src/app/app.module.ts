import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RubiksCubeComponent } from './rubiks-cube/rubiks-cube.component';

@NgModule({
  declarations: [
    AppComponent,
    RubiksCubeComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
