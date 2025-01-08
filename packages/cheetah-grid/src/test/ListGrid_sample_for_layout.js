/*global cheetahGrid*/
/*eslint object-shorthand:0, prefer-arrow-callback:0, prefer-template: "off"*/
'use strict';
function generate(num) {
	const fnames = ['Sophia', 'Emma', 'Olivia', 'Isabella', 'Ava', 'Mia', 'Emily', 'Abigail', 'Madison', 'Elizabeth', 'Charlotte', 'Avery', 'Sofia', 'Chloe', 'Ella', 'Harper', 'Amelia', 'Aubrey', 'Addison', 'Evelyn', 'Natalie', 'Grace', 'Hannah', 'Zoey', 'Victoria', 'Lillian', 'Lily', 'Brooklyn', 'Samantha', 'Layla', 'Zoe', 'Audrey', 'Leah', 'Allison', 'Anna', 'Aaliyah', 'Savannah', 'Gabriella', 'Camila', 'Aria', 'Noah', 'Liam', 'Jacob', 'Mason', 'William', 'Ethan', 'Michael', 'Alexander', 'Jayden', 'Daniel', 'Elijah', 'Aiden', 'James', 'Benjamin', 'Matthew', 'Jackson', 'Logan', 'David', 'Anthony', 'Joseph', 'Joshua', 'Andrew', 'Lucas', 'Gabriel', 'Samuel', 'Christopher', 'John', 'Dylan', 'Isaac', 'Ryan', 'Nathan', 'Carter', 'Caleb', 'Luke', 'Christian', 'Hunter', 'Henry', 'Owen', 'Landon', 'Jack'];
	const lnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher'];
	const records = [];
	for (let i = 0; i < num * 1000; i++) {
		const fname = fnames[Math.floor(Math.random() * fnames.length)];
		const lname = lnames[Math.floor(Math.random() * lnames.length)];
		const pVal = i + 0.987;
		const data = {
			check: i % 2 === 0,
			check2: 'false',
			check3: 'off',
			check4: 0,
			check5: '00',
			check6: i % 2 === 0 ? null : {chain: {check: true}},
			checkReadOnly: i % 2 !== 0,
			personid: i + 1,
			fname: fname,
			lname: lname,
			email: (fname + '_' + lname + '@example.com').toLowerCase(),
			sdate: '1/1/2013',
			num: i + 0.987,
			manager: '--',
			description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
			fn: function() {
				return 'return';
			},
			promise: function() {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						resolve(pVal);
					}, 1000);
				});
			},
		};
		if (i < 900000) {
			records.push(data);
		} else {
			data.fname = '遅延テスト';
			records.push(function() {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						resolve(data);
					}, 1000);
				});
			});
		}
	}
	return records;
}
(function() {
	window.cheetah = cheetahGrid;
	const menuOptions = [
		{value: '', caption: 'Empty'},
		{value: '1', caption: 'Option 1'},
		{value: '2', caption: 'Option 2'},
		{value: '3', caption: 'Option 3'},
		{value: '4', caption: 'Option 4'},
		{value: '5', caption: 'Option 5'},
		{value: '6', caption: 'Option 6'},
		{value: '7', caption: 'Option 7'},
	];
	const displayOptions = [
		{value: '', caption: 'Choose your option'},
		{value: '1', caption: 'Option 1'},
		{value: '2', caption: 'Option 2'},
		{value: '3', caption: 'Option 3'},
		{value: '4', caption: 'Option 4'},
		{value: '5', caption: 'Option 5'},
		{value: '6', caption: 'Option 6'},
		{value: '7', caption: 'Option 7'},
	];
	const columnType = cheetahGrid.columns.type;
	const columnAction = cheetahGrid.columns.action;
	const records = generate(1000);
	const startTime = new Date();
	const grid = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#parent'),
		allowRangePaste: true,
		// trimOnPaste: true,
		keyboardOptions: {
			moveCellOnTab: true,
			selectAllOnCtrlA: true,
			deleteCellValueOnDel: true,
			moveCellOnEnter: true
		},
		layout: [
			[
				{
					field: 'check',
					caption: 'check',
					width: 50,
					columnType: 'check',
					action: 'check',
					rowSpan: 3
				},
				{
					field: 'check',
					caption: 'radio',
					width: 50,
					columnType: 'radio',
					action: 'radio',
					rowSpan: 3
				},
				{
					field: 'personid',
					caption: 'ID',
					width: 100,
					// sort
					sort: function(order, col, grid) {
						const compare = order === 'desc'
							? function(v1, v2) { return v1 === v2 ? 0 : v1 > v2 ? 1 : -1; }
							: function(v1, v2) { return v1 === v2 ? 0 : v1 < v2 ? 1 : -1; };
						records.sort(function(r1, r2) { return compare(r1.personid, r2.personid); });
						grid.records = records;
					},
					style: {padding: [0, 0, 0, '1.2em']},
					rowSpan: 3
				},
				{
					field: 'checkReadOnly',
					caption: 'read',
					width: 50,
					columnType: 'check',
					rowSpan: 3,
				},
				{
					field: 'checkReadOnly',
					caption: 'check on top',
					width: 50,
					columnType: 'check',
					rowSpan: 3,
					style: {
						padding: [11, 0, 0, 0],
						textBaseline: 'top'
					},
				},
				{
					field: 'checkReadOnly',
					caption: 'radio on top',
					width: 50,
					columnType: 'radio',
					rowSpan: 3,
					style: {
						padding: [11, 0, 0, 0],
						textBaseline: 'top'
					},
				},
				{
					caption: 'name',
					field: function(r) { return r.fname + ' ' + r.lname; },
					colSpan: 2,
				},
				{
					field: 'email',
					caption: 'Email',
					width: '15%',
					minWidth: '200px',
					sort: true,
					colSpan: 3,
				},
			],
			[
				{field: 'fname', caption: 'First Name', width: 'auto', maxWidth: '200px'},
				{field: 'lname', caption: 'Last Name', width: 'auto', minWidth: '150px'},
				{
					field: 'num',
					caption: 'num',
					width: 80,
					columnType: 'number',
					style: function(r) {
						if (r.num > 100) {
							return {
								color: 'red'
							};
						}
						return null;
					}
				},
				{field: function(r) { return r.personid + '行目'; }, caption: 'personid', width: 100, columnType: 'number'},
				{
					caption: 'button1',
					width: 'calc(10px + 70px)',
					columnType: new columnType.ButtonColumn({
						caption: 'BUTTON',
					}),
					action: new columnAction.ButtonAction({
						action: function(rec) {
						alert('ID:' + rec.personid + ' ' + JSON.stringify(rec));//eslint-disable-line
						},
					}),
					rowSpan: 2
				},
			],
			[
				{field: 'fn', caption: 'fn', width: 80},
				{field: 'promise', caption: 'promise', width: 80, columnType: 'number'},
			],
			[
				{field: 'check6.chain.check', caption: 'chain', width: 50, columnType: 'check', action: 'check', colSpan: 2},
				{field: 'text', caption: 'input', width: 50, columnType: '', action: 'input', rowSpan: 2, colSpan: 2},
				{
					field: 'sel',
					caption: 'InlineMenuEditor',
					width: 260,
					columnType: new cheetahGrid.columns.type.MenuColumn({options: displayOptions}),
					action: new cheetahGrid.columns.action.InlineMenuEditor({
						options: (rec) => rec.sel ? [{value: rec.sel, label: rec.sel}] : menuOptions
					}),
					rowSpan: 2,
					colSpan: 2
				},
				{
					field: 'text2',
					caption: 'message',
					width: 150,
					//message function
					message(rec) {
						return !rec.text2 || rec.text2.match(/^[a-zA-Z]*$/) ? null : 'Please only alphabet.';
					},
					action: 'input',
					rowSpan: 2,
					colSpan: 2
				},
				{
					field: 'description',
					caption: 'Multiline',
					width: 600,
					columnType: 'multilinetext',
					style: {
						autoWrapText: true,
						lineClamp: 4
					},
					rowSpan: 2,
					colSpan: 2
				},
				{
					field: 'text',
					caption: 'InlineInputEditor',
					width: 260,
					action: new cheetahGrid.columns.action.InlineInputEditor(),
					rowSpan: 2,
					colSpan: 2
				},
			]
		],
		frozenColCount: 2,
	});
	grid.records = records;
	const endTime = new Date();
	document.body.insertBefore(document.createTextNode(endTime - startTime + 'ms'), document.body.childNodes[0]);
	window.gridElement = grid.getElement();
	window.grid = grid;

	// filter
	const filterButton = document.querySelector('#filter');
	filterButton.onclick = function() {
		grid.dataSource = new cheetahGrid.data.FilterDataSource(
				cheetahGrid.data.CachedDataSource.ofArray(records),
				function(record) { return !record.check; }
		);
		// const _records = records.filter(function(record) { return !record.check; });
		// grid.records = _records;
	};
	const unfilterButton = document.querySelector('#unfilter');
	unfilterButton.onclick = function() {
		grid.records = records;
	};
	// filter


	/////// jump
	const focusButton = document.querySelector('#focus');
	focusButton.onclick = function() {
		grid.makeVisibleGridCell('email', 45);
		grid.focusGridCell('email', 45);
	};
	/////// jump

	cheetahGrid.register.theme('RED', cheetahGrid.themes.default.extends({
		color: 'red',
		defaultBgColor: '#FDD',
		frozenRowsBgColor: '#EAA',
		highlightBorderColor: '#FD5',
		selectionBgColor: '#FDA',
		borderColor: 'red',
		checkbox: {
			uncheckBgColor: '#FDD',
			checkBgColor: 'rgb(255, 73, 72)',
			borderColor: 'red',
		},
		button: {
			color: '#FDD',
			bgColor: '#F55',
		},
		messages: {
			errorBgColor: 'red',
			boxWidth: 12,
			markHeight: 15
		},
		font: '8px sans-serif'
	}));

	cheetahGrid.register.theme('ONLYHEADER', cheetahGrid.themes.default.extends({
		color: 'rgba(0, 0, 0, 0.87)',
		defaultBgColor: '#FFF',
		frozenRowsBgColor: '#FFF',
		frozenRowsColor: 'rgba(0, 0, 0, 0.54)',
		highlightBorderColor: '#5E9ED6',
		selectionBgColor: '#CCE0FF',
		borderColor: ['#ccc7c7', null],
		frozenRowsBorderColor: '#ccc7c7',
		checkbox: {
			uncheckBgColor: '#FFF',
			checkBgColor: 'rgb(76, 73, 72)',
			borderColor: 'rgba(0, 0, 0, 0.26)',
		},
		button: {
			color: '#FFF',
			bgColor: '#2196F3',
		}
	}));
	cheetahGrid.register.theme('ALL_light', cheetahGrid.themes.default.extends({
		color: 'rgba(0, 0, 0, 0.87)',
		defaultBgColor: '#FFF',
		frozenRowsBgColor: '#FFF',
		frozenRowsColor: 'rgba(0, 0, 0, 0.54)',
		highlightBorderColor: '#5E9ED6',
		selectionBgColor: '#CCE0FF',
		borderColor: ['#ccc7c7', '#f2f2f2'],
		frozenRowsBorderColor: ['#ccc7c7', '#f2f2f2'],
		checkbox: {
			uncheckBgColor: '#FFF',
			checkBgColor: 'rgb(76, 73, 72)',
			borderColor: 'rgba(0, 0, 0, 0.26)',
		},
		button: {
			color: '#FFF',
			bgColor: '#2196F3',
		}
	}));
	cheetahGrid.register.theme('ALL', cheetahGrid.themes.default.extends({
		color: 'rgba(0, 0, 0, 0.87)',
		defaultBgColor: '#FFF',
		frozenRowsBgColor: '#FFF',
		frozenRowsColor: 'rgba(0, 0, 0, 0.54)',
		highlightBorderColor: '#5E9ED6',
		selectionBgColor: '#CCE0FF',
		borderColor: '#ccc7c7',
		frozenRowsBorderColor: '#ccc7c7',
		checkbox: {
			uncheckBgColor: '#FFF',
			checkBgColor: 'rgb(76, 73, 72)',
			borderColor: 'rgba(0, 0, 0, 0.26)',
		},
		button: {
			color: '#FFF',
			bgColor: '#2196F3',
		}
	}));

	const themeSelect = document.querySelector('#theme');
	themeSelect.onchange = function() {
		if (themeSelect.value === 'default') {
			grid.theme = null;
		} else {
			grid.theme = themeSelect.value;
		}
		console.log(themeSelect.value);
	};
})();