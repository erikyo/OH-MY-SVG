export const ALLOWED_MEDIA_TYPES: string[] = [ 'image/svg+xml' ];
export const SVG_VARIATION_NAMESPACE: string = 'codekraft/oh-my-svg-img';
export const NEW_TAB_REL: string = 'Snoreferrer noopener';
export const SVGBASE64: string = 'data:image/svg+xml;base64,';
export const SVG_PLUGIN_COLOR: string = '#FFB13B';
export const SVG_MIN_SIZE: number = 10;

export const SVGO_DEFAULTS: Object = {
	multipass: true,
	plugins: [
		{
			name: 'removeViewBox',
			enabled: false,
		},
		{
			name: 'removeDimensions',
			enabled: true,
		},
	],
};

export const SVG_EDITABLE_ELEMENTS: string[] = [ 'path', 'circle', 'rect' ];
