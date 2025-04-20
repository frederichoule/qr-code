import { p as promiseResolve, b as bootstrapLazy } from './index-ba402efd.js';
export { s as setNonce } from './index-ba402efd.js';

/*
 Stencil Client Patch Browser v2.22.3 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = import.meta.url;
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return promiseResolve(opts);
};

patchBrowser().then(options => {
  return bootstrapLazy([["qr-code",[[1,"qr-code",{"contents":[1],"protocol":[1],"moduleColor":[1,"module-color"],"positionRingColor":[1,"position-ring-color"],"positionCenterColor":[1,"position-center-color"],"maskXToYRatio":[2,"mask-x-to-y-ratio"],"squares":[4],"data":[32],"moduleCount":[32],"animateQRCode":[64],"getModuleCount":[64]}]]]], options);
});
