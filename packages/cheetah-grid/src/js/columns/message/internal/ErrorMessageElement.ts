import { MessageElement } from "./MessageElement";

const CLASSNAME = "cheetah-grid__error-message-element";
const MESSAGE_CLASSNAME = `${CLASSNAME}__message`;

export class ErrorMessageElement extends MessageElement {
  constructor() {
    super();
    require("@/columns/message/internal/ErrorMessageElement.css");
    this._rootElement.classList.add(CLASSNAME);
    this._messageElement.classList.add(MESSAGE_CLASSNAME);
  }
}
