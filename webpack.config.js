const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
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
