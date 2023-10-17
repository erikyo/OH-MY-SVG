import { getSvgDoc, getSvgString } from './svgTools';
import DOMPurify from 'dompurify';

interface htmlProperty {
	prop: any;
	value: any;
}

/**
 * It takes an SVG string and an array of html properties and returns an SVG string with the properties
 *
 * @param {string}         svg   - the svg string
 * @param {htmlProperty[]} props - an array of objects with two properties:
 * @return A string
 */
export function updateHtmlProp( svg: string, props: htmlProperty[] ): string {
	const doc = getSvgDoc( svg ).querySelector( 'svg' );
	if ( doc !== null ) {
		props.forEach( ( { prop, value } ) => {
			if ( value ) {
				doc.setAttribute( prop, value );
			} else {
				doc.removeAttribute( prop );
			}
		} );
		return getSvgString( doc as any );
	}
	return svg;
}

/**
 * Sanitizes the svg string
 *
 * @param  svg
 * @description It takes the SVG string, sanitizes it, and returns it as html
 *
 * @return {string} The sanitized SVG markup
 */
export function cleanMarkup( svg: string ): { __html: TrustedHTML } {
	return {
		__html: DOMPurify.sanitize( svg ) as unknown as TrustedHTML,
	};
}

/**
 * Convert byte to human-readable format
 *
 * @param {number} bytes - the number of char of the string
 */
export function humanFileSize( bytes: number ): string {
	const i =
		bytes === 0 ? 0 : Math.floor( Math.log( bytes ) / Math.log( 1024 ) );
	return (
		( bytes / Math.pow( 1024, i ) ).toFixed( 2 ) +
		[ 'B', 'kB', 'MB', 'GB', 'TB' ][ i ]
	);
}
