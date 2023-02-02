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

/** Import the block default configuration */
/* Block settings */
import jsonData from '../block.json';
const blockConfig = jsonData as BlockAttributes;

/**
 * Register OH-MY-SVG block
 *
 * @file index.js
 * @name OH-MY-SVG
 * @description A Simple plugin that adds the SVG Block to your Gutenberg block editor.
 * @author codekraft
 *
 */
// @ts-ignore
registerBlockType( blockConfig.name, {
	...blockConfig,
	apiVersion: 2,
	icon,
	edit: Edit,
	save: Save,
	// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/
	supports: {
		align: true,
		anchor: true,
		className: true,
		color: {
			background: true,
			gradients: true,
			text: false,
		},
		__experimentalBorder: {
			__experimentalSkipSerialization: true,
			radius: true,
			width: true,
			color: true,
			style: true,
			__experimentalDefaultControls: {
				radius: true,
			},
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
	},
} );
