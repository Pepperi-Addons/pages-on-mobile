import { Component, OnDestroy, OnInit } from '@angular/core';
import { PepHttpService, PepAddonService, PepCustomizationService, PepLoaderService } from '@pepperi-addons/ngx-lib';

@Component({
    selector: 'addon-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    remoteModuleOptions: any;
    hostObject: any = {}
    params: any
    callbackMap: { [key: string]: (res: any) => void } = {}
    showLoader = false;
    loadingError: boolean = false;
    accessTokenTimeout: number = 0;

    constructor(
        private httpService: PepHttpService,
        private addonService: PepAddonService,
        private customizationService: PepCustomizationService,
        private loaderService: PepLoaderService
    ) {
        this.loaderService.onChanged$.subscribe((show) => {
            this.showLoader = show;
        });
        
        window['nativeBridgeCallback'] = (res) => {
            const callbackKey = res.callbackKey;
            const callback = this.callbackMap[callbackKey]
            if (callback) {
                callback(res.data);
                this.callbackMap[callbackKey] = undefined;
            }
        }
    }

    async checkOnline() {
        try {
            this.loaderService.show();
            await this.initPage();
            this.loaderService.hide();
            this.loadingError = false;
        }
        catch (err) {
            this.loaderService.hide();
            this.loadingError = true;
            console.log(err);
        }
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
        // cancel any exiting timeouts
        clearTimeout(this.accessTokenTimeout);

        // get the access token from the bridge
        const accessToken = await this.nativeBridge('getAccessToken');

        window.sessionStorage.setItem('idp_token',accessToken)

        // update accessToken when it expires 
        const decodedJWT= await JSON.parse(atob(accessToken.split('.')[1]));
        let timeToUpdate = (decodedJWT.exp * 1000) - Date.now()

        this.accessTokenTimeout = setTimeout(async () => {
            console.log('updating access token')
            await this.setAccessToken();
        }, timeToUpdate);
    }

    private async getTheme() {
        let res = { resultObject: undefined};
        try {
            res = await this.httpService.getPapiApiCall(`/addons/api/95501678-6687-4fb3-92ab-1155f47f839e/themes/css_variables`).toPromise();    
        } catch (error) {
            console.error('getTheme error', error);
        }
        return res;
    }

    async setTheme() {
        const themeVars = await this.getTheme();
        this.customizationService.setThemeVariables(themeVars.resultObject);
    }

    async initPage() {
        window.addEventListener('emit-event', async (e: CustomEvent) => {
            await this.nativeBridge('emit-event', e.detail);
        }, false)
        
        await this.setAccessToken();
        const pageKey = await this.nativeBridge('getPageKey');
        const pageParams = JSON.parse(await this.nativeBridge('getPageParams'));
        
        await this.setTheme();
        const pageBuilderUUID = '50062e0c-9967-4ed4-9102-f2bc50602d41';
        
        this.hostObject = { 
            pageKey: pageKey,
            pageParams: pageParams,
            offline: true,
        };
        const moduleName = 'PageBuilderModule';
        
        //offline
        const fileName =  'page_builder'; 
        const publicBaseURL = `http://localhost:8088/files/Pages/Addon/Public/${pageBuilderUUID}/`;
        
        this.addonService.setAddonStaticFolder(publicBaseURL);


        this.remoteModuleOptions = {

            addonId: pageBuilderUUID,

            remoteEntry: `${publicBaseURL}${fileName}.js`,

            remoteName: fileName,

            exposedModule: `./${moduleName}`,

            componentName: 'PageBuilderComponent',

        }
        
    }

    ngOnInit() {
        this.checkOnline();
    }

    ngOnDestroy() {
        clearTimeout(this.accessTokenTimeout);
    }
}