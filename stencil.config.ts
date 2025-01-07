import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'qr-code',
  buildEs5: true,
  extras: {
    cssVarsShim: true,
    dynamicImportShim: true,
    safari10: true,
    shadowDomShim: true,
  },
  outputTargets: [
    {
      type: 'dist',
    },
    {
      type: 'www',
      serviceWorker: false,
    },
  ],
};
