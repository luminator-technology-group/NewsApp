import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { SubtitleComponent } from './subtitle/subtitle.component';
import { TitileComponent } from './titile/titile.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { QRCodeModule } from 'angularx-qrcode';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { TypeComponent } from './type/type.component';
import { StopListComponent } from './stop-list/stop-list.component';

@NgModule({
  declarations: [
    AppComponent,
    QrCodeComponent,
    SubtitleComponent,
    TitileComponent,
    TypeComponent,
    StopListComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    HttpClientModule,
    QRCodeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
