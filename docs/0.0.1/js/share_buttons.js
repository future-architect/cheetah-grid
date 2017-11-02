/*eslint object-shorthand:0, prefer-arrow-callback:0*/
'use strict';
(function(d, s, id) {
	const fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) { return; }
	const js = d.createElement(s);
	js.id = id;
	js.src = 'https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.7';
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


(function(d, s, id) {
	const fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) { return; }
	const js = d.createElement(s); js.id = id;
	js.src = 'https://buttons.github.io/buttons.js';
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'gh-buttons'));

window.___gcfg = {lang: 'ja'};


(function(d, s, id) {
	const fjs = d.getElementsByTagName(s)[0],
		p = /^http:/.test(d.location) ? 'http' : 'https';
	if (!d.getElementById(id)) {
		const js = d.createElement(s);
		js.id = id;
		js.src = p + '://platform.twitter.com/widgets.js';
		fjs.parentNode.insertBefore(js, fjs);
	}
}(document, 'script', 'twitter-wjs'));
