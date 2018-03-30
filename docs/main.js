/*global cheetahGrid*/
/*eslint object-shorthand:0, prefer-arrow-callback:0, prefer-template:0*/
'use strict';
(function() {
	const records = [
		{no: 1, check: 'true', name: 'Cheetah', icon: './icons/cheetah.png', habitat: './icons/africa.png', area: 'Africa', length: 150, weight: 60, speed: 120},
		{no: 2, check: 'false', name: 'Lion', icon: './icons/lion.png', habitat: './icons/africa.png', area: 'Africa', length: 200, weight: 200, speed: 79.2},
		{no: 3, check: 'true', name: 'Wolf', icon: './icons/wolf.png', habitat: './icons/world.png', area: 'World', length: 150, weight: 40, speed: 60},
		{no: 4, check: 'false', name: 'Tiger', icon: './icons/tiger.png', habitat: './icons/asia.png', area: 'Asia', length: 280, weight: 200, speed: 64.8},
		{no: 5, check: 'true', name: 'Cat', icon: './icons/cat.png', habitat: './icons/world.png', area: 'World', length: 75, weight: 5, speed: 30},
		{no: 6, check: 'false', name: 'Dog', icon: './icons/dog.png', habitat: './icons/africa.png', area: 'Africa', length: 100, weight: 10, speed: 69.6},
		{no: 7, check: 'true', name: 'Rat', icon: './icons/rat.png', habitat: './icons/asia.png', area: 'Asia', length: 0.2, weight: 0.5, speed: 39.6},
		{no: 8, check: 'false', name: 'Elephant', icon: './icons/elephant.png', habitat: './icons/asia.png', area: 'Asia', length: 5500, weight: 5400, speed: 36},
		{no: 9, check: 'true', name: 'Giraffe', icon: './icons/giraffe.png', habitat: './icons/africa.png', area: 'Africa', length: 5300, weight: 1930, speed: 54},
		{no: 10, check: 'false', name: 'Turtle', icon: './icons/turtle.png', habitat: './icons/asia.png', area: 'Asia', length: 200, weight: 900, speed: 9.6},
		{no: 11, check: 'true', name: 'Rabbit', icon: './icons/rabbit.png', habitat: './icons/asia.png', area: 'Asia', length: 76, weight: 2, speed: 72},
		{no: 12, check: 'true', name: 'Gorilla', icon: './icons/gorilla.png', habitat: './icons/africa.png', area: 'Africa', length: 170, weight: 160, speed: 49.2},
		{no: 13, check: 'false', name: 'Monkey', icon: './icons/monkey.png', habitat: './icons/asia.png', area: 'Asia', length: 60, weight: 18, speed: 57.6},
		{no: 14, check: 'true', name: 'Rhinoceros', icon: './icons/rhinoceros.png', habitat: './icons/africa.png', area: 'Africa', length: 400, weight: 2300, speed: 48},
		{no: 15, check: 'false', name: 'Horse', icon: './icons/horse.png', habitat: './icons/africa.png', area: 'Africa', length: 170, weight: 800, speed: 63.6},
		{no: 16, check: 'true', name: 'Kangaroo', icon: './icons/kangaroo.png', habitat: './icons/africa.png', area: 'Africa', length: 160, weight: 85, speed: 60},
		{no: 17, check: 'false', name: 'Penguin', icon: './icons/penguin.png', habitat: './icons/world.png', area: 'World', length: 100, weight: 45, speed: 8.4},
		{no: 18, check: 'true', name: 'Crocodile', icon: './icons/crocodile.png', habitat: './icons/africa.png', area: 'Africa', length: 500, weight: 1000, speed: 24},
		{no: 19, check: 'false', name: 'Snake', icon: './icons/snake.png', habitat: './icons/africa.png', area: 'Africa', length: 300, weight: 6, speed: 9.6},
		{no: 20, check: 'true', name: 'Squirrel', icon: './icons/squirrel.png', habitat: './icons/world.png', area: 'World', length: 10, weight: 0.1, speed: 14.4},
		{no: 21, check: 'false', name: 'Reindeer', icon: './icons/reindeer.png', habitat: './icons/world.png', area: 'World', length: 220, weight: 300, speed: 69.6}
	];
	const grid = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#parent'),
		header: [
			{
				field: 'check',
				caption: '',
				width: 60,
				columnType: 'check',
				action: 'check'
			},
			{
				field: 'no',
				caption: 'No',
				width: 70,
				style: {textAlign: 'center'},
				sort: true,
			},
			{
				field: 'name',
				caption: 'Name',
				width: 300,
				sort: true,
				icon: {
					src: 'icon',
					width: 26,
				},
			},
			{
				field: 'area',
				caption: 'Habitat',
				width: 300,
				icon: {
					src: 'habitat',
					width: 26,
				},
			},
			{
				field: 'speed',
				caption: 'Speed',
				width: 400,
				sort: true,
				columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
					min: 0,
					max: 120,
					formatter: function(s) { return ''; },
				}),
				style: {
					barHeight: 25,
				}
			},
			{
				field: 'length',
				caption: 'length',
				width: 200,
				sort: true,
				columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
					min: 0,
					max: 5500,
					formatter: function(s) { return s + 'cm'; },
				}),
				style: {
					barHeight: 5,
					barColor: '#F48FB1',
				}
			},
			{
				field: 'weight',
				caption: 'weight',
				width: 200,
				sort: true,
				// columnType: 'number',
				columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
					min: 0,
					max: 5400,
					formatter: function(s) { return s + 'kg'; },
				}),
				style: {
					barHeight: 5,
					barColor: '#7986CB',
				}
			},
			{
				caption: 'Button',
				width: 150,
				columnType: new cheetahGrid.columns.type.ButtonColumn({
					caption: 'DETAIL',
				}),
				action: new cheetahGrid.columns.action.ButtonAction({
					action: function(rec) {
						// do nothing in view
						console.log(rec);
					},
				}),
			}
		],
		frozenColCount: 2,
	});
	grid.records = records;
})();