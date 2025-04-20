'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-f42c9c9c.js');

/*
 Stencil Client Patch Browser v2.22.3 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('qr-code.cjs.js', document.baseURI).href));
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return index.promiseResolve(opts);
};

patchBrowser().then(options => {
  return index.bootstrapLazy([["qr-code.cjs",[[1,"qr-code",{"contents":[1],"protocol":[1],"moduleColor":[1,"module-color"],"positionRingColor":[1,"position-ring-color"],"positionCenterColor":[1,"position-center-color"],"maskXToYRatio":[2,"mask-x-to-y-ratio"],"squares":[4],"data":[32],"moduleCount":[32],"animateQRCode":[64],"getModuleCount":[64]}]]]], options);
});

exports.setNonce = index.setNonce;
