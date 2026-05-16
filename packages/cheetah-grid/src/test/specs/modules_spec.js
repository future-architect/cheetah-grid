/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('top-level modules', function() {
		it('exports public module namespaces from barrel modules', async function() {
			const columns = await import('../../js/columns.ts');
			const headers = await import('../../js/headers.ts');
			const data = await import('../../js/data.ts');
			const core = await import('../../js/core.ts');
			const tools = await import('../../js/tools.ts');

			expect(columns.type.Column).toBeTypeOf('function');
			expect(columns.style.Style).toBeTypeOf('function');
			expect(columns.action.Action).toBeTypeOf('function');
			expect(headers.type.Header).toBeTypeOf('function');
			expect(headers.style.Style).toBeTypeOf('function');
			expect(headers.action.SortHeaderAction).toBeTypeOf('function');
			expect(data.DataSource).toBeTypeOf('function');
			expect(data.CachedDataSource).toBeTypeOf('function');
			expect(data.FilterDataSource).toBeTypeOf('function');
			expect(core.EVENT_TYPE.CLICK_CELL).toEqual('click_cell');
			expect(core.DrawGrid).toBeTypeOf('function');
			expect(tools.canvashelper).toBeTypeOf('object');
		});

		it('exports default and backward-compatible theme accessors from main', async function() {
			const main = await import('../../js/main.ts');
			const originalDefault = main.themes.default;
			const nextDefault = main.themes.BASIC;

			try {
				main.themes.default = nextDefault;

				expect(main.default.columns).toBe(main.columns);
				expect(main.default.headers).toBe(main.headers);
				expect(main.default.data).toBe(main.data);
				expect(main.default.core).toBe(main.core);
				expect(main.default.tools).toBe(main.tools);
				expect(main.default.register).toBe(main.register);
				expect(main.default.icons).toEqual(main.getIcons());
				expect(main.themes.default).toBe(nextDefault);
				expect(main.themes.choices).toEqual(main.themes.getChoices());
			} finally {
				main.themes.default = originalDefault;
			}
		});
	});
})();
