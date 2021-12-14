import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Routes, NavigationEnd } from '@angular/router';
import { PepHttpService, PepUtilitiesService, PepAddonService } from '@pepperi-addons/ngx-lib';
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

    constructor(
        private httpService: PepHttpService,
        private route: ActivatedRoute,
        private _router: Router,
    ) {
    }

    private async getAddon(addonUUID): Promise<any> {
        return await this.httpService.getPapiApiCall(`/addons/installed_addons/${addonUUID}`).toPromise();
    }

    private async initPage() {
        const pageBuilderUUID = '50062e0c-9967-4ed4-9102-f2bc50602d41';
        const pbAddon: any = await this.getAddon(pageBuilderUUID);

        if (pbAddon) {
            const pageKey = this.route.snapshot.queryParamMap.get('page_key') || '';
            console.log('pageKey', pageKey);
            const moduleName = 'PageBuilderModule';
            const fileName = 'addon';

            this.remoteModuleOptions ={

                // key: '',
    
                addonId: pageBuilderUUID,
    
                remoteEntry: `${pbAddon.PublicBaseURL}${fileName}.js`,
    
                remoteName: fileName,
    
                exposedModule: `./${moduleName}`,
    
                componentName: 'PageBuilderComponent',
    
            } as any
        }
    }

    ngOnInit() {
        this.initPage();
    }
}
