const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'oh-my-svg-editor': path.resolve( process.cwd(), `src/index.js` ),
	},
	output: {
		path: path.join( __dirname, './build' ),
	},
	resolve: {
		fallback: {
			stream: require.resolve( 'stream-browserify' ),
			path: require.resolve( 'path-browserify' ),
		},
	},
};
