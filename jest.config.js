const jestConfig = {
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json',
		},
	},
	verbose: true,
};

module.exports = jestConfig;
