/* rotation range presets in order to provide a better ux for standard rotations like 0-90-180-270 */
import { hasAlign } from './fn';

/* the array of ticks displayed below the rotation slider */
export const rotationRangePresets: Object[] = [
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
	};
};

/**
 * It returns an object with the css property for the alignWide and alignFull class for the svg block container
 *
 * @return css props
 */
const styleWide = () => {
	return {
		display: 'table',
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
	return {};
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
		case 'center':
		case undefined:
			// align none
			return styleCenter();
		case 'wide':
		case 'full':
			return styleWide();
		default:
			// align left
			// align right
			return styleDefault();
	}
};
