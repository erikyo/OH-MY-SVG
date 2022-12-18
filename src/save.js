import SVG from './Svg';
import { useBlockProps } from '@wordpress/block-editor';

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
export const Save = ( { attributes } ) => {
	const { svg, url, rotation } = attributes;

	const blockProps = useBlockProps.save( {
		style: {
			// width: width || null,
			// height: height || null,
			transform: rotation ? 'rotate(' + rotation + 'deg)' : null,
			display: 'table',
		},
	} );

	return url ? (
		<a href={ url } { ...blockProps }>
			<SVG { ...attributes } markup={ svg } />
		</a>
	) : (
		<SVG { ...attributes } { ...blockProps } markup={ svg } />
	);
};
