/**
 * WordPress dependencies
 */
import { BlockAttributes, registerBlockType } from '@wordpress/blocks';

/**
 * Plugin dependencies
 */
import { svgIcon as icon } from './utils/icons';
import { Edit } from './edit';
import { Save } from './save';
import deprecated from './deprecated';

/* Block settings */
import jsonData from '../block.json';
const blockConfig = jsonData as BlockAttributes;

export const attributes = {
	svg: {
		type: 'string',
		default: '',
	},
	originalSvg: {
		type: 'string',
		default: false,
	},
	href: {
		type: 'string',
		default: undefined,
	},
	linkTarget: {
		type: 'string',
		default: undefined,
	},
	height: {
		type: 'number',
		default: false,
	},
	width: {
		type: 'number',
		default: false,
	},
	rotation: {
		type: 'number',
		default: 0,
	},
	style: {
		type: 'object',
		default: {
			color: {
				duotone: undefined,
			},
		},
	},
};

/**
 * OH-MY-SVG
 * This is a plugin that adds the SVG Block to your Gutenberg block editor.
 *
 * @file index.js
 *
 * @description A Simple plugin that adds the SVG Block to your Gutenberg block editor.
 * @author codekraft
 */
// @ts-ignore
registerBlockType( blockConfig.name, {
	...blockConfig,
	apiVersion: 2,
	icon,
	edit: Edit,
	save: Save,
	attributes,
	deprecated,
} );
