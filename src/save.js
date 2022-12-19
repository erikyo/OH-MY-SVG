import SVG from './Svg';
import { useBlockProps } from '@wordpress/block-editor';
import { hasAlign } from './utils';

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
	const { svg, url, width, height, rotation, align, className } = attributes;

	const blockProps = useBlockProps.save( {
		className,
		rotation,
		style: {
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : null,
			display: hasAlign( align, 'center' ) ? 'table' : null,
		},
		width: ! hasAlign( align, [ 'full', 'wide' ] ) ? width : false,
		height: ! hasAlign( align, [ 'full', 'wide' ] ) ? height : false,
	} );

	return url ? (
		<a href={ url }>
			<SVG { ...blockProps } markup={ svg } />
		</a>
	) : (
		<SVG { ...blockProps } markup={ svg } />
	);
};
