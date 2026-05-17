import { sourceToIconsJsObject } from "./font-svg-to-icons";
import { sourceToIconJsObject as sourceToSingleIconJsObject } from "./svg-to-icon";

export type QueryValue = string | true;
export type QueryParams = Record<string, QueryValue>;
export type FilterPattern =
  | string
  | RegExp
  | ((id: string) => boolean)
  | FilterPattern[];

export interface Options {
  include?: FilterPattern;
  exclude?: FilterPattern;
  query?: string | string[] | false;
}

export interface ParsedId {
  filename: string;
  query: QueryParams;
}

export interface TransformResult {
  code: string;
  map: { mappings: string; names: string[]; sources: string[]; version: 3 };
}

export const DEFAULT_QUERY_NAMES = ["cheetah-grid-icon", "cg-icon"];

const SVG_EXT_RE = /\.svg$/iu;

export function parseId(id: string): ParsedId {
  const queryIndex = id.indexOf("?");
  if (queryIndex < 0) {
    return {
      filename: id,
      query: {},
    };
  }
  return {
    filename: id.slice(0, queryIndex),
    query: parseQuery(id.slice(queryIndex + 1)),
  };
}

function parseQuery(queryText: string): QueryParams {
  const query: QueryParams = {};
  if (!queryText) {
    return query;
  }
  queryText.split("&").forEach((part) => {
    if (!part) {
      return;
    }
    const equalIndex = part.indexOf("=");
    const rawKey = equalIndex < 0 ? part : part.slice(0, equalIndex);
    const rawValue = equalIndex < 0 ? true : part.slice(equalIndex + 1);
    query[decode(rawKey)] = rawValue === true ? true : decode(rawValue);
  });
  return query;
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/gu, " "));
  } catch (_err) {
    return value;
  }
}

function normalizeQueryNames(query: Options["query"]): string[] {
  if (query === false) {
    return [];
  }
  if (query == null) {
    return DEFAULT_QUERY_NAMES;
  }
  return Array.isArray(query) ? query : [query];
}

function hasOwn(object: QueryParams, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function matchesPattern(
  pattern: FilterPattern | undefined,
  value: string
): boolean {
  if (pattern == null) {
    return false;
  }
  if (Array.isArray(pattern)) {
    return pattern.some((item) => matchesPattern(item, value));
  }
  if (pattern instanceof RegExp) {
    pattern.lastIndex = 0;
    return pattern.test(value);
  }
  if (typeof pattern === "function") {
    return Boolean(pattern(value));
  }
  return value.indexOf(String(pattern)) >= 0;
}

function matchesFilter(
  pattern: FilterPattern | undefined,
  id: string,
  filename: string
): boolean {
  return matchesPattern(pattern, id) || matchesPattern(pattern, filename);
}

function hasPluginQuery(query: QueryParams, options: Options = {}): boolean {
  const queryNames = normalizeQueryNames(options.query);
  return queryNames.some((queryName) => hasOwn(query, queryName));
}

export function shouldTransform(id: string, options: Options = {}): boolean {
  const { filename, query } = parseId(id);
  if (!SVG_EXT_RE.test(filename)) {
    return false;
  }
  if (matchesFilter(options.exclude, id, filename)) {
    return false;
  }
  if (hasPluginQuery(query, options)) {
    return true;
  }
  if (options.include != null) {
    return matchesFilter(options.include, id, filename);
  }
  return options.query === false;
}

export function buildParams(
  id: string,
  options: Options = {}
): QueryParams & { resource: string } {
  const { filename, query } = parseId(id);
  const queryNames = normalizeQueryNames(options.query);
  const params: QueryParams & { resource: string } = { resource: filename };
  for (const key in query) {
    if (queryNames.indexOf(key) < 0) {
      params[key] = query[key];
    }
  }
  return params;
}

export function sourceToIconJsObject(
  source: string,
  id: string,
  options: Options = {}
): string {
  const params = buildParams(id, options);
  if (
    source.indexOf("<font-face") >= 0 &&
    !params["glyph-name"] &&
    !params.unicode
  ) {
    return sourceToIconsJsObject(source, params);
  }
  return sourceToSingleIconJsObject(source, params);
}

export function transformSvg(
  source: string,
  id: string,
  options: Options = {}
): TransformResult {
  return {
    code: `export default ${sourceToIconJsObject(source, id, options)};\n`,
    map: { mappings: "", names: [], sources: [id], version: 3 },
  };
}
