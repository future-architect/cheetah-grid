'use strict';
const {isDef, getOrApply, isPromise, obj: {isObject}} = require('../../internal/utils');
const BranchGraphStyle = require('../style/BranchGraphStyle');
const BaseColumn = require('./BaseColumn');
const {BRANCH_GRAPH_COLUMN_STATE_ID: _} = require('../../internal/symbolManager');

function getAllColumnData(grid, col, callback) {
	const dataSource = grid.dataSource;
	let field = grid.getField(col);
	if (isObject(field) && field.get && field.set) {
		field = field.get;
	}
	const allData = [];
	let promise;
	for (let index = 0; index < dataSource.length; index++) {
		const data = dataSource.getField(index, field);
		if (isPromise(data)) {
			const dataIndex = allData.length;
			allData.push(data);
			if (!promise) {
				promise = data.then((d) => {
					allData[dataIndex] = d;
				});
			} else {
				promise = promise.then(() => data).then((d) => {
					allData[dataIndex] = d;
				});
			}
		} else {
			allData.push(data);
		}
	}

	if (promise) {
		promise.then(() => callback(allData));
	} else {
		callback(allData);
	}
}

class BranchLine {
	constructor({fromIndex, toIndex, colorIndex, point}) {
		this.fromIndex = fromIndex;
		this.toIndex = toIndex;
		this.colorIndex = colorIndex;
		this.point = point;
	}
}
class BranchPoint {
	constructor({index, commit = false, lines = [], tag}) {
		this.index = index;
		this.commit = commit;
		this.lines = lines;
		this.tag = tag;
	}
	static mergeLines(lines) {
		const result = lines.filter(((l) => isDef(l.fromIndex) && isDef(l.toIndex)));
		
		const froms = lines.filter(((l) => isDef(l.fromIndex) && !isDef(l.toIndex)));
		const tos = lines.filter(((l) => !isDef(l.fromIndex) && isDef(l.toIndex)));

		froms.forEach((f) => {
			for (let i = 0; i < tos.length; i++) {
				const t = tos[i];
				if (t.point) {
					continue;
				}
				if (f.colorIndex === t.colorIndex) {
					f.toIndex = t.toIndex;
					tos.splice(i, 1);
					break;
				}
			}

			result.push(f);
		});

		return result.concat(tos);
	}
	static merge(a, b) {
		if (!a) {
			return b;
		}
		return new BranchPoint({
			index: a.index,
			commit: a.commit || b.commit,
			lines: BranchPoint.mergeLines(a.lines.concat(b.lines)),
			tag: a.tag || b.tag
		});
	}
}

function joinLine(timeline, branchIndex) {
	const reverse = [...timeline].reverse();
	for (let i = 0; i < reverse.length; i++) {
		const f = reverse[i][branchIndex];
		if (f) {
			f.lines = BranchPoint.mergeLines(f.lines.concat([new BranchLine({
				toIndex: branchIndex,
				colorIndex: branchIndex,
			})]));

			for (let j = 0; j < i; j++) {
				const tl = reverse[j];
				tl[branchIndex] = new BranchPoint({
					index: branchIndex,
					lines: [new BranchLine({
						fromIndex: branchIndex,
						toIndex: branchIndex,
						colorIndex: branchIndex
					})]
				});
			}
			return true;
		}
	}
	return false;
}

function branch({timeline, branches}, from, to) {
	const fromIndex = branches.indexOf(from);
	let toIndex = branches.indexOf(to);
	if (toIndex < 0) {
		toIndex = branches.length;
		branches.push(to);
	}
	
	function findBranchRootIndex() {
		for (let index = timeline.length - 1; index >= 0; index--) {
			const tl = timeline[index];
			const from = tl[fromIndex];
			if (from && from.commit) {
				return index;
			}
		}
		return -1;
	}

	if (fromIndex < 0) {
		return new BranchPoint({
			index: toIndex,
		});
	} else {
		const fromTargetIndex = findBranchRootIndex();
		if (fromTargetIndex === -1) {
			return null;
		}
		const branchTargetFromIndex = fromTargetIndex + 1;
		const branchPoint = new BranchPoint({
			index: toIndex,
			lines: [new BranchLine({
				fromIndex,
				colorIndex: toIndex
			})]
		});
		let point;
		let result;
		if (branchTargetFromIndex < timeline.length) {
			const targetLine = timeline[branchTargetFromIndex];
			point = targetLine[toIndex] = BranchPoint.merge(targetLine[toIndex], branchPoint);
		} else {
			point = branchPoint;
			result = branchPoint;
		}
		const from = timeline[fromTargetIndex][fromIndex];
		from.lines = BranchPoint.mergeLines(from.lines.concat([new BranchLine({
			toIndex,
			colorIndex: toIndex,
			point,
		})]));
		return result;
	}
	
}

