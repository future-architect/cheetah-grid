export interface MessageObject {
  type: "error" | "info" | "warning";
  message: string | null;
  original?: Message;
}
export type Message = MessageObject | string;
