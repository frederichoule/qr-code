import { newSpecPage } from '@stencil/core/testing';
import { BpQRCode } from './qr-code';

describe('qr-code', () => {
  it('builds', () => {
    expect(new BpQRCode()).toBeTruthy();
  });

  it('renders', async () => {
    const { body } = await newSpecPage({
      components: [BpQRCode],
      html: '<qr-code></qr-code>',
    });
    expect(body.querySelector('qr-code')).not.toBeNull();
  });
});
