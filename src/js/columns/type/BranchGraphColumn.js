'use strict';
const {isDef, getOrApply, isPromise, obj: {isObject}} = require('../../internal/utils');
const BranchGraphStyle = require('../style/BranchGraphStyle');
const {calcStartPosition} = require('../../internal/canvases');
const BaseColumn = require('./BaseColumn');
const {BRANCH_GRAPH_COLUMN_STATE_ID: _} = require('../../internal/symbolManager');
const canvashelper = require('../../tools/canvashelper');

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
	constructor({index, commit = false, lines = [], disabled = false, tag}) {
		this.index = index;
		this.commit = commit;
		this.lines = lines;
		this.disabled = disabled;
		this.tag = tag;
	}
	static mergeLines(lines) {
		const result = lines.filter(((l) => isDef(l.fromIndex) && isDef(l.toIndex)));
		
		const froms = lines.filter(((l) => isDef(l.fromIndex) && !isDef(l.toIndex)));
		const tos = lines.filter(((l) => !isDef(l.fromIndex) && isDef(l.toIndex)));

		froms.forEach((f) => {
			for (let i = 0; i < tos.length; i++) {
				const t = tos[i];
				if (t.point && t.point.disabled) {
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
			disabled: a.disabled && b.disabled,
			tag: a.tag || b.tag
		});
	}
}

function joinLine(timeline, branchIndex) {
	const reverse = [...timeline].reverse();
	return !reverse.every((tl, index) => {
		const f = tl[branchIndex];
		if (f) {
			f.lines = BranchPoint.mergeLines(f.lines.concat([new BranchLine({
				toIndex: branchIndex,
				colorIndex: branchIndex,
			})]));
			f.disabled = false;
			return false;
		} else {
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
	});
}

function branch({timeline, branches}, from, to) {
	const fromIndex = branches.indexOf(from);
	let toIndex = branches.indexOf(to);
	if (toIndex < 0) {
		toIndex = branches.length;
		branches.push(to);
	}

	if (fromIndex < 0) {
		return new BranchPoint({
			index: toIndex,
			disabled: true,
		});
	} else {
		const reverse = [...timeline].reverse();
		for (let index = 0; index < reverse.length; index++) {
			const tl = reverse[index];
			const f = tl[fromIndex];
			if (f && f.commit) {
				let point;
				let result;
				if (index > 0) {
					const targetLine = reverse[index - 1];
					point = targetLine[toIndex] = BranchPoint.merge(targetLine[toIndex], new BranchPoint({
						index: toIndex,
						disabled: true,
						lines: [new BranchLine({
							fromIndex,
							colorIndex: toIndex
						})]
					}));
					result = null;
				} else {
					point = new BranchPoint({
						index: toIndex,
						disabled: true,
						lines: [new BranchLine({
							fromIndex,
							colorIndex: toIndex
						})]
					});
					result = point;
				}
				f.lines = BranchPoint.mergeLines(f.lines.concat([new BranchLine({
					toIndex,
					colorIndex: toIndex,
					point,
				})]));
				return result;
			}
		}
		return null;
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

function renderMerge(grid, ctx, x, upLine, downLine, colorIndex, {
	branchWidth, margin, branchColors, branchLineWidth, circleSize, mergeStyle
}, {
	width, col, row, pos
}) {
	if (isDef(upLine) || isDef(downLine)) {
		const radius = circleSize / 2;
		ctx.strokeStyle = getOrApply(branchColors, colorIndex);
		ctx.lineWidth = branchLineWidth;
		ctx.beginPath();


		if (isDef(upLine)) {
			const upX = pos.x + radius + (upLine * branchWidth);
			const upPos = calcStartPosition(ctx, grid.getCellRelativeRect(col, row - 1), width, 0, {
				offset: margin,
			});
			ctx.moveTo(upX, upPos.y);
			if (mergeStyle === 'bezier') {
				ctx.bezierCurveTo(
						upX, (pos.y + upPos.y) / 2,
						x, (pos.y + upPos.y) / 2,
						x, pos.y
				);
			} else {
				ctx.lineTo(x, pos.y);
			}
		} else {
			ctx.moveTo(x, pos.y);
		}

		if (isDef(downLine)) {
			const downX = pos.x + radius + (downLine * branchWidth);
			const downPos = calcStartPosition(ctx, grid.getCellRelativeRect(col, row + 1), width, 0, {
				offset: margin,
			});
			if (mergeStyle === 'bezier') {
				ctx.bezierCurveTo(
						x, (pos.y + downPos.y) / 2,
						downX, (pos.y + downPos.y) / 2,
						downX, downPos.y
				);
			} else {
				ctx.lineTo(downX, downPos.y);
			}
		}

		ctx.stroke();
	}
}

/**
 * BranchGraphColumn
 *
 * # Data command
 * ## mastar branch or orphan branch
 * {
 *  command: 'branch',
 * 	branch: 'branch name A',
 * }
 * ## commit
 * {
 *  command: 'commit',
 * 	branch: 'branch name A'
 * }
 * ## branch
 * {
 *  command: 'branch',
 * 	branch: {
 * 		from: 'branch name A',
 * 		to: 'branch name B'
 * 	}
 * }
 * ## merge
 * {
 *  command: 'merge',
 * 	branch: {
 * 		from: 'branch name B',
 * 		to: 'branch name A'
 * 	}
 * }
 * ## tag
 * {
 *  command: 'tag',
 *  branch: 'branch name A',
 * 	tag: 'tag name'
 * }
 */
class BranchGraphColumn extends BaseColumn {
	constructor(option = {}) {
		super(option);
		this._start = option.start || 'bottom';
		this._cache = isDef(option.cache) ? option.cache : true;
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
			textAlign,
			textBaseline,
			branchColors,
			branchWidth,
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
		const radius = circleSize / 2;
		const width = branches.length * branchWidth;
		const rect = context.getRect();

		helper.drawWithClip(context, (ctx) => {
			ctx.textAlign = textAlign;
			ctx.textBaseline = textBaseline;
			
			const pos = calcStartPosition(ctx, rect, width, 0, {
				offset: margin,
			});
			
			branches.forEach((b, index) => {
				const x = pos.x + radius + (index * branchWidth);
				const p = data[index];
				if (p && !p.disabled) {
					p.lines.filter((line) => !line.point || !line.point.disabled).forEach((line) => {
						renderMerge(grid, ctx, x, line[upLineIndexKey], line[downLineIndexKey], line.colorIndex, {
							margin,
							branchWidth,
							branchLineWidth,
							branchColors,
							circleSize,
							mergeStyle,
						}, {
							width, col, row, pos
						});
					});

					ctx.fillStyle = getOrApply(branchColors, index);
					if (p.commit) {
						ctx.beginPath();
						ctx.arc(x, pos.y, radius, 0, Math.PI * 2, true);
						ctx.closePath();
						ctx.fill();
					}

					if (p.tag) {
						const {width: textWidth} = ctx.measureText(p.tag);
						canvashelper.fillTextRect(ctx, p.tag, x + radius + 4, pos.y - radius, textWidth, circleSize, {
							offset: 4,
						});
					}
				}
			});
		});
	}
}
module.exports = BranchGraphColumn;