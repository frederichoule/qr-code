import { newSpecPage } from '@stencil/core/testing';
import { BpQRCode } from './qr-code';

describe('qr-code', () => {
  it('builds', () => {
    expect(new BpQRCode()).toBeTruthy();
  });
  
  it('renders without slotted content', async () => {
    const { body } = await newSpecPage({
      components: [BpQRCode],
      html: '<qr-code></qr-code>',
    });
    expect(body.querySelector('qr-code')).not.toBeNull();
    expect(body.querySelector('qr-code').shadowRoot.querySelector('slot')).not.toBeNull();
    expect(body.querySelector('[slot="icon"]')).toBeNull();
  });

  it('renders with slotted content', async () => {
    const { body } = await newSpecPage({
      components: [BpQRCode],
      html: '<qr-code><div slot="icon">Icon</div></qr-code>',
    });
    expect(body.querySelector('qr-code')).not.toBeNull();
    expect(body.querySelector('qr-code').shadowRoot.querySelector('slot')).not.toBeNull();
    expect(body.querySelector('[slot="icon"]')).not.toBeNull();
    expect(body.querySelector('[slot="icon"]').textContent).toBe('Icon');
  });

  it('has correct module count', async () => {
    const { body } = await newSpecPage({
      components: [BpQRCode],
      html: '<qr-code contents="1234567890"></qr-code>',
    });
    expect(body.querySelector('qr-code')).not.toBeNull();
    expect(await body.querySelector('qr-code').getModuleCount()).toBe(25);
  });
});
