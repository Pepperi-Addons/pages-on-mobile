import { Component, OnDestroy, OnInit } from '@angular/core';
import { PepHttpService, PepAddonService, PepCustomizationService, PepLoaderService } from '@pepperi-addons/ngx-lib';
import { IBlockLoaderData, PepRemoteLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
import { Relation } from '@pepperi-addons/papi-sdk';
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

    onHostEventsCallback: (event: CustomEvent) => void;

    constructor(
        private httpService: PepHttpService,
        private addonService: PepAddonService,
        private customizationService: PepCustomizationService,
        private loaderService: PepLoaderService,
        private remoteLoaderService: PepRemoteLoaderService
    ) {
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
        // TODO:
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
            await this.nativeBridge('emit-event', e.detail);
        }, false)
        
        await this.setAccessToken();
        const pageKey = await this.nativeBridge('getPageKey');
        const pageParams = JSON.parse(await this.nativeBridge('getPageParams'));
        
        await this.setTheme();
        
        this.hostObject = { 
            pageKey: pageKey,
            pageParams: pageParams,
            offline: true,
        };
        // const moduleName = 'PageBuilderModule';
        
        //offline
        
        // TODO: 
        // const pagesRelation = Get the Addon block pages relation. (Name = 'Pages', RelationName = "AddonBlock")
        const fileName =  'page_builder'; 
        const name = 'Pages';
        const blockName = 'PageBuilder';
        const pageBuilderUUID = '50062e0c-9967-4ed4-9102-f2bc50602d41'; // TODO: Get the pages addon uuid from the relation.

        const pagesRelation: Relation = {
            RelationName: "AddonBlock",
            Name: name,
            Description: `${name} addon block`,
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: pageBuilderUUID,
            AddonRelativeURL: fileName,
            ComponentName: `${blockName}Component`,
            ModuleName: `${blockName}Module`,
            ElementsModule: 'WebComponents',
            ElementName: `pages-element-${pageBuilderUUID}`,
        }; 

        const publicBaseURL = `http://localhost:8088/files/Pages/Addon/Public/${pageBuilderUUID}/`;

        // this.addonService.setAddonStaticFolder(publicBaseURL);
        
        const pagesLoaderData: IBlockLoaderData = {
            addon: null,
            addonPublicBaseURL: publicBaseURL,
            relation: pagesRelation
        };
        this.remoteModuleOptions = this.remoteLoaderService.getRemoteLoaderOptions(pagesLoaderData)

        // Old code removed in upgrade to NG14.
        // this.remoteModuleOptions = {
        //     addonId: pageBuilderUUID,
        //     remoteEntry: `${publicBaseURL}${fileName}.js`,
        //     remoteName: fileName,
        //     exposedModule: `./${moduleName}`,
        //     componentName: 'PageBuilderComponent',
        // }
    }

    ngOnInit() {
        this.checkOnline();
    }

    ngOnDestroy() {
        clearTimeout(this.accessTokenTimeout);
    }
}