function commit({timeline, branches}, name) {
	const index = branches.indexOf(name);
	if (index < 0) {
		return null;
	}
	const result = new BranchPoint({
		index,
		commit: true,
	});
		
	if (joinLine(timeline, index)) {
		result.lines = BranchPoint.mergeLines(result.lines.concat([new BranchLine({
			fromIndex: index,
			colorIndex: index
		})]));
	}
	return result;
}

function commitTag({timeline, branches}, name, tag) {
	let index = branches.indexOf(name);
	if (index < 0) {
		index = branches.length;
		branches.push(name);
	}
	return new BranchPoint({
		index,
		tag
	});
}

function commitMerge({timeline, branches}, from, to) {
	const fromIndex = branches.indexOf(from);
	const toIndex = branches.indexOf(to);
	if (toIndex < 0 || fromIndex < 0) {
		return new BranchPoint({
			index: toIndex,
			commit: true,
		});
	}
	const result = new BranchPoint({
		index: toIndex,
		commit: true,
		lines: [
			new BranchLine({
				fromIndex,
				colorIndex: fromIndex
			}),
			new BranchLine({
				fromIndex: toIndex,
				colorIndex: toIndex
			})],
	});
	const froms = [...timeline];
	const fromTargetLine = froms.pop();
	if (fromTargetLine) {
		fromTargetLine[fromIndex] = BranchPoint.merge(fromTargetLine[fromIndex], new BranchPoint({
			index: toIndex,
			lines: [new BranchLine({
				toIndex,
				colorIndex: fromIndex
			})]
		}));
	}

	joinLine(froms, fromIndex);

	joinLine(timeline, toIndex);

	return result;
}

function calcCommand(info, command) {
	const {timeline} = info;
	const timelineData = [];
	// const last = timeline.length > 0 ? timeline[timeline.length - 1] : null;
	const commands = Array.isArray(command) ? command : [command];
	commands.forEach((cmd) => {
		if (!cmd) {
			return;
		}
		let point;
		if (cmd.command === 'branch') {
			const from = isObject(cmd.branch) ? cmd.branch.from : null;
			const to = isObject(cmd.branch) ? cmd.branch.to : cmd.branch;
			point = branch(info, from, to);
		} else if (cmd.command === 'commit') {
			const {branch} = cmd;
			point = commit(info, branch);
		} else if (cmd.command === 'merge') {
			const from = cmd.branch.from;
			const to = cmd.branch.to;
			point = commitMerge(info, from, to);
		} else if (cmd.command === 'tag') {
			const {branch, tag} = cmd;
			point = commitTag(info, branch, tag);
		}
		if (point && point.index > -1) {
			timelineData[point.index] = BranchPoint.merge(timelineData[point.index], point);
		}
	});
	timeline.push(timelineData);
}

function calcBranchesInfo(start, grid, col) {
	const result = {
		branches: [],
		timeline: []
	};
	getAllColumnData(grid, col, (data) => {
		if (start !== 'top') {
			data = [...data].reverse();
		}
		data.forEach((command) => {
			calcCommand(result, command);
		});

	});
	return result;
}

function calcBranchXPoints(ctx, left, width, radius, branches, timeline) {
	let w = Math.max(width / branches.length + 1, 5);
	timeline.forEach((tl) => {
		tl.forEach((p, index) => {
			if (index <= 0) {
				// 計算の意味が無い
				return;
			}
			if (p.tag) {
				const textWidth = ctx.measureText(p.tag).width;
				if (((w * index) + (radius * 2) + 4 + textWidth) > width) {
					w = Math.max((width - (radius * 2) - 4 - textWidth) / index, 5);
				}
			}
		});
	});
	const result = [];
	let x = left;
	branches.forEach(() => {
		result.push(Math.ceil(x + radius));
		x += w;
	});
	return result;
}

function renderMerge(grid, ctx, x, y, upLineIndex, downLineIndex, colorIndex, {
	branchXPoints, margin, branchColors, branchLineWidth, mergeStyle
}, {
	width, col, row, branches
}) {
	if (isDef(upLineIndex) || isDef(downLineIndex)) {
		ctx.strokeStyle = getOrApply(branchColors, branches[colorIndex], colorIndex);
		ctx.lineWidth = branchLineWidth;
		ctx.lineCap = 'round';
		ctx.beginPath();


		if (isDef(upLineIndex)) {
			const upX = branchXPoints[upLineIndex];
			const upRect = grid.getCellRelativeRect(col, row - 1);
			const upY = upRect.top + upRect.height / 2;
			ctx.moveTo(upX, upY);
			if (mergeStyle === 'bezier') {
				ctx.bezierCurveTo(
						upX, (y + upY) / 2,
						x, (y + upY) / 2,
						x, y
				);
			} else {
				ctx.lineTo(x, y);
			}
		} else {
			ctx.moveTo(x, y);
		}

		if (isDef(downLineIndex)) {
			const downX = branchXPoints[downLineIndex];
			const downRect = grid.getCellRelativeRect(col, row + 1);
			const downY = downRect.top + downRect.height / 2;
			if (mergeStyle === 'bezier') {
				ctx.bezierCurveTo(
						x, (y + downY) / 2,
						downX, (y + downY) / 2,
						downX, downY
				);
			} else {
				ctx.lineTo(downX, downY);
			}
		}

		ctx.stroke();
	}
}

