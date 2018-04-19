'use strict';

const {Transform} = require('stream');

function create(opts) {
	const {prefix} = opts;
	const stream = new Transform({objectMode: true});

	stream._transform = function(chunk, encoding, done) {
		const data = chunk.toString();
		const lines = data.split('\n');

		if (stream._lastLineData) {
			lines[0] = stream._lastLineData + lines[0];
		}

		stream._lastLineData = lines.pop();

		lines.forEach((line) => stream.push(`${prefix + line}\n`));

		done();
	};

	stream._flush = function(done) {
		if (stream._lastLineData) {
			stream.push(prefix + stream._lastLineData);
			stream._lastLineData = null;
		}

		done();
	};

	return stream;
}

module.exports = {create};
