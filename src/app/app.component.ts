import { Component, OnDestroy, OnInit } from '@angular/core';
import { PepHttpService, PepAddonService, PepCustomizationService, PepLoaderService } from '@pepperi-addons/ngx-lib';
import { IBlockLoaderData, PepRemoteLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
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
                const decodedData = this.decodeFromBase64(res.data);
                callback(decodedData);
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
        let timeToUpdate = 500; // 500ms by default
        // cancel any exiting timeouts
        clearTimeout(this.accessTokenTimeout);

        // get the access token from the bridge
        const accessToken = await this.nativeBridge('getAccessToken');

        window.sessionStorage.setItem('idp_token', accessToken)
        
        try {
            // update accessToken when it expires 
            const decodedJWT= await JSON.parse(atob(accessToken.split('.')[1]));  
            // check if the token is expired
            if (decodedJWT.exp * 1000 < Date.now()) {
                console.log('access token is expired');
                timeToUpdate = 1000; // 1000ms
            } else {
                timeToUpdate = (decodedJWT.exp * 1000) - Date.now()
            }
            
            this.accessTokenTimeout = setTimeout(async () => {
                console.log('updating access token')
                await this.setAccessToken();
            }, timeToUpdate);
        } catch (error) {
            // it the app is offline, the token will be an empty string and can't be decoded
            console.error('error in setAccessToken', error);
            
        }
    }

    private async getAddonBlockLoaderData(blockName: string): Promise<IBlockLoaderData> {
        let res = {}        
        console.log('getAddonBlockLoaderData - blockName', blockName);
        const eventRes = await this.emitEvent('GetBlockLoaderData', {
            BlockType: 'AddonBlock',
            Name: blockName
        });
        console.log('getAddonBlockLoaderData', JSON.stringify(eventRes));
        if (eventRes) {
            res = eventRes;
        }
        return res as IBlockLoaderData;
    }

    private async getTheme() {        
        let res = { resultObject: undefined};
        try {
            console.log('getTheme');
            const themeRes = await this.emitEvent('GetThemeCssVariables')
            console.log('getTheme', themeRes);
            if (themeRes) {
                res.resultObject = themeRes;
            }
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
        // const blockLoaderData = this.blockLoaderService.getBlockLoaderData(this.blockName);
        const blockLoaderData = await this.getAddonBlockLoaderData(this.blockName);
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

    decodeFromBase64(str: string) {
        // check if str is not empty and is a string
        let res = str;
        if (str && typeof str === 'string') { 
            res =  atob(str);
        }
        return res;    
    }

    async emitEvent(event: string, data: any = {}) {
        const ans = await this.nativeBridge('emit-event', { eventKey: event, eventData: data });
        return JSON.parse(ans);
    }

    ngOnInit() {
        this.checkOnline();
    }

    ngOnDestroy() {
        clearTimeout(this.accessTokenTimeout);
    }
}