import { MessageElement } from "./MessageElement";
import "./WarningMessageElement.css";

const CLASSNAME = "cheetah-grid__warning-message-element";
const MESSAGE_CLASSNAME = `${CLASSNAME}__message`;

export class WarningMessageElement extends MessageElement {
  constructor() {
    super();
    this._rootElement.classList.add(CLASSNAME);
    this._messageElement.classList.add(MESSAGE_CLASSNAME);
  }
}
