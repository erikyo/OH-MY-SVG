module.exports = ( api ) => {
	api.cache( true );

	return {
		presets: [
			'@babel/preset-env',
			[
				'@babel/preset-react',
				{
					runtime: 'classic',
				},
			],
			'@babel/preset-typescript',
			'@wordpress/babel-preset-default',
		],
	};
};
