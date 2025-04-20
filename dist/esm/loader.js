import { p as promiseResolve, b as bootstrapLazy } from './index-ba402efd.js';
export { s as setNonce } from './index-ba402efd.js';

/*
 Stencil Client Patch Esm v2.22.3 | MIT Licensed | https://stenciljs.com
 */
const patchEsm = () => {
    return promiseResolve();
};

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return bootstrapLazy([["qr-code",[[1,"qr-code",{"contents":[1],"protocol":[1],"moduleColor":[1,"module-color"],"positionRingColor":[1,"position-ring-color"],"positionCenterColor":[1,"position-center-color"],"maskXToYRatio":[2,"mask-x-to-y-ratio"],"squares":[4],"data":[32],"moduleCount":[32],"animateQRCode":[64],"getModuleCount":[64]}]]]], options);
  });
};

export { defineCustomElements };
