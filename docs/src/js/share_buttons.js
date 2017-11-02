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

(function(d, s, id) {
	const fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) { return; }
	const js = d.createElement(s); js.id = id;
	js.src = 'https://b.st-hatena.com/js/bookmark_button.js';
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'hatena-buttons'));

window.___gcfg = {lang: 'ja'};

(function() {
	const po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/platform.js';
	const s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();

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

(function(d, i) {
	if (!d.getElementById(i)) {
		const j = d.createElement('script');
		j.id = i;
		j.src = 'https://widgets.getpocket.com/v1/j/btn.js?v=1';
        // const w = d.getElementById(i);
		d.body.appendChild(j);
	}
}(document, 'pocket-btn-js'));

(function(d, s, id) {
	const fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) { return; }
	const js = d.createElement(s); js.id = id;
	js.src = 'https://platform.linkedin.com/in.js';
	js.innerHTML = 'lang: ja_JP';
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'linkedin-button'));


// const styles = 'background: url(https://github.com/future-architect/cheetah-grid/doc/image/logo.png) no-repeat center 0;' +
//                'background-size: 100% auto;' +
//                'color: transparent;' +
//                'line-height: 120px;' +
//                'padding: 44px 64px 44px 0;';


// console.log('%c' + 'str', styles);