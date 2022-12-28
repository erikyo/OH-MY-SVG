import { getSvgDoc, getSvgString } from './svgTools';
import DOMPurify from 'dompurify';

/**
 * update a property of the root svg tag
 *
 * @param {string} svg
 * @param {Array}  props
 *
 * @return {string} the svg with the updated property
 */
export function updateHtmlProp( svg, props ) {
	if ( ! props.length ) return svg;
	const doc = getSvgDoc( svg ).querySelector( 'svg' );
	props.forEach( ( { prop, value } ) => {
		if ( value ) {
			doc.setAttribute( prop, value );
		} else {
			doc.removeAttribute( prop );
		}
	} );
	return getSvgString( doc );
}

/**
 * Sanitizes the svg string
 *
 * @param  svg
 * @description It takes the SVG string, sanitizes it, and returns it as html
 *
 * @return {Object} The sanitized SVG markup
 */
export function cleanMarkup( svg ) {
	return {
		__html: DOMPurify.sanitize( svg ),
	};
}

/**
 * Convert byte to human-readable format
 *
 * @param {number} bytes - the number of char of the string
 */
export function humanFileSize( bytes ) {
	const i =
		bytes === 0 ? 0 : Math.floor( Math.log( bytes ) / Math.log( 1024 ) );
	return (
		( bytes / Math.pow( 1024, i ) ).toFixed( 2 ) * 1 +
		[ 'B', 'kB', 'MB', 'GB', 'TB' ][ i ]
	);
}
