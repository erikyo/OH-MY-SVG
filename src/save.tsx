import SVG from './Svg';
import {
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import classnames from 'classnames';
import { svgAttributesDef } from './types';

/**
 * @module Save
 * @description The svg save function.
 *
 * @param                    props
 * @param {svgAttributesDef} props.attributes - The props to build the svg
 *
 * @return {JSX.Element} - Returns an anchor tag if the url attribute is set, otherwise it returns a div tag the collection of attributes needed for saving the svg as xml markup
 */
export const Save = ( props: {
	attributes: svgAttributesDef;
} ): JSX.Element => {
	const { svg, url, width, height, rotation, align, style, className } =
		props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps: Record< string, unknown > = useBlockProps.save( {
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
		markup: svg,
	} );

	return url ? (
		<a href={ url }>
			<SVG { ...blockProps as svgAttributesDef } />
		</a>
	) : (
		<SVG { ...blockProps as svgAttributesDef } />
	);
};
