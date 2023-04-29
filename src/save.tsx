import SVG from './Svg';
import classnames from 'classnames';

import {
	useBlockProps,
	// @ts-ignore
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import { SvgAttributesDef, SvgAttributesSave } from './types';
import { NEW_TAB_REL } from './constants';
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
	attributes: SvgAttributesSave;
} ): JSX.Element => {
	const { svg, href, linkTarget, width, height, rotation, align } =
		props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps = useBlockProps.save( {
		style: {
			...borderProps.style,
			display: hasAlign( align, 'center' ) ? 'table' : undefined,
		},
		className: classnames(
			align ? `align${ align }` : 'none',
			borderProps.className
		),
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
			style={ {
				...getAlignStyle( align ),
			} }
		/>
	);

	return (
		<div { ...blockProps }>
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
