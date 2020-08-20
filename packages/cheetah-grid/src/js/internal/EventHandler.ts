import type { AnyFunction, EventListenerId } from "../ts-types";
import type { EventTarget as CustomEventTarget } from "../core/EventTarget";
import { each } from "./utils";

/** @private */
let nextId = 1;

/** @private */
type EventHandlerTarget = EventTarget | CustomEventTarget;
/** @private */
type Listener = AnyFunction;
/** @private */
type EventListenerObject = {
  target: EventHandlerTarget;
  type: string;
  listener: Listener;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
};

export class EventHandler {
  private _listeners: {
    [key: string]: EventListenerObject;
  } = {};
  on<TYPE extends keyof GlobalEventHandlersEventMap>(
    target: EventHandlerTarget,
    type: TYPE,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (event: GlobalEventHandlersEventMap[TYPE]) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...options: any[]
  ): EventListenerId;
  on(
    target: EventHandlerTarget,
    type: string,
    listener: Listener,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...options: any[]
  ): EventListenerId;
  on(
    target: EventHandlerTarget,
    type: string,
    listener: Listener,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...options: any[]
  ): EventListenerId {
    if (target.addEventListener) {
      target.addEventListener(type, listener, ...(options as []));
    }
    const obj = {
      target,
      type,
      listener,
      options,
    };
    const id = nextId++;
    this._listeners[id] = obj;
    return id;
  }
  once<TYPE extends keyof GlobalEventHandlersEventMap>(
    target: EventHandlerTarget,
    type: TYPE,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (event: GlobalEventHandlersEventMap[TYPE]) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...options: any[]
  ): EventListenerId;
  once(
    target: EventHandlerTarget,
    type: string,
    listener: Listener,
    ...options: (boolean | AddEventListenerOptions)[]
  ): EventListenerId;
  once(
    target: EventHandlerTarget,
    type: string,
    listener: Listener,
    ...options: (boolean | AddEventListenerOptions)[]
  ): EventListenerId {
    const id = this.on(
      target,
      type,
      (...args) => {
        this.off(id);
        listener(...args);
      },
      ...options
    );
    return id;
  }
  tryWithOffEvents(
    target: EventHandlerTarget,
    type: string,
    call: () => void
  ): void {
    const list: EventListenerObject[] = [];
    try {
      each(this._listeners, (obj) => {
        if (obj.target === target && obj.type === type) {
          if (obj.target.removeEventListener) {
            obj.target.removeEventListener(
              obj.type,
              obj.listener,
              ...(obj.options as [])
            );
          }
          list.push(obj);
        }
      });
      call();
    } finally {
      list.forEach((obj) => {
        if (obj.target.addEventListener) {
          obj.target.addEventListener(
            obj.type,
            obj.listener,
            ...(obj.options as [])
          );
        }
      });
    }
  }
  off(id: EventListenerId | null | undefined): void {
    if (id == null) {
      return;
    }
    const obj = this._listeners[id];
    if (!obj) {
      return;
    }
    delete this._listeners[id];
    if (obj.target.removeEventListener) {
      obj.target.removeEventListener(
        obj.type,
        obj.listener,
        ...(obj.options as [])
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fire(target: EventTarget, type: string, ...args: any[]): void {
    each(this._listeners, (obj) => {
      if (obj.target === target && obj.type === type) {
        obj.listener.call(obj.target, ...args);
      }
    });
  }
  hasListener(target: EventTarget, type: string): boolean {
    let result = false;
    each(this._listeners, (obj) => {
      if (obj.target === target && obj.type === type) {
        result = true;
      }
    });
    return result;
  }
  clear(): void {
    each(this._listeners, (obj) => {
      if (obj.target.removeEventListener) {
        obj.target.removeEventListener(
          obj.type,
          obj.listener,
          ...(obj.options as [])
        );
      }
    });
    this._listeners = {};
  }
  dispose(): void {
    this.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)._listeners = null;
  }
}
