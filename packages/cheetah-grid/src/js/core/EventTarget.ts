import type { AnyListener, EventListenerId } from "../ts-types";
import { each } from "../internal/utils";
import { get as getSymbol } from "../internal/symbolManager";

//private symbol
/** @private */
const _ = getSymbol();

/** @private */
let nextId = 1;
/**
 * event target.
 */
export class EventTarget {
  private [_]: {
    listeners: { [type: string]: AnyListener[] };
    listenerData: {
      [id: number]: {
        type: string;
        listener: AnyListener;
        remove: () => void;
      };
    };
  } = {
    listeners: {},
    listenerData: {},
  };
  /**
   * Adds an event listener.
   * @param  {string} type The event type id.
   * @param  {function} listener Callback method.
   * @return {number} unique id for the listener.
   */
  listen(type: string, listener: AnyListener): EventListenerId {
    const list = this[_].listeners[type] || (this[_].listeners[type] = []);
    list.push(listener);

    const id = nextId++;
    this[_].listenerData[id] = {
      type,
      listener,
      remove: (): void => {
        delete this[_].listenerData[id];
        const index = list.indexOf(listener);
        list.splice(index, 1);
        if (!this[_].listeners[type].length) {
          delete this[_].listeners[type];
        }
      },
    };
    return id;
  }
  /**
   * Removes an event listener which was added with listen() by the id returned by listen().
   * @param  {number} id the id returned by listen().
   * @return {void}
   */
  unlisten(id: EventListenerId): void {
    if (!this[_]) {
      return;
    }
    this[_].listenerData[id].remove();
  }
  addEventListener(type: string, listener: AnyListener): void {
    this.listen(type, listener);
  }
  removeEventListener(type: string, listener: AnyListener): void {
    if (!this[_]) {
      return;
    }
    each(this[_].listenerData, (obj, id) => {
      if (obj.type === type && obj.listener === listener) {
        this.unlisten(id);
      }
    });
  }
  hasListeners(type: string): boolean {
    if (!this[_]) {
      return false;
    }
    return !!this[_].listeners[type];
  }
  /**
   * Fires all registered listeners
   * @param  {string}    type The type of the listeners to fire.
   * @param  {...*} args fire arguments
   * @return {*} the result of the last listener
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fireListeners(type: string, ...args: any[]): any {
    if (!this[_]) {
      return [];
    }
    const list = this[_].listeners[type];
    if (!list) {
      return [];
    }
    return list
      .map((listener) => listener.call(this, ...args))
      .filter((r) => r != null);
  }
  dispose(): void {
    // @ts-expect-error -- ignore
    delete this[_];
  }
}
