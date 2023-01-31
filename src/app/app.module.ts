import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [	
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        PepNgxLibModule,
        PepRemoteLoaderModule,
        PepSizeDetectorModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}