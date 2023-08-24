import { LRUCache } from "./LRUCache";
import type { MaybePromise } from "../ts-types";
import { then } from "./utils";

const allCache: {
  [key: string]: LRUCache<MaybePromise<HTMLImageElement>>;
} = {};

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (typeof Promise === "undefined") {
    console.error("Promise is not loaded. load Promise before this process.");
    return {
      then(): Promise<HTMLImageElement> {
        return this;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  const img = new Image();
  const result = new Promise<HTMLImageElement>((resolve) => {
    img.onload = (): void => {
      resolve(img);
    };
  });
  img.onerror = (): void => {
    const url = src.length > 200 ? `${src.slice(0, 200)}...` : src;
    console.warn(`cannot load: ${url}`);
    throw new Error(`IMAGE LOAD ERROR: ${url}`);
  };
  img.src = src;
  return result;
}

function getCacheOrLoad0(
  cache: LRUCache<MaybePromise<HTMLImageElement>>,
  src: MaybePromise<string>
): MaybePromise<HTMLImageElement> {
  return then(src, (src) => {
    const c = cache.get(src);
    if (c) {
      return c;
    }
    const result = loadImage(src).then((img) => {
      cache.put(src, img);
      return img;
    });
    cache.put(src, result);
    return result;
  });
}

export function getCacheOrLoad(
  cacheName: string,
  cacheSize: number,
  src: MaybePromise<string>
): MaybePromise<HTMLImageElement> {
  const cache =
    allCache[cacheName] ||
    (allCache[cacheName] = new LRUCache<MaybePromise<HTMLImageElement>>(
      cacheSize
    ));
  return getCacheOrLoad0(cache, src);
}
