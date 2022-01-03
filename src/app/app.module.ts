import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PepAddonService, PepFileService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button'
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
        PepAddonLoaderModule,
        PepButtonModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}