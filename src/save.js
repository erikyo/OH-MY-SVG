import DOMPurify from 'dompurify';
import { useBlockProps } from '@wordpress/block-editor';
import { blockStyle } from './index';

const Save = ( { attributes } ) => {
	/**
	 * It returns an object with the svg markup,
	 * which is the value of the SVG markup that's been sanitized by the DOMPurify library
	 *
	 * @typedef  {Object} attributes       - the svg edit properties
	 * @property {number} width    - the svg width
	 * @property {number} height   - the svg height
	 * @property {number} rotation - the svg rotation
	 * @property {string} url      - the svg target href
	 *
	 * @return {JSX} Save          - the save view
	 * @typedef Save
	 */
	function createMarkup() {
		return {
			__html: DOMPurify.sanitize( attributes.svg ),
		};
	}

	/** @type {blockStyle} */
	const customStyle = blockStyle(
		attributes.width,
		attributes.height,
		attributes.rotation
	);

	return attributes.url ? (
		<a
			{ ...useBlockProps.save( { style: customStyle } ) }
			href={ attributes.url }
			dangerouslySetInnerHTML={ createMarkup() }
		/>
	) : (
		<div
			{ ...useBlockProps.save( { style: customStyle } ) }
			dangerouslySetInnerHTML={ createMarkup() }
		/>
	);
};

export default Save;
