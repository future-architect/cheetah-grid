import * as utils from '../../../js/internal/utils.ts';

// Keep the utils namespace behind a named export. Importing utils.ts directly
// with dynamic import resolves a module namespace that has a callable `then`
// export, so Promise resolution treats it as a thenable.
export {utils};
