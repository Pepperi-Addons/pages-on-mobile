import { Component, OnDestroy, OnInit } from '@angular/core';
import { PepHttpService, PepAddonService, PepCustomizationService, PepLoaderService } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
import { TestHelper } from './test-helper'
import { AddonBlockService } from './addon-block-service'

@Component({
    selector: 'addon-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    remoteModuleOptions: any;
    hostObject: any = {}
    blockName: string
    params: any
    callbackMap: { [key: string]: (res: any) => void } = {}
    showLoader = false;
    loadingError: boolean = false;
    accessTokenTimeout: number = 0;
    blockLoaderService: AddonBlockService
    onHostEventsCallback: (event: CustomEvent) => void;

    constructor(
        private httpService: PepHttpService,
        private addonService: PepAddonService,
        private customizationService: PepCustomizationService,
        private loaderService: PepLoaderService,
        private remoteLoaderService: PepRemoteLoaderService,
        private pepService: PepHttpService,
    ) {
        this.blockLoaderService = new AddonBlockService();

        // NOTE!!! FOR TESTING - uncomment the line bellow
        // new TestHelper(pepService)

        this.loaderService.onChanged$.subscribe((show) => {
            this.showLoader = show;
        });
        
        this.onHostEventsCallback = (event: CustomEvent) => {
            this.onHostEvents(event.detail);
        }

        window['nativeBridgeCallback'] = (res) => {
            const callbackKey = res.callbackKey;
            const callback = this.callbackMap[callbackKey]
            if (callback) {
                callback(res.data);
                this.callbackMap[callbackKey] = undefined;
            }
        }
    }
    
    onHostEvents(event) {
        this.nativeBridge('onHostEvents', event);
        // debugger;
    }

    onElementLoad(event) {
        // TODO:
        // debugger;

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
            await this.handleEmitEvent(e);
        }, false)
        
        await this.setAccessToken();
        await this.setTheme();
        this.hostObject = JSON.parse(await this.nativeBridge('getHostObject'));
        this.blockName = await this.nativeBridge('getBlockName')
        // const blockLoaderData = this.blockLoaderService.getBlockLoaderData('Pages');
        const blockLoaderData = this.blockLoaderService.getBlockLoaderData(this.blockName);
        this.remoteModuleOptions = this.remoteLoaderService.getRemoteLoaderOptions(blockLoaderData)
        console.log("remoteModuleOptions", JSON.stringify(this.remoteModuleOptions));

    }

    async handleEmitEvent(e: CustomEvent) {
            // finish client-action completion
            const {
                completion,
                ...detail
             } = e.detail;
            let ans = await this.nativeBridge('emit-event', detail);
            const parsedAns = JSON.parse(ans);
            completion(parsedAns);
    }

    ngOnInit() {
        this.checkOnline();
    }

    ngOnDestroy() {
        clearTimeout(this.accessTokenTimeout);
    }
}