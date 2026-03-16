const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

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
