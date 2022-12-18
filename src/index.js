/**
 * WordPress dependencies
 */
import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { svgIcon as icon } from './icons';
/**
 * Plugin dependencies
 */
import { Edit as edit } from './edit';
import { Save as save } from './save';

/** Import the block default configuration */
const blockConfig = require( './block.json' );

/**
 * Register OH-MY-SVG block
 *
 * @file index.js
 * @name OH-MY-SVG
 * @description A Simple plugin that adds the SVG Block to your Gutenberg block editor.
 * @author codekraft
 *
 * @typedef WPBlockSelection
 * @property {Object} supports - the block enabled features - https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/block-supports-in-static-blocks/
 *
 * @type {edit}
 * @type {save}
 */
registerBlockType( blockConfig.name, {
	...blockConfig,
	apiVersion: 2,
	icon,
	edit,
	save,
	// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/
	supports: {
		align: true,
		anchor: true,
		className: true,
		color: {
			background: true,
			gradients: true,
		},
		spacing: {
			margin: true, // Enable margin UI control.
			padding: true, // Enable padding UI control.
			blockGap: true, // Enables block spacing UI control.
		},
	},
	attributes: {
		style: {
			type: 'object',
			default: {},
		},
		svg: {
			type: 'string',
			default: '',
		},
		originalSvg: {
			type: 'string',
			default: false,
		},
		url: {
			type: 'string',
			default: '',
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
		colors: {
			type: 'array',
			default: [],
		},
	},
} );
