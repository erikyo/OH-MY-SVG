import SVG from './Svg';
import {
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles, getColorClassName,
} from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import { SvgAttributesDef } from './types';
import { SVG_MIN_SIZE } from './constants';
import classnames from 'classnames';
import getColor from "color-2-name/dist/types/color-utils";
import {getBlockStyles} from "@wordpress/blocks/store/selectors";

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
	attributes: SvgAttributesDef;
} ): JSX.Element => {
	const { svg, href, linkTarget, width, height, rotation, align } =
		props.attributes;


	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps: Record< string, unknown > = useBlockProps.save( {
		style: {
			...borderProps.style, // Border radius, width and style.
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : null,
			display: hasAlign( align, 'center' ) ? 'table' : undefined,
		},
		className: classnames( borderProps.className ),
	} );

	const target = linkTarget ? { target: linkTarget } : '';

	return (
		<div { ...blockProps }>
			<SVG
				href={ href }
				target={ target }
				svg={ svg }
				width={
					! hasAlign( align, [ 'full', 'wide' ] ) ? width : SVG_MIN_SIZE
				}
				height={
					! hasAlign( align, [ 'full', 'wide' ] ) ? height : SVG_MIN_SIZE
				}
				rotation={ rotation }
			/>
		</div>
	);
};
