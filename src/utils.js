import DOMPurify from 'dompurify';
import { optimize } from 'svgo';
import { ErrorSvg } from './icons';
import { __ } from '@wordpress/i18n';

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
 * @function onImageSelect
 * @description Triggered when an image is selected with an input of file type
 *
 * Loads the file with FileReader and then passes the result to the function that cleans/parses in its contents
 *
 * @param {Blob} file
 *
 * @return {Promise} the file reader promise
 */
export const onSvgSelect = async ( file ) => {
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
		const colorRegexp =
			/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g;
		const matchedColors = fileContent.matchAll( colorRegexp );
		for ( const match of matchedColors ) {
			if ( match[ 0 ] ) {
				colorCollection.push( match[ 0 ] );
				if ( colorCollection.length > 20 )
					return [ ...new Set( colorCollection ) ];
			}
		}
	}
	return [ ...new Set( colorCollection ) ] || [];
}

export function scaleProportionally(
	originalWidth,
	originalHeight,
	contentWidth
) {
	return {
		parsedHeight: ( contentWidth / originalWidth ) * originalHeight,
		parsedWidth: contentWidth,
	};
}

/**
 * @function loadSvg
 * @description This function is launched when an SVG file is read.
 * Sequentially: first cleans up the markup, tries to figure out the size of the image if is possible,
 * and then replaces the current svg
 *
 * @param {attributes.svg} res - The string that was read into the file that is supposed to be a svg
 */
export const loadSvg = ( { markup, file, contentSize, ...props } ) => {
	const cleanMarkup = DOMPurify.sanitize( markup );
	let { parsedWidth, parsedHeight } = getSvgSize( cleanMarkup );

	if ( ! parsedWidth && ! parsedHeight && cleanMarkup.length < 10 ) {
		return null;
	}

	const contentWidth = parseInt( contentSize ) || 0;

	if ( parsedWidth >= contentWidth ) {
		[ parsedHeight, parsedWidth ] = scaleProportionally(
			parsedWidth,
			parsedHeight,
			contentWidth
		);
	}

	const filename = file.name || 'svg with no name';

	return {
		...props,
		width: parsedWidth || props.width,
		height: parsedHeight || props.height,
		originalSvg: cleanMarkup || props.originalSvg || '',
		svg: cleanMarkup || ErrorSvg( __( '😓 Error!' ) ),
		alt: __( 'The name of the image is ' ) + filename,
		name: filename,
		size: file.size || cleanMarkup.length,
		type: file.type || 'image/svg+xml',
		lastModified: file.lastModified,
	};
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
 * @param {string} x.svg
 * @param {string} x.pathStrokeColor
 * @param {number} x.pathStrokeWith
 * @param {Array}  x.pathStrokeEl
 */
export const svgAddPathStroke = ( {
	svg,
	pathStrokeColor = '#20FF12',
	pathStrokeWith = 2,
	pathStrokeEl = [ 'path', 'circle', 'rect' ],
} ) => {
	const svgDoc = getSvgDoc( svg );
	svgDoc.querySelectorAll( pathStrokeEl.join() ).forEach( ( item ) => {
		item.setAttribute( 'stroke', pathStrokeColor );
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

export function hasAlign( currentAlign, alignmentCheck ) {
	if ( typeof alignmentCheck === 'object' ) {
		return alignmentCheck.includes( currentAlign );
	}
	return currentAlign === alignmentCheck;
}

/**
 * update a property of the root svg tag
 *
 * @param {string}            prop
 * @param {string|false|null} value
 *
 * @return {string} the svg with the updated property
 */
String.prototype.updateSvgProps = function ( prop, value ) {
	const doc = getSvgDoc( this ).querySelector( 'svg' );
	if ( value ) {
		doc.setAttribute( prop, value );
	} else {
		doc.removeAttribute( prop );
	}
	return getSvgString( doc );
};

/**
 * @function createMarkup
 * @description It takes the SVG string, sanitizes it, and returns it as html
 *
 * @return {Object} The sanitized SVG markup
 */
String.prototype.cleanMarkup = function () {
	return {
		__html: DOMPurify.sanitize( this ),
	};
};

/**
 * Convert byte to human-readable format
 *
 * @property {number} this - the number of char of the string
 */
Number.prototype.humanFileSize = function () {
	const i =
		this === 0 ? 0 : Math.floor( Math.log( this ) / Math.log( 1024 ) );
	return (
		( this / Math.pow( 1024, i ) ).toFixed( 2 ) * 1 +
		[ 'B', 'kB', 'MB', 'GB', 'TB' ][ i ]
	);
};

/* used for rotation range in order to provide a better ux for standard rotations like 90 180 270 */
export const rotationRangePresets = [
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
	{
		value: 270,
		label: '270',
	},
];
