/**
 * WordPress dependencies
 */
import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

/**
 * Plugin dependencies
 */
import { svgIcon as icon } from './utils/icons';
import { Edit } from './edit';
import { Save } from './save';
import { withOhMySvgImg } from './variation';
import { createHigherOrderComponent } from '@wordpress/compose';

/** Import the block default configuration */
const blockConfig = require( './block.json' );

export const ALLOWED_MEDIA_TYPES = [ 'image/svg+xml' ];
export const SVG_VARIATION_NAMESPACE = 'codekraft/oh-my-svg-img';
export const NEW_TAB_REL = 'noreferrer noopener';
export const SVGBASE64 = 'data:image/svg+xml;base64,';
export const SVG_PLUGIN_COLOR = '#FFB13B';

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
 * @type {Edit}
 * @type {Save}
 */
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
			__experimentalDuotone: 'svg',
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
	},
} );

/**
 * Register SVG image block
 */
registerBlockVariation( 'core/image', {
	name: SVG_VARIATION_NAMESPACE,
	title: 'SVG (as image)',
	description: 'Add as image the svg',
	icon,
	isDefault: false,
	keywords: 'svg',
	attributes: {
		namespace: SVG_VARIATION_NAMESPACE,
		className: 'oh-my-imgsvg',
	},
	example: {
		title: 'Svg as image',
		attributes: {
			caption: SVG_VARIATION_NAMESPACE,
			sizeSlug: 'large',
			url: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBOYXZhbCBtaW5lIGljb24gYnkgQXJ0aHVyIFNobGFpbiBmcm9tIFVzZWZ1bGljb25zLmNvbSAtLT4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgd2lkdGg9IjQwMHB4IiBoZWlnaHQ9IjQwMHB4Ij48cGF0aCBkPSJNOTAsNDcuNUw4NSw0Ny41TDg1LDQ1TDc5LjU3Nyw0NUM3OC44MTIsNDAuNDQzLDc3LjAyLDM2LjIzNyw3NC40NDcsMzIuNjI0TDc4LjI4NCwyOC43ODdMNzYuNTE2LDI3LjAxOUw4MC4wNTIsMjMuNDgzTDc2LjUxNiwxOS45NDdMNzIuOTgsMjMuNDgzTDcxLjIxMiwyMS43MTVMNjcuMzc1LDI1LjU1MkM2My43NjEsMjIuOTc5LDU5LjU1NSwyMS4xODcsNTQuOTk5LDIwLjQyMkw1NC45OTksMTVMNTIuNDk5LDE1TDUyLjQ5OSwxMEw0Ny40OTksMTBMNDcuNDk5LDE1TDQ1LDE1TDQ1LDIwLjQyM0M0MC40NDMsMjEuMTg4LDM2LjIzNywyMi45OCwzMi42MjQsMjUuNTUzTDI4Ljc4NywyMS43MTZMMjcuMDE5LDIzLjQ4NEwyMy40ODMsMTkuOTQ4TDE5Ljk0NywyMy40ODRMMjMuNDgzLDI3LjAyTDIxLjcxNSwyOC43ODhMMjUuNTUyLDMyLjYyNUMyMi45NzksMzYuMjM5LDIxLjE4Nyw0MC40NDUsMjAuNDIyLDQ1LjAwMUwxNSw0NS4wMDFMMTUsNDcuNTAxTDEwLDQ3LjUwMUwxMCw1Mi41MDFMMTUsNTIuNTAxTDE1LDU1TDIwLjQyMyw1NUMyMS4xODgsNTkuNTU3LDIyLjk4LDYzLjc2MywyNS41NTMsNjcuMzc2TDIxLjcxNiw3MS4yMTNMMjMuNDg0LDcyLjk4MUwxOS45NDgsNzYuNTE3TDIzLjQ4NCw4MC4wNTNMMjcuMDIsNzYuNTE3TDI4Ljc4OCw3OC4yODVMMzIuNjI1LDc0LjQ0OEMzNi4yMzksNzcuMDIxLDQwLjQ0NSw3OC44MTMsNDUuMDAxLDc5LjU3OEw0NS4wMDEsODVMNDcuNTAxLDg1TDQ3LjUwMSw5MEw1Mi41MDEsOTBMNTIuNTAxLDg1TDU1LDg1TDU1LDc5LjU3N0M1OS41NTcsNzguODEyLDYzLjc2Myw3Ny4wMiw2Ny4zNzYsNzQuNDQ3TDcxLjIxMyw3OC4yODRMNzIuOTgxLDc2LjUxNkw3Ni41MTcsODAuMDUyTDgwLjA1Myw3Ni41MTZMNzYuNTE3LDcyLjk4TDc4LjI4NSw3MS4yMTJMNzQuNDQ4LDY3LjM3NUM3Ny4wMjEsNjMuNzYxLDc4LjgxMyw1OS41NTUsNzkuNTc4LDU0Ljk5OUw4NSw1NC45OTlMODUsNTIuNDk5TDkwLDUyLjQ5OUw5MCw0Ny41Wk01MCwyNUw1MCwzMEMzOC45NzIsMzAsMzAsMzguOTcyLDMwLDUwTDI1LDUwQzI1LDM2LjIxNSwzNi4yMTUsMjUsNTAsMjVaIiBzdHJva2U9Im5vbmUiPjwvcGF0aD48L3N2Zz4=',
		},
	},
	supports: false,
	allowedControls: false,
	scope: [ 'block', 'inserter' ],
	isActive: [ 'namespace' ],
} );

addFilter(
	'blocks.registerBlockType',
	SVG_VARIATION_NAMESPACE,
	( settings ) => {
		if ( settings.name !== 'core/image' ) return settings;

		const { attributes } = settings;
		return {
			...settings,
			supports: {},
			attributes: {
				...attributes,
				svg: {
					default: '',
					type: 'string',
				},
				originalSvg: {
					default: '',
					type: 'string',
				},
			},
		};
	}
);

/**
 * Register SVG image block
 */
addFilter( 'editor.BlockEdit', SVG_VARIATION_NAMESPACE, withOhMySvgImg );

const withClientIdClassName = createHigherOrderComponent(
	( BlockListBlock ) => {
		return ( props ) => {
			return (
				<BlockListBlock
					{ ...props }
					className={ 'block-' + props.clientId }
				/>
			);
		};
	},
	'withClientIdClassName'
);

addFilter(
	'editor.BlockListBlock',
	SVG_VARIATION_NAMESPACE,
	withClientIdClassName
);
