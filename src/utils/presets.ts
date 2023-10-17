/* the array of ticks displayed below the rotation slider */
export const rotationRangePresets:
	| boolean
	| { value: number; label?: string }[] = [
	{
		value: -180,
		label: '-180',
	},
	{
		value: -90,
		label: '-90',
	},
	{
		value: 0,
		label: '0',
	},
	{
		value: 90,
		label: '90',
	},
	{
		value: 180,
		label: '180',
	},
];

/**
 * It returns an object with the css property for the alignCenter class for the svg block container
 *
 * @return css props
 */
const styleCenter = () => {
	return {
		display: 'table',
		width: 'inherit',
	};
};

/**
 * It returns an object with the css property for the alignWide and alignFull class for the svg block container
 *
 * @return css props
 */
const styleWide = () => {
	return {
		display: 'flex',
		maxWidth: 'inherit',
		width: '100%',
	};
};

/**
 * It returns an object with the default css property for the svg block container
 *
 * @return css props
 */
const styleDefault = () => {
	return {
		display: 'flex',
	};
};

/**
 * If the block alignment is center, wide, or full, return a style object that aligns the block to the
 * center, wide, or full, otherwise return a style object that aligns the block to the left.
 *
 * @param {string | undefined} blockAlignment - string | undefined
 *
 * @return A function that returns a style object.
 */
export const getAlignStyle = ( blockAlignment: string | undefined ) => {
	switch ( blockAlignment ) {
		case 'wide':
		case 'full':
			return styleWide();
		case 'center':
			return styleCenter();
		case undefined:
		default:
			// align left
			// align right
			return styleDefault();
	}
};

export const relOptions = [
	{ label: '', value: '' },
	{ label: 'Alternate', value: 'alternate' },
	{ label: 'Author', value: 'author' },
	{ label: 'Bookmark', value: 'bookmark' },
	{ label: 'Canonical', value: 'canonical' },
	{ label: 'DNS Prefetch', value: 'dns-prefetch' },
	{ label: 'External', value: 'external' },
	{ label: 'Help', value: 'help' },
	{ label: 'Icon', value: 'icon' },
	{ label: 'License', value: 'license' },
	{ label: 'Manifest', value: 'manifest' },
	{ label: 'Me', value: 'me' },
	{ label: 'Module Preload', value: 'modulepreload' },
	{ label: 'Next', value: 'next' },
	{ label: 'No Follow', value: 'nofollow' },
	{ label: 'No Opener', value: 'noopener' },
	{ label: 'No Referrer', value: 'noreferrer' },
	{ label: 'Opener', value: 'opener' },
	{ label: 'Pingback', value: 'pingback' },
	{ label: 'Preconnect', value: 'preconnect' },
	{ label: 'Prefetch', value: 'prefetch' },
	{ label: 'Preload', value: 'preload' },
	{ label: 'Prerender', value: 'prerender' },
	{ label: 'Prev', value: 'prev' },
	{ label: 'Search', value: 'search' },
	{ label: 'Stylesheet', value: 'stylesheet' },
	{ label: 'Tag', value: 'tag' },
];
