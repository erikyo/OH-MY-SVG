import SVG from './Svg';
import {
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import classnames from 'classnames';

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
	const { svg, url, width, height, rotation, align, style, className } =
		attributes;

	const borderProps = getBorderClassesAndStyles( attributes );
	const blockProps = useBlockProps.save( {
		rotation,
		style: {
			...style,
			...borderProps.style,
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : null,
			display: hasAlign( align, 'center' ) ? 'table' : null,
		},
		width: ! hasAlign( align, [ 'full', 'wide' ] ) ? width : false,
		height: ! hasAlign( align, [ 'full', 'wide' ] ) ? height : false,
		className: classnames( className, borderProps.class ),
	} );

	return url ? (
		<a href={ url }>
			<SVG { ...blockProps } markup={ svg } />
		</a>
	) : (
		<SVG { ...blockProps } markup={ svg } />
	);
};
