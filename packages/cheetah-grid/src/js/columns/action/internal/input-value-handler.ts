import { EventHandler } from "../../../internal/EventHandler";

export function setInputValue(input: HTMLInputElement, value: string): void {
  const sign = input.type === "number" && value === "-";
  if (sign) {
    // When `type="number"`, the minus sign is not accepted, so change it to `type="text"` once.
    input.type = "";
    let handler: EventHandler | null = new EventHandler();
    const dispose = (): void => {
      if (handler) {
        handler.dispose();
        handler = null;
      }
    };
    handler.once(input, "input", (_e) => {
      input.type = "number";
      dispose();
    });
    handler.once(input, "blur", (_e) => {
      dispose();
    });
  }

  input.value = value ?? "";
}
