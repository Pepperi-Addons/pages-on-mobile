import { Component, EventEmitter, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Routes, NavigationEnd } from '@angular/router';
import { PepHttpService, PepUtilitiesService, PepAddonService, PepEncodePipe } from '@pepperi-addons/ngx-lib';
import { routes } from './app.routes';

import { loadRemoteModule, LoadRemoteModuleOptions } from '@angular-architects/module-federation';

export type Microfrontend = LoadRemoteModuleOptions & {
    routePath: string;
    routeData?: any;
    ngModuleName: string;
}

@Component({
    selector: 'addon-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    remoteModuleOptions: LoadRemoteModuleOptions;
    hostObject: any = {}
    params: any
    callbackMap: { [key: string]: (res: any) => void } = {}

    constructor(
        private httpService: PepHttpService,
        private addonService: PepAddonService,
        private route: ActivatedRoute,
        private _router: Router,
        private zone: NgZone
    ) {
         window['nativeBridgeCallback'] = (res) => {
            const callbackKey = res.callbackKey;
            const callback = this.callbackMap[callbackKey]
            if (callback) {
                callback(res.data);
                this.callbackMap[callbackKey] = undefined;
            }
         }
    }

    private async getAddon(addonUUID): Promise<any> {
        return await this.httpService.getPapiApiCall(`/addons/installed_addons/${addonUUID}`).toPromise();
    }

    nativeBridge(key: string, data: any = undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            const callbackKey = Date.now();
            
            this.callbackMap[callbackKey] = (res) => {
                resolve(res)
            }

            (window as any).nativeBridge({
                key: key,
                data: data,
                callbackKey: callbackKey
            })
        });
    }

    async setAccessToken() {
        const accessToken = await this.nativeBridge('getAccessToken');
        window.sessionStorage.setItem('idp_token',accessToken)

        //update accessToken when it expires 
        const decodedJWT= await JSON.parse(atob(accessToken.split('.')[1]));
        let timeToUpdate = (decodedJWT.exp * 1000) - Date.now()
        setTimeout(() => {
            console.log('updating access token')
             this.setAccessToken();
        },timeToUpdate);
    }

    async initPage() {
        window.addEventListener('emit-event', (e: CustomEvent) => {
            console.log(e.detail);
        }, false)
        await this.setAccessToken();
        const pageKey = await this.nativeBridge('getPageKey');

        const pageBuilderUUID = '50062e0c-9967-4ed4-9102-f2bc50602d41';
        const pbAddon: any = await this.getAddon(pageBuilderUUID);
        if (pbAddon) {
            this.route.queryParams.subscribe(params=> {
                this.hostObject = { pageKey: pageKey };
                const moduleName = 'PageBuilderModule';
                const fileName = 'addon';
                this.addonService.setAddonStaticFolder(pbAddon.PublicBaseURL);
                this.remoteModuleOptions ={

                    // key: '',
        
                    addonId: pageBuilderUUID,
        
                    remoteEntry: `${pbAddon.PublicBaseURL}${fileName}.js`,
        
                    remoteName: fileName,
        
                    exposedModule: `./${moduleName}`,
        
                    componentName: 'PageBuilderComponent',
        
                } as any
            })
        }
    }

    ngOnInit() {
        this.initPage()
    }
}
