import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		include: ['tests/lib/**/*.js'],
		coverage: {
			reporter: ['lcov', 'text'],
			reportsDirectory: 'coverage',
		},
	},
});
