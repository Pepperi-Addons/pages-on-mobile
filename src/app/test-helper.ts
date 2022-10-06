import { PepHttpService } from '@pepperi-addons/ngx-lib';

export class TestHelper {
    pageParams = {a:1}
    getPageKey = '7981a1e2-b8e8-4216-af4f-91dd2a5fcda1'
    // hostObject =  { 
    //     pageKey: this.getPageKey,
    //     pageParams: this.pageParams,
    //     offline: false,
    // };
    blockName = 'ResourceSelection';
    hostObject = {
        resource: 'Persons',
        view: '1a751c8a-f4c7-48c9-a6b9-4a9b71fe9cab',
        selectionMode: 'single', // multi
        selectedObjectKeys: []
    }
    accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwZDZkZDMzMzkzYmZkMWNkYTc2YjRmNjQ5NGRmNzYzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE2NjQ4MzMwOTIsImV4cCI6MTY2NDgzNjY5MiwiaXNzIjoiaHR0cHM6Ly9pZHAucGVwcGVyaS5jb20iLCJhdWQiOlsiaHR0cHM6Ly9pZHAucGVwcGVyaS5jb20vcmVzb3VyY2VzIiwicGVwcGVyaS5hcGludCIsInBlcHBlcmkud2ViYXBwX2FwaSJdLCJjbGllbnRfaWQiOiJwZXBwZXJpLndlYmFwcC5hcHAucGVwcGVyaS5jb20iLCJzdWIiOiIwMzlkMTIxNC01NzM0LTQ0NTktODc5Yy0yOTE0ZjZmMDgxYmMiLCJhdXRoX3RpbWUiOjE2NjQ3OTcxMzQsImlkcCI6ImxvY2FsIiwiZW1haWwiOiJzaW1jaGEud0BwZXBwZXJpLmNvbSIsInBlcHBlcmkuaWQiOjEwODYwMTY0LCJwZXBwZXJpLnVzZXJ1dWlkIjoiMDM5ZDEyMTQtNTczNC00NDU5LTg3OWMtMjkxNGY2ZjA4MWJjIiwicGVwcGVyaS5kaXN0cmlidXRvcmlkIjozMDAxMjYzNiwicGVwcGVyaS5kaXN0cmlidXRvcnV1aWQiOiIyMjM0NTYzZC1iMTdiLTRhY2UtYjgzNi05MTZiMDM5NTA0YWUiLCJwZXBwZXJpLmRhdGFjZW50ZXIiOiJwcm9kIiwicGVwcGVyaS5hcGludGJhc2V1cmwiOiJodHRwczovL2FwaW50LnBlcHBlcmkuY29tL3Jlc3RhcGkiLCJwZXBwZXJpLmVtcGxveWVldHlwZSI6MSwicGVwcGVyaS5iYXNldXJsIjoiaHR0cHM6Ly9wYXBpLnBlcHBlcmkuY29tL1YxLjAiLCJwZXBwZXJpLndhY2RiYXNldXJsIjoiaHR0cHM6Ly9jcGFwaS5wZXBwZXJpLmNvbSIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJwZXBwZXJpLndlYmFwcF9pZGVudGl0eSIsInBlcHBlcmkucHJvZmlsZSIsInBlcHBlcmkuYXBpbnQiLCJwZXBwZXJpLndlYmFwcF9hcGkiXSwiYW1yIjpbInB3ZCJdfQ.YX76I8aEgrXUPcWWWn9ZegV5bP8C1fJiS6zRIJsaqlfUj3GEiCyDoQXik0nEDf5LBVgradK6fAKejH8bOnBwe4bW7ehjTGi8Yxel_0FxPxPWxPa-lpz6cOJVOY-5z2NRTj5xRHsnJ8mlbXodidl2uZeL_S4yFEAROARwVHU5rS6KNlKFNt-oiz2D55jHmwxn81CuCxDFE7Gp0jAYPoDKPecLZC19m_bjY9pzbqI125D1ZTZx_9RZ5y_pyBJfJEZ48sN8Gp9D6eMYogpp4DVsQgoS5y_k5Fxeu7gvf7rPkhhICNtPPc7npO8kV3DAuNz_5NVT5w6f2on62U-VOgDxgw'

    constructor(private pepService: PepHttpService) {
        this.init();
    }
    init() {
        this.initNativeBirdge()
    }
    initNativeBirdge(){
        window['nativeBridge'] = (obj) => {
            const key = obj.key;
            const data = obj.data;
            const callbackKey = obj.callbackKey
            console.log(`key: ${key}, data: ${data}, callbackKey: ${callbackKey}`)
            this.nativeBridge(obj)
        }
    }
    bridgeCallback(callbackKey, res){
        const obj = { 
            data: res,
            callbackKey: callbackKey
        }
        return window['nativeBridgeCallback'](obj);
    }
    nativeBridge(obj){
        const key = obj.key;
        const data = obj.data;
        const callbackKey = obj.callbackKey

        switch (key) {
            case 'getAccessToken': 
                this.bridgeCallback(callbackKey, this.accessToken)
                break;
        
            case 'getPageKey':
                this.bridgeCallback(callbackKey, this.getPageKey)
                break;
        
            case 'getPageParams':
                this.bridgeCallback(callbackKey, JSON.stringify(this.pageParams))
                break;
                
            case 'getHostObject':                
                this.bridgeCallback(callbackKey, JSON.stringify(this.hostObject))
                break;
            case 'getBlockName':                
                this.bridgeCallback(callbackKey, this.blockName)
                break;
        
            default:
                break;
        }
    }

}

