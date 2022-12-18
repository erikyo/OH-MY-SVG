import DOMPurify from 'dompurify';
import { updateSvgProps } from './utils';

const SVG = ( { markup, width, height, rotation } ) => {
	/**
	 * @function createMarkup
	 * @description It takes the SVG string, sanitizes it, and returns it as html
	 *
	 * @return {Object} The sanitized SVG markup
	 */
	function cleanMarkup() {
		markup = updateSvgProps( markup, 'width', width );
		markup = updateSvgProps( markup, 'height', height );
		return {
			__html: DOMPurify.sanitize( markup ),
		};
	}

	return markup ? (
		<div
			style={ {
				transform: `rotate(${ rotation }deg)`
			} }
			dangerouslySetInnerHTML={ cleanMarkup() }
		/>
	) : null;
};

export default SVG;
