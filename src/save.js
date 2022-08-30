import DOMPurify from 'dompurify';
import { useBlockProps } from '@wordpress/block-editor';
import { blockStyle } from './index';

/**
 * @module Save
 * @description The svg save function.
 *
 * Returns an anchor tag if the url attribute is set, otherwise it returns a div tag
 *
 * @param {attributes} attributes - the collection of attributes needed for saving the svg as xml markup
 *
 * @return {JSX.Element} - the cleaned and optimized svg
 */
const Save = ( { attributes } ) => {
	/**
	 * It returns an object with the svg markup,
	 * which is the value of the SVG markup that's been sanitized by the DOMPurify library
	 *
	 * @return { {__html: string} } - the svg markup sanitized
	 */
	function createMarkup() {
		return {
			__html: DOMPurify.sanitize( attributes.svg ) || '',
		};
	}

	const customStyle = blockStyle(
		attributes.width,
		attributes.height,
		attributes.rotation
	);

	const blockProps = useBlockProps.save( {
		style: customStyle,
	} );

	return attributes.url ? (
		<a
			{ ...blockProps }
			href={ attributes.url }
			dangerouslySetInnerHTML={ createMarkup() }
		/>
	) : (
		<div { ...blockProps } dangerouslySetInnerHTML={ createMarkup() } />
	);
};

export default Save;
