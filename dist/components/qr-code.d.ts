import type { Components, JSX } from "../types/components";

interface QrCode extends Components.QrCode, HTMLElement {}
export const QrCode: {
  prototype: QrCode;
  new (): QrCode;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
