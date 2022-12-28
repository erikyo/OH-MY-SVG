import DOMPurify from 'dompurify';
import { SVGBASE64 } from '../index';
import { optimize } from 'svgo';
import { closest } from 'color2name';
import { __ } from '@wordpress/i18n';
import { ErrorSvg } from './icons';

/**
 * @function onImageSelect
 * @description Triggered when an image is selected with an input of file type
 *
 * Loads the file with FileReader and then passes the result to the function that cleans/parses in its contents
 *
 * @param {Blob} file
 *
 * @return {Promise} the file reader promise
 */
export const readSvg = async ( file ) => {
	return new Promise( ( resolve, reject ) => {
		const reader = new window.FileReader();
		reader.onload = () => {
			resolve( reader.result );
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
 * @function loadSvg
 * @description This function is launched when an SVG file is read.
 * Sequentially: first cleans up the markup, tries to figure out the size of the image if is possible,
 * and then replaces the current svg
 *
 * @param {attributes.svg} res - The string that was read into the file that is supposed to be a svg
 */
export const loadSvg = ( { markup, file, ...props } ) => {
	const cleanMarkup = DOMPurify.sanitize( markup );
	const { parsedHeight, parsedWidth } = getSvgSize( cleanMarkup );

	if ( ! parsedWidth && ! parsedHeight && cleanMarkup.length < 10 ) {
		return null;
	}

	const fileData = file
		? {
				name: file.name,
				alt: __( 'The name of the image is ' ) + file.name,
				size: file.size || cleanMarkup.length,
				type: file.type || 'image/svg+xml',
				lastModified: file.lastModified,
		  }
		: {};

	return {
		...props,
		...fileData,
		width: parsedWidth || props.width,
		height: parsedHeight || props.height,
		svg: cleanMarkup || ErrorSvg( __( '😓 Error!' ) ),
	};
};

/**
 * It takes the SVG string, optimizes it, and then sets the `svg` attribute to the optimized SVG string
 *
 * @param {string} svgString - waits SVGO to optimize the svg then return the markup
 * @return  {string} result
 */
export function optimizeSvg( svgString ) {
	const result = optimize( svgString, {
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
	} );
	return result.data;
}

/**
 * It takes an SVG document and returns a string representation of it
 *
 * @param {SVGSVGElement} svgDoc - The SVG document that you want to convert to a string.
 *
 * @return {string} A uncleaned string of the svgDoc.
 *
 */
export const getSvgString = ( svgDoc ) => {
	const serializer = new window.XMLSerializer();
	return serializer.serializeToString( svgDoc );
};

/**
 * It takes a string of SVG markup and returns a document object
 *
 * @param {string} svgData - The SVG data that you want to convert to a PNG.
 * @return {Object} A DOMParser object.
 */
export const getSvgDoc = ( svgData ) => {
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
export function encodeSvg( svgMarkup ) {
	return SVGBASE64 + btoa( svgMarkup );
}

/**
 * @function collectColors
 *
 * @description Collect the colors used into the svg. It takes a string of text and returns an array of unique colors found in that string
 *
 * @param {attributes.svg} fileContent - The content of the file that you want to extract colors from.
 *
 * @return {*[]} An array of unique colors.
 */
export function collectColors( fileContent ) {
	const colorCollection = [];
	if ( fileContent ) {
		// find all hex, rgb and rgba colors in the target string
		const colorRegexp =
			/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g;
		const matchedColors = fileContent.matchAll( colorRegexp );

		// add the color to the collection (the first 50 colors excluding duplicates)
		for ( const match of matchedColors ) {
			if ( match[ 0 ] && colorCollection.length < 50 ) {
				if ( ! colorCollection.includes( match[ 0 ] ) )
					colorCollection.push( match[ 0 ] );
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
 * @function updateColor
 *
 * @description Replace a color used in the svg image with another color
 *
 * @param {string} svgDoc
 * @param {string} newColor
 * @param {string} color
 */
export const updateColor = ( svgDoc, newColor, color ) => {
	// updates the colors array
	return svgDoc.replaceAll( color, newColor );
};

/**
 * @function getSvgSize
 *
 * @description Parse the svg content to get the size of the svg image look first for viewbox and if not found, the height and width xml properties
 *
 * @param {string} fileContent
 */
export const getSvgSize = ( fileContent ) => {
	const parsedData = {};
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

		return {
			parsedWidth: parsedData.width,
			parsedHeight: parsedData.height,
		};
	}
};

/**
 *  Add a stroke around path, circle, rect this for example is useful if you want to animate the svg line
 *
 * @param {Object} stroke
 * @param {string} stroke.svg
 * @param {string} stroke.pathStrokeColor
 * @param {number} stroke.pathStrokeWith
 * @param {Array}  stroke.pathStrokeEl
 */
export const svgAddPathStroke = ( {
	svg,
	pathStrokeWith = 2,
	pathStrokeColor,
	pathStrokeEl = [ 'path', 'circle', 'rect' ],
} ) => {
	const svgDoc = getSvgDoc( svg );
	svgDoc.querySelectorAll( pathStrokeEl.join() ).forEach( ( item ) => {
		item.setAttribute( 'stroke', pathStrokeColor || '#20FF12' );
		item.setAttribute( 'stroke-width', pathStrokeWith + 'px' );
	} );
	return getSvgString( svgDoc );
};

/**
 * Adds the "fill:transparent" property to the current svg (basically makes it transparent apart from the borders)
 *
 * @param {string} svg - the svg string
 */
export const svgRemoveFill = ( svg ) => {
	const svgDoc = getSvgDoc( svg );
	svgDoc.querySelectorAll( 'path, circle, rect' ).forEach( ( item ) => {
		item.setAttribute( 'fill', 'transparent' );
		if ( item.style.fill ) item.style.fill = 'transparent';
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
	svgBase64,
	sizeRatio = 1,
	height = undefined,
	width = undefined,
	format = 'webp',
	quality = 0.8,
} ) => {
	// Create an image element from the SVG markup
	const img = new window.Image();
	img.src = svgBase64;

	// Create a canvas element
	const canvas = document.createElement( 'canvas' );

	// Set the size of the canvas
	canvas.width = width * sizeRatio;
	canvas.height = height * sizeRatio;

	// Draw the image onto the canvas
	const ctx = canvas.getContext( '2d' );
	ctx.drawImage( img, 0, 0 );
	try {
		return Promise.resolve(
			canvas.toDataURL( `image/${ format }`, quality )
		).then( ( dataUrl ) => dataUrl );
	} catch ( err ) {
		return Promise.reject( err );
	}
};
