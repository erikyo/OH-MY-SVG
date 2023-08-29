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
import getSVG from './Svg';

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
	const {
		svg,
		href,
		linkTarget,
		width,
		height,
		title,
		rotation,
		align,
		onclick,
		style,
	} = props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps = useBlockProps.save( {
		style: {
			...borderProps.style,
		},
		className: classnames(
			align ? `align${ align }` : 'alignnone',
			borderProps.className
		),
	} );

	const SvgTag = () => (
		<svg
			dangerouslySetInnerHTML={ getSVG( props.attributes ) }
			width={ ! hasAlign( align, [ 'full', 'wide' ] ) ? width : '100%' }
			height={ ! hasAlign( align, [ 'full', 'wide' ] ) ? height : null }
			style={ {
				...getAlignStyle( align ),
				margin: hasAlign( align, 'center' ) ? 'auto' : null,
				transform:
					Number( rotation ) !== 0
						? `rotate( ${ rotation }deg )`
						: null,
			} }
		/>
	);

	return (
		<div
			{ ...blockProps }
			style={ { ...getAlignStyle( align ) } }
			dangerouslySetInnerHTML={
				href ? undefined : getSVG( props.attributes )
			}
		>
			{ href ? (
				<a
					href={ href }
					target={ linkTarget }
					rel={ linkTarget ? NEW_TAB_REL : null }
					title={ title ?? null }
					onclick={ onclick }
					dangerouslySetInnerHTML={ getSVG( props.attributes ) }
				/>
			) : null }
		</div>
	);
};
