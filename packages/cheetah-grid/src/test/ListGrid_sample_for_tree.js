/*global cheetahGrid*/
/*eslint object-shorthand:0, prefer-arrow-callback:0, prefer-template: "off"*/
'use strict';

(function() {
	window.cheetahGrid = cheetahGrid;
	const columnType = cheetahGrid.columns.type;
	const columnAction = cheetahGrid.columns.action;
	const columnStyle = cheetahGrid.columns.style;

	const expands = {'p1': true, 'c1_1': true};

	const tree = [
		{
			code: 'p1',
			children: [
				{
					code: 'c1_1',
					children: [
						{
							code: 'd1_1_1'
						},
						{
							code: 'd1_1_2',
							children: [
								{
									code: 'e1_1_2_1'
								},
								{
									code: 'e1_1_2_2'
								}
							]
						}
					]
				},
				{
					code: 'c1_2'
				}
			]
		},
		{
			code: 'p2',
			children: [
				{
					code: 'c2_1'
				},
				{
					code: 'c2_2'
				}
			]
		}
	];

	// Set the parent property to the parent node so that we can keep track of the parent node.
	const buffer = [...tree];
	while (buffer.length) {
		const node = buffer.shift();
		for (const child of node.children || []) {
			child.parent = node;
			buffer.push(child);
		}
	}

	const treeColumn = new columnType.TreeColumn(
			{
				// cache: true
			}
	);
	const treeStyle = new columnStyle.TreeStyle(
			{
				// textBaseline: 'top',
				padding: [5, 0, 0, 10],
				// lineColor: '#aaa',
				// lineWidth: 3,
				// lineStyle: 'none'
			}
	);

	const grid = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#parent'),
		allowRangePaste: true,
		header: [
			{
				field: (node) => {
					// Build tree data
					const hasChildren = !!node.children?.length;

					return {
						caption: node.code,
						/**
						 * Returns an array of paths indicating the hierarchy to the record.
						 * The path must contain an element that identifies the node itself.
						 */
						path() {
							return [...ancestors()].
								reverse().
								map((node) => node.code);

							function *ancestors() {
								let n = node;
								while (n) {
									yield n;
									n = n.parent;
								}
							}
						},
						nodeType: hasChildren ? 'branch' : 'leaf',
					};
				},
				caption: 'Tree',
				width: 200,
				columnType: treeColumn,
				style: treeStyle,
				action: new columnAction.Action({
					disabled: (node) => {
						const hasChildren = !!node.children?.length;
						return !hasChildren;
					},
					action: (e) => {
						expands[e.code] = !expands[e.code];
						grid.records = buildRecords(tree);
					},
					area: treeColumn.drawnIconActionArea
				})
			},
			{
				field: 'code',
				caption: 'Code',
				width: 150,
			},
		],
		frozenColCount: 1,
	});

	function buildRecords(nodes) {
		const records = [];
		for (const node of nodes) {
			records.push(node);
			if (expands[node.code]) {
				records.push(...buildRecords(node.children));
			}
		}
		return records;
	}


	grid.records = buildRecords(tree);
	window.grid = grid;

	const toolsRoot = document.querySelector('#tools');

	const label = document.createElement('label');
	const showIconCheck = document.createElement('input');
	showIconCheck.type = 'checkbox';
	showIconCheck.checked = treeStyle.treeIcon !== 'none';
	label.appendChild(showIconCheck);
	label.appendChild(document.createTextNode('Show Icons'));
	toolsRoot.appendChild(label);
	showIconCheck.addEventListener('change', () => {
		treeStyle.treeIcon = showIconCheck.checked ? undefined : 'none';
		grid.invalidate();
	});

	const showLineCheck = document.createElement('input');
	showLineCheck.type = 'checkbox';
	showLineCheck.checked = treeStyle.lineStyle !== 'none';
	label.appendChild(showLineCheck);
	label.appendChild(document.createTextNode('Show Lines'));
	toolsRoot.appendChild(label);
	showLineCheck.addEventListener('change', () => {
		treeStyle.lineStyle = showLineCheck.checked ? 'solid' : 'none';
	});
})();