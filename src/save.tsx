import SVG from './Svg';
import {
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import { SvgAttributesDef } from './types';
import { NEW_TAB_REL } from './constants';
import classnames from 'classnames';
import getColor from 'color-2-name/dist/types/color-utils';
import { getAlignStyle } from './utils/presets';

/**
 * @module Save
 * @description The svg save function.
 *
 * @param                    props
 * @param {SvgAttributesDef} props.attributes - The props to build the svg
 *
 * @return {JSX.Element} - Returns an anchor tag if the url attribute is set, otherwise it returns a div tag the collection of attributes needed for saving the svg as xml markup
 */
export const Save = ( props: {
	attributes: SvgAttributesDef;
} ): JSX.Element => {
	const {
		svg,
		href,
		linkTarget,
		width,
		height,
		rotation,
		align,
		style,
		classNames,
	} = props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps: Record< string, unknown > = useBlockProps.save( {
		style: {
			...borderProps.style, // Border radius, width and style.
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : undefined,
			display: hasAlign( align, 'center' ) ? 'table' : undefined,
		},
		className: classnames( classNames, borderProps.className ),
	} );

	const svgTag = (
		<SVG
			svg={ svg }
			width={ ! hasAlign( align, [ 'full', 'wide' ] ) ? width : '100%' }
			height={
				! align || ! hasAlign( align, [ 'full', 'wide' ] )
					? height
					: undefined
			}
			rotation={ rotation }
			style={ { ...style, ...getAlignStyle( align ) } }
		/>
	);

	return (
		<div
			{ ...blockProps }
			style={ {
				...borderProps.style, // Border radius, width and style
			} }
		>
			{ href ? (
				<a
					href={ href }
					target={ linkTarget }
					rel={ linkTarget ? NEW_TAB_REL : undefined }
				>
					{ svgTag }
				</a>
			) : (
				svgTag
			) }
		</div>
	);
};
