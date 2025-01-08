import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'qr-code',
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
