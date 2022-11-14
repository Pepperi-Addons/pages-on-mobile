import { IBlockLoaderData } from '@pepperi-addons/ngx-lib/remote-loader';
import relations from './relations.json'
export class AddonBlockService {
    getBlockLoaderData(blockName: string): IBlockLoaderData{
        const relation =  relations.find(r => r.RelationName == 'AddonBlock' && r.Name == blockName);
        const pagesLoaderData: IBlockLoaderData = {
            addon: {} as any,
            addonPublicBaseURL: this.getPublicBaseURL(blockName), // need to know which addon (and version) file to load, taken from installed addon
            relation: relation as any
        };
        return pagesLoaderData
    }

    getPublicBaseURL(blockName: string){
        let publicBaseURL = '';
        switch (blockName) {
            case 'Pages':
                // publicBaseURL = `http://localhost:8088/files/Pages/Addon/Public/${pageBuilderUUID}/`; // offline pages
                publicBaseURL = "https://cdn.pepperi.com/Addon/Public/50062e0c-9967-4ed4-9102-f2bc50602d41/0.8.5/"; // online
                break;
            case 'ResourceSelection': 
                publicBaseURL = "https://cdn.pepperi.com/Addon/Public/0e2ae61b-a26a-4c26-81fe-13bdd2e4aaa3/0.0.151/"; // resource list
                break;
            default:
                break;
        }

        return publicBaseURL
    }

}