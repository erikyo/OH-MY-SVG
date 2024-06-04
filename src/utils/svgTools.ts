import DOMPurify from 'dompurify';
import {
	SVG_EDITABLE_ELEMENTS,
	SVG_MIN_SIZE,
	SVGBASE64,
	SVGO_DEFAULTS,
} from './constants';
import { closest } from 'color-2-name';
import { __ } from '@wordpress/i18n';
import {
	SvgAttributesDef,
	SvgAttributesEditor,
	SvgColorDef,
	SvgFileDef,
	SvgSizeDef,
	SvgStrokeDef,
} from '../types';
import type { BlockAttributes } from '@wordpress/blocks';
import { cleanMarkup, updateHtmlProp } from './common';

/**
 * Triggered when an image is selected with an input of file type
 *
 * Loads the file with FileReader and then passes the result to the function that cleans/parses in its contents
 *
 * @param {Blob} file
 *
 * @return {Promise} the file reader promise
 */
export const readSvg = async ( file: Blob ): Promise< string | null > => {
	return new Promise( ( resolve, reject ) => {
		const reader = new window.FileReader();
		reader.onload = () => {
			resolve( reader.result ? reader.result.toString() : null );
		};
		reader.onabort = () => {
			reject( 'file reading was aborted' );
		};
		reader.onerror = () => {
			reject( 'file reading has failed' );
		};

		try {
			reader.readAsText( file );
		} catch ( err ) {
			reject( err );
		}
	} );
};

/**
 * This function is launched when an SVG file is read.
 * Sequentially: first cleans up the markup, tries to figure out the size of the image if is possible,
 * and then replaces the current svg
 *
 * @param {SvgAttributesDef} res - The string that was read into the file that is supposed to be a svg
 */
export const loadSvg = ( {
	newSvg,
	fileData,
	oldSvg,
}: {
	newSvg: string;
	fileData: File | undefined;
	oldSvg: BlockAttributes;
} ): SvgAttributesEditor | null => {
	const cleanSvg = DOMPurify.sanitize( newSvg );
	const newSvgSize = getSvgSize( cleanSvg ) as SvgSizeDef;

	if ( ! newSvgSize.width && ! newSvgSize.height && cleanSvg.length < 10 ) {
		return null;
	}

	const fileMetaData: SvgFileDef | undefined = fileData
		? {
				name: fileData.name,
				size: fileData.size || cleanSvg.length,
				type: fileData.type || 'image/svg+xml',
				lastModified: fileData.lastModified,
		  }
		: undefined;

	if ( cleanSvg ) {
		return {
			alt:
				__( 'The name of the image is ' ) + fileMetaData?.name ??
				__( 'undefined' ),
			fileData: fileMetaData,
			width: newSvgSize.width || oldSvg.width || SVG_MIN_SIZE * 10,
			height: newSvgSize.height || oldSvg.height || SVG_MIN_SIZE * 10,
			svg: cleanSvg,
		};
	}

	return null;
};

/**
 * It takes the SVG string, optimizes it, and then sets the `svg` attribute to the optimized SVG string
 *
 * @param {string} svgString - waits SVGO to optimize the svg then return the markup
 * @return  {string} result
 */
export async function optimizeSvg( svgString: string ): Promise< string > {
	const { optimize } = await import( 'svgo' );
	const result = optimize( svgString, SVGO_DEFAULTS );
	return result.data;
}

/**
 * It takes an SVG document and returns a string representation of it
 *
 * @param {Document} svgDoc - The SVG document that you want to convert to a string.
 *
 * @return {string} A uncleaned string of the svgDoc.
 */
export const getSvgString = ( svgDoc: Document ): string => {
	const serializer = new window.XMLSerializer();
	return serializer.serializeToString( svgDoc );
};

/**
 * It takes a string of SVG markup and returns a document object
 *
 * @param {string} svgData - The SVG data that you want to convert to a PNG.
 * @return {Document} A DOMParser object.
 */
export const getSvgDoc = ( svgData: string ): Document => {
	const parser = new window.DOMParser();
	return parser.parseFromString( svgData, 'image/svg+xml' );
};

/**
 * It takes a string of SVG markup and returns a document object
 *
 * @param {string} svgMarkup
 *
 * @return {string} the src url of the given svg markup
 */
export function encodeSvg( svgMarkup: string ): string {
	return SVGBASE64 + btoa( svgMarkup );
}

/**
 * Collect the colors used into the svg. It takes a string of text and returns an array of unique colors found in that string
 *
 * @param fileContent - The content of the file that you want to extract colors from.
 *
 * @return An array of unique colors.
 */
