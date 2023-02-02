/** the svg component prop */
export interface SvgAttributesDef {
	svg: string;
	href?: string;
	width: number | string;
	height: number | string;
	rotation?: number;
	align?: string;
	style?: {};
	classNames?: string[];
	linkTarget?: string;
}

/** the svg component prop */
export interface SvgAttributesEditor extends SvgAttributesDef {
	originalSvg?: string; // the original Svg before changes
	rel?: string; // stores whether the link opens into a new window
	fileData?: SvgFileDef;
	alt?: string;
}

/** the svg component prop */
export interface SvgAttributesSave extends SvgAttributesDef {
	className?: string;
}

/** Extending the SvgAttributesDef interface with the svgBase64 property. */
export interface SvgImgAttributesDef extends SvgAttributesDef {
	svgBase64: string;
}

/**
 * `SvgSizeDef` is an object with optional `width` and `height` properties, where each property is
 * either a number or a string.
 *
 * @property {number | string} width  - The width of the SVG element.
 * @property {number | string} height - The height of the SVG.
 */
export type SvgSizeDef = {
	width?: number | string;
	height?: number | string;
};

/**
 * `SvgColorDef` is an object with a `color` property of type `string` and a `name` property of type
 * `string`.
 *
 * @property {string} color - The color value.
 * @property {string} name  - The name of the color.
 */
export type SvgColorDef = {
	color: string;
	name: string;
};

/**
 * `SvgFileDef` is an object with four properties: `name`, `size`, `type`, and `lastModified`.
 *
 * @property {string} name         - The name of the file.
 * @property {number} size         - The size of the file in bytes.
 * @property {string} type         - The type of file. This will always be "image/svg+xml" for SVG files.
 * @property {number} lastModified - The last time the file was modified, in milliseconds since the Unix epoch.
 */
export type SvgFileDef = {
	name: string;
	size: number;
	type: string;
	lastModified: number;
};

/**
 * `SvgStrokeDef` is an object with a `svgMarkup` property that is a string, and optional
 * `pathStrokeWith`, `pathStrokeColor`, and `pathStrokeEl` properties that are numbers and strings,
 * respectively.
 *
 * @property {string}   svgMarkup       - The SVG markup that will be used to create the stroke.
 * @property {number}   pathStrokeWith  - The width of the stroke.
 * @property {string}   pathStrokeColor - The color of the stroke.
 * @property {string[]} pathStrokeEl    - An array of strings that represent the path elements that should
 *                                      be stroked.
 */
export type SvgStrokeDef = {
	svgMarkup: string;
	pathStrokeWith?: number;
	pathStrokeColor?: string;
	pathStrokeEl?: string[];
};