/**
 * BranchGraphColumn<br>
 * <br>
 * # Data command<br>
 * ## mastar branch or orphan branch<br>
 * <pre><code class="js">
 * {
 * 	command: 'branch',
 * 	branch: 'branch name A',
 * }
 * </code></pre>
 * ## commit<br>
 * <pre><code class="js">
 * {
 * 	command: 'commit',
 * 	branch: 'branch name A'
 * }
 * </code></pre>
 * ## branch<br>
 * <pre><code class="js">
 * {
 * 	command: 'branch',
 * 	branch: {
 * 		from: 'branch name A',
 * 		to: 'branch name B'
 * 	}
 * }
 * </code></pre>
 * ## merge<br>
 * <pre><code class="js">
 * {
 * 	command: 'merge',
 * 	branch: {
 * 		from: 'branch name B',
 * 		to: 'branch name A'
 * 	}
 * }
 * </code></pre>
 * ## tag<br>
 * <pre><code class="js">
 * {
 * 	command: 'tag',
 * 	branch: 'branch name A',
 * 	tag: 'tag name'
 * }
 * </code></pre>
 *
 *
 * @memberof cheetahGrid.columns.type
 */
class BranchGraphColumn extends BaseColumn {
	constructor(option = {}) {
		super(option);
		this._start = option.start || 'bottom';
		this._cache = isDef(option.cache) ? option.cache : false;
	}
	get StyleClass() {
		return BranchGraphStyle;
	}
	clearCache(grid) {
		delete grid[_];
	}
	onDrawCell(cellValue, info, context, grid) {
		if (this._cache) {
			const state = grid[_] || (grid[_] = {});
			const {col} = context;
			if (!state[col]) {
				state[col] = calcBranchesInfo(this._start, grid, col);
			}
		}
		return super.onDrawCell(cellValue, info, context, grid);
	}
	clone() {
		return new BranchGraphColumn(this);
	}
	drawInternal(value, context, style, helper, grid, {drawCellBase}) {
		const {col, row} = context;
		const {timeline, branches} = (this._cache && grid[_]) ? grid[_][col] : calcBranchesInfo(this._start, grid, col);
		
		const {upLineIndexKey, downLineIndexKey} = this._start !== 'top' ? {upLineIndexKey: 'toIndex', downLineIndexKey: 'fromIndex'} : {upLineIndexKey: 'fromIndex', downLineIndexKey: 'toIndex'};
		const data = this._start !== 'top' ? timeline[timeline.length - (row - grid.frozenRowCount) - 1] : timeline[row - grid.frozenRowCount];

		const {
			branchColors,
			branchLineWidth,
			circleSize,
			mergeStyle,
			margin,
			bgColor,
		} = style;
		if (bgColor) {
			drawCellBase({
				bgColor,
			});
		}
		
		const rect = context.getRect();
		const radius = circleSize / 2;
		const width = rect.width - margin * 2;

		helper.drawWithClip(context, (ctx) => {
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			const branchXPoints = calcBranchXPoints(ctx, rect.left + margin, width, radius, branches, timeline);
			
			const y = rect.top + rect.height / 2;

			// draw join lines
			data.
				map((point, index) => point ? point.lines.map((line) => ({
					colorIndex: line.colorIndex,
					upLineIndex: line[upLineIndexKey],
					downLineIndex: line[downLineIndexKey],
					pointIndex: index,
				})) : []).
				reduce((p, c) => p.concat(c), []).// flatMap
				// order of overlap
				sort((a, b) => b.colorIndex - a.colorIndex).
				forEach((line) => {
					const x = branchXPoints[line.pointIndex];
					renderMerge(grid, ctx, x, y, line.upLineIndex, line.downLineIndex, line.colorIndex, {
						margin,
						branchXPoints,
						branchLineWidth,
						branchColors,
						mergeStyle,
					}, {
						width, col, row, branches
					});
				});
			// draw commit points
			data.forEach((p, index) => {
				if (p && p.commit) {
					const x = branchXPoints[index];
					ctx.fillStyle = getOrApply(branchColors, branches[index], index);
					ctx.beginPath();
					ctx.arc(x, y, radius, 0, Math.PI * 2, true);
					ctx.fill();
					ctx.closePath();
				}
			});
			// draw tags
			data.forEach((p, index) => {
				if (p && p.tag) {
					ctx.fillStyle = getOrApply(branchColors, branches[index], index);
					ctx.fillText(p.tag, branchXPoints[index] + radius + 4, y);
				}
			});
		});
	}
}
module.exports = BranchGraphColumn;