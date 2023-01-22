import { PepHttpService } from '@pepperi-addons/ngx-lib';

export class TestHelper {
    
    constructor(private pepService: PepHttpService) {
        this.init();
    }
    init() {
        this.initNativeBirdge()
    }
    initNativeBirdge(){
        // add function if not exist
        if (!window['nativeBridge']) {
            window['nativeBridge'] =  (obj) => {
                const key = obj.key;
                const data = obj.data;
                const callbackKey = obj.callbackKey
                console.log(`key: ${key}, data: ${data}, callbackKey: ${callbackKey}`)
                return this.nativeBridge(obj)
            }
        }
    }
    bridgeCallback(callbackKey, res){
        const obj = { 
            data: this.encodeToBase64(res),
            callbackKey: callbackKey
        }
        return window['nativeBridgeCallback'](obj)
    }
    encodeToBase64(obj) {
        // text encoding
        const encoder = new TextEncoder();
        const data = encoder.encode(obj);
        // base64 encoding
        const base64 = btoa(String.fromCharCode.apply(null, data));
        return base64;
    }
    async nativeBridge(obj){
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
            case 'emit-event':    
                // make http call to local server
                const res =  await this.pepService.postHttpCall('http://localhost:8088/addons/api/2d06b975-a03b-42c9-940a-a3a6f67d6d67/addon-cpi/emit_event', 
                {eventKey: data.eventKey, eventData: data.eventData}).toPromise();
                console.log('res', res)
                this.bridgeCallback(callbackKey, JSON.stringify(res.data))
                break;
                
            default:
                break;
            }
        }
                
    pageParams = {a:1}
    getPageKey = '12b51068-77ab-48f7-9278-bc131ee59303'
    hostObject =  { 
        pageKey: this.getPageKey,
        pageParams: this.pageParams,
        offline: false,
    };
    blockName = 'Pages';
    // blockName = 'ResourcePicker';
    // hostObject = {
    //     offline: false,
    //     resource: 'Persons',
    //     view: '1a751c8a-f4c7-48c9-a6b9-4a9b71fe9cab',
    //     selectionMode: 'single', // multi
    //     selectedObjectKeys: []
    // }
    accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwZDZkZDMzMzkzYmZkMWNkYTc2YjRmNjQ5NGRmNzYzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE2NzQxNDEwMDMsImV4cCI6MTY3NDE0NDYwMywiaXNzIjoiaHR0cHM6Ly9pZHAucGVwcGVyaS5jb20iLCJhdWQiOlsiaHR0cHM6Ly9pZHAucGVwcGVyaS5jb20vcmVzb3VyY2VzIiwicGVwcGVyaS5hcGludCIsInBlcHBlcmkud2ViYXBwX2FwaSJdLCJjbGllbnRfaWQiOiJwZXBwZXJpLndlYmFwcC5hcHAucGVwcGVyaS5jb20iLCJzdWIiOiIwMzlkMTIxNC01NzM0LTQ0NTktODc5Yy0yOTE0ZjZmMDgxYmMiLCJhdXRoX3RpbWUiOjE2NzQxNDEwMDIsImlkcCI6ImxvY2FsIiwiZW1haWwiOiJzaW1jaGEud0BwZXBwZXJpLmNvbSIsInBlcHBlcmkuaWQiOjEwODYwMTY0LCJwZXBwZXJpLnVzZXJ1dWlkIjoiMDM5ZDEyMTQtNTczNC00NDU5LTg3OWMtMjkxNGY2ZjA4MWJjIiwicGVwcGVyaS5kaXN0cmlidXRvcmlkIjozMDAxMjYzNiwicGVwcGVyaS5kaXN0cmlidXRvcnV1aWQiOiIyMjM0NTYzZC1iMTdiLTRhY2UtYjgzNi05MTZiMDM5NTA0YWUiLCJwZXBwZXJpLmRhdGFjZW50ZXIiOiJwcm9kIiwicGVwcGVyaS5hcGludGJhc2V1cmwiOiJodHRwczovL2FwaW50LnBlcHBlcmkuY29tL3Jlc3RhcGkiLCJwZXBwZXJpLmVtcGxveWVldHlwZSI6MSwicGVwcGVyaS5iYXNldXJsIjoiaHR0cHM6Ly9wYXBpLnBlcHBlcmkuY29tL1YxLjAiLCJwZXBwZXJpLndhY2RiYXNldXJsIjoiaHR0cHM6Ly9jcGFwaS5wZXBwZXJpLmNvbSIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJwZXBwZXJpLndlYmFwcF9pZGVudGl0eSIsInBlcHBlcmkucHJvZmlsZSIsInBlcHBlcmkuYXBpbnQiLCJwZXBwZXJpLndlYmFwcF9hcGkiXSwiYW1yIjpbInB3ZCJdfQ.pYZUT2aeq4NJ3SalV2fix69Wmn1ZCatvTtUPfYoCsprh8ZT2H7EOXCPFGkGWU8DvFr220bG-FYta6SDnCMb7oI2SzZJH1f72nMrIOUL9d5UZ3xetscpH-D4RialqGMf5kk9X1Xm49RGLdfWF53vccKNQLOnojd1LtTbon_WxOqOW10Ccx9DIXl6l0XOgskFeB9vrOo0BLJvPxdMFvMSGfHuR4ZgMB2R_nh5LpNF-N5ieHFXMtS7j6qeM0DIH0jPbKV-xxrgRc8ASDIorll6aerqMQvWE8a7kPPveIy1PqTv1D2H3fQFm-x7rD5fL_7sqOJn6deIrVVw4ZODubaDDiQ'
    themeObject = {
        data: {
            "data": {
              "--pep-font-family-body": "Inter",
              "--pep-border-radius-md": "0.25rem",
              "--pep-color-weak-h": "var(--pep-color-system-primary-h)",
              "--pep-color-regular-l": "var(--pep-color-system-primary-l)",
              "--pep-color-weak-l": "var(--pep-color-system-primary-l)",
              "--pep-line-height-sm": "1.25rem",
              "--pep-color-regular-h": "var(--pep-color-system-primary-h)",
              "--pep-color-weak-s": "var(--pep-color-system-primary-s)",
              "--pep-shadow-card-offset": "var(--pep-shadow-md-offset)",
              "--pep-color-top-header-l": "",
              "--pep-color-top-header-s": "",
              "--pep-style-top-header": "strong",
              "--pep-color-text-link-s": "76%",
              "--pep-color-strong-s": "var(--pep-color-user-primary-s)",
              "--pep-color-top-header-h": "",
              "--pep-color-system-primary-l": "10%",
              "--pep-color-system-primary-h": "0",
              "--pep-color-strong-l": "var(--pep-color-user-primary-l)",
              "--pep-border-radius-lg": "0.5rem",
              "--pep-color-strong-h": "var(--pep-color-user-primary-h)",
              "--pep-color-system-caution-h": "360",
              "--pep-font-size-sm": "0.875rem",
              "--pep-color-system-success-h": "100",
              "--pep-color-system-caution-s": "100%",
              "--pep-color-qs-s": "var(--pep-color-system-primary-s)",
              "--pep-color-system-caution-l": "40%",
              "--pep-color-qs-h": "var(--pep-color-system-primary-h)",
              "--pep-color-qs-l": "var(--pep-color-system-primary-l)",
              "--pep-color-user-secondary-l": "42%",
              "--pep-color-system-success-l": "25%",
              "--pep-color-system-success-s": "100%",
              "--pep-border-radius-sm": "0.125rem",
              "--pep-color-user-secondary-h": "77",
              "--pep-color-user-primary-h": "311",
              "--pep-color-system-primary-s": "0%",
              "--pep-font-size-xs": "0.75rem",
              "--pep-font-size-lg": "1.125rem",
              "--pep-color-user-secondary-s": "87%",
              "--pep-color-text-link-h": "207",
              "--pep-color-user-primary-l": "27.1%",
              "--pep-font-size-xl": "1.25rem",
              "--pep-line-height-md": "1.5rem",
              "--pep-color-text-link-l": "37%",
              "--pep-line-height-2xl": "2.25rem",
              "--pep-color-user-primary-s": "87%",
              "--pep-font-size-2xs": "0.625rem",
              "--pep-style-qs": "regular",
              "--pep-color-regular-s": "var(--pep-color-system-primary-s)",
              "--pep-line-height-2xs": "0.75rem",
              "--pep-font-size-2xl": "1.5rem",
              "--pep-line-height-xs": "1rem",
              "--pep-line-height-lg": "1.75rem",
              "--pep-line-height-xl": "2rem",
              "--pep-font-family-title": "Nexa",
              "--pep-card-spacing": "var(--pep-spacing-xs)",
              "--pep-font-size-md": "1rem"
            }
          }
    }
}
            
