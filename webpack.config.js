const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'oh-my-svg-editor': path.resolve( process.cwd(), `src/index.ts` ),
	},
	module: {
		rules: [
			{
				test: /\.[tj]sx?$/,
				use: [ 'babel-loader' ],
				exclude: /node_modules/,
			},
		],
		...defaultConfig.module,
	},
	output: {
		path: path.join( __dirname, './build' ),
	},
	resolve: {
		...defaultConfig.resolve,
		fallback: {
			url: false,
			stream: false,
			path: false,
			os: false,
			fs: false,
		},
	},
};
