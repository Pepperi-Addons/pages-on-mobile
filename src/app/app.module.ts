import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepAddonLoaderModule } from '@pepperi-addons/ngx-remote-loader';

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
        PepAddonLoaderModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}