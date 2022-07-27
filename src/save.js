import DOMPurify from 'dompurify';
import { useBlockProps } from '@wordpress/block-editor';
import { blockStyle } from './index';

export const Save = ( { attributes } ) => {
	function createMarkup() {
		return {
			__html: DOMPurify.sanitize( attributes.svg ),
		};
	}

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
			href={ attributes.url }
			dangerouslySetInnerHTML={ createMarkup() }
		/>
	);
};