export function collectColors( fileContent: string ): SvgColorDef[] {
	const colorCollection: string[] = [];
	if ( fileContent ) {
		// find all hex, rgb and rgba colors in the target string
		const colorRegexp =
			/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g;
		const matchedColors = fileContent.matchAll( colorRegexp );

		// add the color to the collection (the first 50 colors excluding duplicates)
		for ( const match of matchedColors ) {
			if ( match[ 0 ] && colorCollection.length < 50 ) {
				if ( ! colorCollection.includes( match[ 0 ] ) ) {
					colorCollection.push( match[ 0 ] );
				}
			}
		}
	}
	return (
		[
			...colorCollection.map( ( color ) => {
				return {
					color,
					name: closest( color ).name,
				};
			} ),
		] || []
	);
}

/**
 * Replaces a color used in the svg image with another color
 *
 * @param {string} svgDoc
 * @param {string} newColor
 * @param {string} color
 */
export const updateColor = (
	svgDoc: string,
	newColor: string,
	color: string
): string => {
	// updates the colors array
	return svgDoc.replaceAll( color, newColor );
};

/**
 * Parse the svg content to get the size of the svg image look first for viewbox and if not found, the height and width xml properties
 *
 * @param {string} fileContent
 */
export function getSvgSize( fileContent: string ): SvgSizeDef {
	const parsedData: SvgSizeDef = {
		width: 0,
		height: 0,
	};
	if ( fileContent ) {
		// then get the image size data
		const viewBox = fileContent.match( /viewBox=["']([^\\"']*)/ );
		if ( viewBox ) {
			const svgDataRaw = viewBox[ 1 ].split( ' ' );
			parsedData.width = parseInt( svgDataRaw[ 2 ], 10 );
			parsedData.height = parseInt( svgDataRaw[ 3 ], 10 );
		} else {
			const sizes = [
				...fileContent.matchAll( /(height|width)=["']([^\\"']*)/g ),
			];
			sizes.forEach( ( size ) => {
				switch ( size[ 1 ] ) {
					case 'width':
					case 'height':
						return ( parsedData[ size[ 1 ] ] = parseInt(
							size[ 2 ],
							10
						) );
				}
			} );
		}
	}

	return parsedData;
}

/**
 *  Add a stroke around path, circle, rect this for example is useful if you want to animate the svg line
 *
 * @param {Object} stroke
 * @param {string} stroke.svgMarkup
 * @param {string} stroke.pathStrokeColor
 * @param {number} stroke.pathStrokeWith
 * @param {Array}  stroke.pathStrokeEl
 */
export const svgAddPathStroke = ( {
	svgMarkup,
	pathStrokeWith = 2,
	pathStrokeColor,
	pathStrokeEl = SVG_EDITABLE_ELEMENTS,
}: SvgStrokeDef ) => {
	const svgDoc = getSvgDoc( svgMarkup );
	svgDoc.querySelectorAll( pathStrokeEl.join() ).forEach( ( item ) => {
		item.setAttribute( 'stroke', pathStrokeColor ?? '#20FF12' );
		item.setAttribute( 'stroke-width', pathStrokeWith + 'px' );
	} );
	return getSvgString( svgDoc );
};

/**
 * Adds the "fill:transparent" property to the current svg (basically makes it transparent apart from the borders)
 *
 * @param {string} svgMarkup - the svg string
 */
export const svgRemoveFill = ( svgMarkup: string ): string => {
	const svgDoc = getSvgDoc( svgMarkup );
	svgDoc
		.querySelectorAll< HTMLElement >( SVG_EDITABLE_ELEMENTS.join( ', ' ) )
		.forEach( ( item ) => {
			item.setAttribute( 'fill', 'transparent' );
			if ( item.style.fill ) {
				item.style.fill = 'transparent';
			}
		} );
	return getSvgString( svgDoc );
};

/**
 *	Using a base64 encoded svg image get the svg image and render it as bitmap data
 *
 * @param {Object} bitmap
 * @param {string} bitmap.svgBase64
 * @param {number} bitmap.sizeRatio
 * @param {number} bitmap.width
 * @param {number} bitmap.height
 * @param {string} bitmap.format
 * @param {number} bitmap.quality
 *
 * @return {Promise<string>} the svg as bitmap image
 */
export const convertSvgToBitmap = async ( {
	svgBase64 = '',
	sizeRatio = 1,
	height = 100,
	width = 100,
	format = 'webp',
	quality = 0.8,
}: {
	svgBase64?: string;
	sizeRatio?: number;
	height?: number;
	width?: number;
	format?: string;
	quality?: number;
} ): Promise< string > => {
	// Create an image element from the SVG markup
	const img = new window.Image();
	img.src = svgBase64 as string;

	// Create a canvas element
	const canvas = document.createElement( 'canvas' );

	// Set the size of the canvas
	canvas.width = width * sizeRatio;
	canvas.height = height * sizeRatio;

	// Draw the image onto the canvas
	const ctx = canvas.getContext( '2d' );
	try {
		ctx?.drawImage( img, 0, 0 );
		return Promise.resolve(
			canvas.toDataURL( `image/${ format }`, quality )
		).then( ( dataUrl ) => dataUrl );
	} catch ( err ) {
		return Promise.reject( err );
	}
};

/**
 * Check if the current align is the one specified
 *
 * @param {string}          currentAlign   - the current align
 * @param {string|string[]} alignmentCheck
 * @return {boolean} true if the alignment check contains the current alignment
 */
export function hasAlign(
	currentAlign: string = 'none',
	alignmentCheck: string | string[]
): boolean {
	if ( alignmentCheck instanceof Array ) {
		return alignmentCheck.includes( currentAlign );
	}
	return currentAlign === alignmentCheck;
}

/**
 * if the limit is bigger than the original values returns the proportionally scaled second value
 * this is useful to resize an image because given the container size the image width will be of the size of the limit and the height will be proportionally scaled
 *
 * @param {number} first
 * @param {number} second
 * @param {number} limit
 * @return {number} the second value (the height of the image, the width is the limit size)
 */
export function scaleProportionally(
	first: number,
	second: number,
	limit: number
): number {
	return Math.round( ( limit / first ) * second );
}

/**
 * It throws an error if the file fails to read
 *
 * @param {string} err - string - The error message that was thrown.
 */
export const onSvgReadError = ( err: string ): Error => {
	throw new Error( 'Failed to read the given file' + err );
};

/**
 * Get the bounding box of an SVG element.
 *
 * @param {HTMLElement} el - The SVG element.
 */
export const getSvgBoundingBox = ( el: HTMLElement ): SvgSizeDef => {
	const rect = el?.getBoundingClientRect();
	return {
		width: rect?.width,
		height: rect?.height,
	};
};

/**
 * Returns the maximum content width based on the alignment.
 *
 * @param  align                     The alignment to check for
 * @param  defaultLayout             The default layout value
 * @param  defaultLayout.contentSize The content size
 * @param  defaultLayout.wideSize    The wide size
 *
 * @return {number|undefined} The maximum content width. Returns `defaultLayout.contentSize` if `align` is undefined,
 * `defaultLayout.wideSize` if `align` is 'wide', and `undefined` otherwise.
 */
export function contentMaxWidth(
	align: string,
	defaultLayout: { contentSize?: number; wideSize?: number }
): number | undefined {
	if ( typeof align === 'undefined' ) {
		return defaultLayout.contentSize;
	} else if ( align === 'wide' ) {
		return defaultLayout.wideSize;
	}
	return undefined;
}

/**
 * Returns the CSS rotation value based on the given rotation angle.
 *
 * @param {number} rotation - The rotation angle in degrees.
 * @return {string | null} The CSS rotation value or null if the rotation angle is 0.
 */
export function getRotationCss( rotation: number ) {
	return Number( rotation ) !== 0 ? `rotate(${ rotation }deg)` : null;
}

/**
 * This function updates the SVG markup with the new attributes.
 *
 * @param  attributes - The attributes to update the SVG markup with.
 * @param svgMarkup The SVG markup to update.
 * @return { string | null } the SVG components
 */
export const updateSvgMarkup = (
	attributes: SvgAttributesDef,
	svgMarkup?: string
): { __html: TrustedHTML } => {
	const { svg, width, height, align } = attributes;

	const svgWidth =
		width && ! hasAlign( align, [ 'full', 'wide' ] ) ? width : '100%';
	const svgHeight =
		height && ! hasAlign( align, [ 'full', 'wide' ] ) ? height : null;

	const svgDoc = updateHtmlProp( svgMarkup ?? svg, [
		{ prop: 'width', value: svgWidth },
		{ prop: 'height', value: svgHeight },
	] );

	return cleanMarkup( svgDoc );
};

/**
 * Returns the props for the SVG wrapper component.
 *
 * @param {SvgAttributesDef} attributes                      - The attributes for the SVG component.
 * @param {Object}           [customStyle={}]                - The custom styles for the wrapper component.
 * @param {string}           [className='svg-block-wrapper'] - The class name for the wrapper component.
 * @return {Object} The props for the SVG wrapper component.
 */
export function getWrapperProps(
	attributes: SvgAttributesDef,
	customStyle: Record< string, {} > = {}
): Record< string, string | number > {
	const { width, height, aspectRatio, scale, align } = attributes;
	// These are the default attributes for the svg
	return {
		...customStyle,
		width: hasAlign( align, [ 'full', 'wide', 'none' ] ) ? null : width,
		height: hasAlign( align, [ 'full', 'wide', 'none' ] )
			? null
			: height,
		transform: getRotationCss( attributes.rotation ),
		aspectRatio,
		objectFit: scale,
		marginLeft: hasAlign( align, [ 'center' ] ) ? 'auto' : null,
		marginRight: hasAlign( align, [ 'center' ] ) ? 'auto' : null,
	};
}
