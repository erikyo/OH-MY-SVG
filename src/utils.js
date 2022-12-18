const { optimize } = require( 'svgo' );

/**
 * It takes an SVG document and returns a string representation of it
 *
 * @param {Document} svgDoc - The SVG document that you want to convert to a string.
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
 * update a property of the root svg tag
 *
 * @param {string} source
 * @param {string} prop
 * @param {string} value
 *
 * @return {string} the svg with the updated property
 */
export function updateSvgProps( source, prop, value ) {
	const svgDoc = getSvgDoc( source );
	svgDoc.querySelectorAll( 'svg' ).forEach( ( item ) => {
		item.setAttribute( prop, value + 'px' );
	} );
	return getSvgString( svgDoc );
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
 * @param {string} svg
 * @param {string} pathStrokeColor
 * @param {number} pathStrokeWith
 * @param {array} pathStrokeEl
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
