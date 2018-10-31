'use strict';

module.exports = {
	'Array_isArray': (typeof window === 'undefined' ? Array.isArray : window.Array.isArray)
};