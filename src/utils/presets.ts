/* rotation range presets in order to provide a better ux for standard rotations like 0-90-180-270 */
import { hasAlign } from './fn';

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

const styleCenter = () => {
	return {
		display: 'table',
	};
};
const styleWide = () => {
	return {
		display: 'table',
		maxWidth: 'inherit',
		width: '100%',
	};
};

const styleDefault = () => {
	return {
	};
};

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
