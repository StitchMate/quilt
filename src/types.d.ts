//Webpack Module Federation primitative declarations
declare const __webpack_init_sharing__: (scope: string) => void;
declare const __webpack_share_scopes__: { default: any };

interface Module {
    [fn: string]: (id: string, props: { [key: string]: string; }) => void;
}

interface ModuleContainer {
    init: (scope: any) => void;
    get: (module: string) => () => Module;
}