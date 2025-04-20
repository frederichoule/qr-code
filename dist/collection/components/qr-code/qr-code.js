import { h, } from '@stencil/core';
import { addPlugin, animate } from 'just-animate';
import { waapiPlugin } from 'just-animate/lib/web';
addPlugin(waapiPlugin);
// Comment below and line 149 build for production:
import { player } from 'just-animate/lib/tools';
import qrcode from 'qrcode-generator';
import { getAnimationPreset, QRCodeEntity, } from './animations';
export class BpQRCode {
  constructor() {
    this.contents = '';
    this.protocol = '';
    this.moduleColor = '#000';
    this.positionRingColor = '#000';
    this.positionCenterColor = '#000';
    this.maskXToYRatio = 1;
    this.squares = false;
    this.data = undefined;
    this.moduleCount = undefined;
  }
  /**
   * The first update must run after load to query the created shadowRoot for
   * slotted nodes.
   */
  componentDidLoad() {
    this.updateQR();
  }
  componentDidUpdate() {
    this.codeRendered.emit();
  }
  updateQR() {
    /**
     * E.g. Firefox, as of Firefox 61
     */
    const isUsingWebComponentPolyfill = this.qrCodeElement === this.qrCodeElement.shadowRoot;
    const realSlot = this.qrCodeElement.shadowRoot.querySelector('slot');
    const hasSlot = isUsingWebComponentPolyfill
      ? this.qrCodeElement.querySelector('[slot]')
        ? true
        : false
      : realSlot
        ? typeof realSlot.assignedNodes === 'function'
          ? realSlot.assignedNodes().length > 0
          : realSlot.childNodes.length > 0 // Fallback for Jest jsdom environment
        : false;
    this.data = this.generateQRCodeSVG(this.contents, hasSlot);
  }
  async animateQRCode(animation) {
    this.executeAnimation(typeof animation === 'string' ? getAnimationPreset(animation) : animation);
  }
  async getModuleCount() {
    return this.moduleCount;
  }
  executeAnimation(animation) {
    const modules = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('.module'));
    const rings = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('.position-ring'));
    const centers = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('.position-center'));
    const icons = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('#icon-wrapper'));
    const setEntityType = (array, entity) => {
      return array.map((element) => {
        return {
          element,
          entityType: entity,
        };
      });
    };
    const animationAdditions = [
      ...setEntityType(modules, QRCodeEntity.Module),
      ...setEntityType(rings, QRCodeEntity.PositionRing),
      ...setEntityType(centers, QRCodeEntity.PositionCenter),
      ...setEntityType(icons, QRCodeEntity.Icon),
    ]
      .map(({ element, entityType }) => {
      return {
        element,
        // SVGElement.dataset is part of the SVG 2.0 draft
        // TODO: requires a polyfill for Edge:
        // https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset
        positionX: parseInt(element.dataset.column, 10),
        positionY: parseInt(element.dataset.row, 10),
        entityType: entityType,
      };
    })
      .map((entityInfo) => animation(entityInfo.element, entityInfo.positionX, entityInfo.positionY, this.moduleCount, entityInfo.entityType));
    const timeline = animate(animationAdditions);
    // Comment out below to build for production:
    player(timeline);
    timeline.play();
  }
  generateQRCodeSVG(contents, maskCenter) {
    const qr = qrcode(
    /* Auto-detect QR Code version to use */ 0, 
    /* Highest error correction level */ 'H');
    qr.addData(contents);
    qr.make();
    const margin = 4;
    this.moduleCount = qr.getModuleCount();
    const pixelSize = this.moduleCount + margin * 2;
    const coordinateShift = pixelSize / 2;
    return `
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="${0 - coordinateShift} ${0 - coordinateShift} ${pixelSize} ${pixelSize}"
        preserveAspectRatio="xMinYMin meet">
    <rect
        width="100%"
        height="100%"
        fill="white"
        fill-opacity="0"
        cx="${-coordinateShift}"
        cy="${-coordinateShift}"/>
    ${this.squares
      ? void 0
      : renderQRPositionDetectionPatterns(this.moduleCount, margin, this.positionRingColor, this.positionCenterColor, coordinateShift)}
    ${renderQRModulesSVG(qr, this.moduleCount, margin, maskCenter, this.maskXToYRatio, this.squares, this.moduleColor, coordinateShift)}
    </svg>`;
    function renderQRPositionDetectionPatterns(count, margin, ringFill, centerFill, coordinateShift) {
      return `
      ${renderQRPositionDetectionPattern(margin, margin, margin, ringFill, centerFill, coordinateShift)}
      ${renderQRPositionDetectionPattern(count - 7 + margin, margin, margin, ringFill, centerFill, coordinateShift)}
      ${renderQRPositionDetectionPattern(margin, count - 7 + margin, margin, ringFill, centerFill, coordinateShift)}
      `;
    }
    function renderQRPositionDetectionPattern(x, y, margin, ringFill, centerFill, coordinateShift) {
      return `
      <path
        class="position-ring"
        fill="${ringFill}"
        data-column="${x - margin}" 
        data-row="${y - margin}" 
        d="M${x - coordinateShift} ${y - 0.5 - coordinateShift}h6s.5 0 .5 .5v6s0 .5-.5 .5h-6s-.5 0-.5-.5v-6s0-.5 .5-.5zm.75 1s-.25 0-.25 .25v4.5s0 .25 .25 .25h4.5s.25 0 .25-.25v-4.5s0-.25 -.25 -.25h-4.5z"/>
      <path
        class="position-center"
        fill="${centerFill}"
        data-column="${x - margin + 2}"
        data-row="${y - margin + 2}"
        d="M${x + 2 - coordinateShift} ${y + 1.5 - coordinateShift}h2s.5 0 .5 .5v2s0 .5-.5 .5h-2s-.5 0-.5-.5v-2s0-.5 .5-.5z"/>
      `;
    }
    function renderQRModulesSVG(qr, count, margin, maskCenter, maskXToYRatio, squares, moduleFill, coordinateShift) {
      let svg = '';
      for (let column = 0; column < count; column += 1) {
        const positionX = column + margin;
        for (let row = 0; row < count; row += 1) {
          if (qr.isDark(column, row) &&
            (squares ||
              (!isPositioningElement(row, column, count) &&
                !isRemovableCenter(row, column, count, maskCenter, maskXToYRatio)))) {
            const positionY = row + margin;
            svg += squares
              ? `
            <rect x="${positionX - 0.5 - coordinateShift}" y="${positionY - 0.5 - coordinateShift}" width="1" height="1" />
            `
              : `
            <circle
                class="module"
                fill="${moduleFill}"
                cx="${positionX - coordinateShift}"
                cy="${positionY - coordinateShift}"
                data-column="${column}"
                data-row="${row}"
                r="0.5"/>`;
          }
        }
      }
      return svg;
    }
    function isPositioningElement(row, column, count) {
      const elemWidth = 7;
      return row <= elemWidth
        ? column <= elemWidth || column >= count - elemWidth
        : column <= elemWidth
          ? row >= count - elemWidth
          : false;
    }
    /**
     * For ErrorCorrectionLevel 'H', up to 30% of the code can be corrected. To
     * be safe, we limit damage to 10%.
     */
    function isRemovableCenter(row, column, count, maskCenter, maskXToYRatio) {
      if (!maskCenter)
        return false;
      const center = count / 2;
      const safelyRemovableHalf = Math.floor((count * Math.sqrt(0.1)) / 2);
      const safelyRemovableHalfX = safelyRemovableHalf * maskXToYRatio;
      const safelyRemovableHalfY = safelyRemovableHalf / maskXToYRatio;
      const safelyRemovableStartX = center - safelyRemovableHalfX;
      const safelyRemovableEndX = center + safelyRemovableHalfX;
      const safelyRemovableStartY = center - safelyRemovableHalfY;
      const safelyRemovableEndY = center + safelyRemovableHalfY;
      return (row >= safelyRemovableStartY &&
        row <= safelyRemovableEndY &&
        column >= safelyRemovableStartX &&
        column <= safelyRemovableEndX);
    }
  }
  render() {
    return (h("div", { id: "qr-container" }, h("div", { id: "icon-container", style: this.squares ? { display: 'none', visibility: 'hidden' } : {} }, h("div", { id: "icon-wrapper", style: { width: `${18 * this.maskXToYRatio}%` }, "data-column": this.moduleCount / 2, "data-row": this.moduleCount / 2 }, h("slot", { name: "icon" }))), h("div", { innerHTML: this.data })));
  }
  static get is() { return "qr-code"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() {
    return {
      "$": ["qr-code.css"]
    };
  }
  static get styleUrls() {
    return {
      "$": ["qr-code.css"]
    };
  }
  static get properties() {
    return {
      "contents": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "contents",
        "reflect": false,
        "defaultValue": "''"
      },
      "protocol": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "protocol",
        "reflect": false,
        "defaultValue": "''"
      },
      "moduleColor": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "module-color",
        "reflect": false,
        "defaultValue": "'#000'"
      },
      "positionRingColor": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "position-ring-color",
        "reflect": false,
        "defaultValue": "'#000'"
      },
      "positionCenterColor": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "string",
          "resolved": "string",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "position-center-color",
        "reflect": false,
        "defaultValue": "'#000'"
      },
      "maskXToYRatio": {
        "type": "number",
        "mutable": false,
        "complexType": {
          "original": "number",
          "resolved": "number",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "mask-x-to-y-ratio",
        "reflect": false,
        "defaultValue": "1"
      },
      "squares": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "squares",
        "reflect": false,
        "defaultValue": "false"
      }
    };
  }
  static get states() {
    return {
      "data": {},
      "moduleCount": {}
    };
  }
  static get events() {
    return [{
        "method": "codeRendered",
        "name": "codeRendered",
        "bubbles": true,
        "cancelable": true,
        "composed": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "complexType": {
          "original": "any",
          "resolved": "any",
          "references": {}
        }
      }];
  }
  static get methods() {
    return {
      "animateQRCode": {
        "complexType": {
          "signature": "(animation?: AnimationPreset | QRCodeAnimation) => Promise<void>",
          "parameters": [{
              "tags": [],
              "text": ""
            }],
          "references": {
            "Promise": {
              "location": "global"
            },
            "AnimationPreset": {
              "location": "import",
              "path": "./animations"
            },
            "QRCodeAnimation": {
              "location": "import",
              "path": "./animations"
            }
          },
          "return": "Promise<void>"
        },
        "docs": {
          "text": "",
          "tags": []
        }
      },
      "getModuleCount": {
        "complexType": {
          "signature": "() => Promise<number>",
          "parameters": [],
          "references": {
            "Promise": {
              "location": "global"
            }
          },
          "return": "Promise<number>"
        },
        "docs": {
          "text": "",
          "tags": []
        }
      }
    };
  }
  static get elementRef() { return "qrCodeElement"; }
  static get watchers() {
    return [{
        "propName": "contents",
        "methodName": "updateQR"
      }, {
        "propName": "protocol",
        "methodName": "updateQR"
      }, {
        "propName": "moduleColor",
        "methodName": "updateQR"
      }, {
        "propName": "positionRingColor",
        "methodName": "updateQR"
      }, {
        "propName": "positionCenterColor",
        "methodName": "updateQR"
      }, {
        "propName": "maskXToYRatio",
        "methodName": "updateQR"
      }, {
        "propName": "squares",
        "methodName": "updateQR"
      }];
  }
}
