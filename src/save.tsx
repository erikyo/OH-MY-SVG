import SVG from './Svg';
import {
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import { SvgAttributesDef, SvgAttributesSave } from './types';
import { BlockSaveProps } from '@wordpress/blocks';
import { SVG_MIN_SIZE } from './constants';
import classnames from 'classnames';

/**
 * @module Save
 * @description The svg save function.
 *
 * @param                    props
 * @param {SvgAttributesDef} props.attributes - The props to build the svg
 *
 * @return {JSX.Element} - Returns an anchor tag if the url attribute is set, otherwise it returns a div tag the collection of attributes needed for saving the svg as xml markup
 */
export const Save = (
	props: BlockSaveProps< SvgAttributesSave >
): JSX.Element => {
	const {
		href,
		linkTarget,
		width,
		height,
		rotation,
		align,
		style,
		svg,
		className,
	} = props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );

	const blockProps = useBlockProps.save( {
		style: {
			...style,
			...borderProps.style,
			display: hasAlign( align, 'center' ) ? 'table' : null,
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : null,
		},
		className: classnames( className, borderProps.className ),
	} );

	const target = linkTarget ? { target: linkTarget } : '';

	const svgTag: JSX.Element = (
		<SVG
			{ ...blockProps }
			svg={ svg }
			width={
				! hasAlign( align, [ 'full', 'wide' ] ) ? width : SVG_MIN_SIZE
			}
			height={
				! hasAlign( align, [ 'full', 'wide' ] ) ? height : SVG_MIN_SIZE
			}
			rotation={ rotation }
		/>
	);

	return href ? (
		<a href={ href } { ...target }>
			{ svgTag }
		</a>
	) : (
		<>{ svgTag }</>
	);
};
