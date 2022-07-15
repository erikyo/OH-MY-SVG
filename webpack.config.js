const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	resolve: {
		fallback: {
			stream: require.resolve( 'stream-browserify' ),
			path: require.resolve( 'path-browserify' ),
		},
	},
};
