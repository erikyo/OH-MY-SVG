import SvgEl from './components/SvgEl';
import classnames from 'classnames';

import {
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	useBlockProps,
} from '@wordpress/block-editor';
import { SvgAttributesSave } from './types';
import { NEW_TAB_REL } from './utils/constants';
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
	const { href, linkTarget, width, height, title, rotation, align } =
		props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps = useBlockProps.save( {
		style: {
			...getAlignStyle( align ),
			...borderProps.style,
		},
		classNames: classnames(
			align ? `align${ align }` : 'alignnone',
			borderProps.className
		),
	} );

	if ( ! href ) {
		return (
			<div
				{ ...blockProps }
				dangerouslySetInnerHTML={ SvgEl( props.attributes ) }
			/>
		);
	}

	return (
		<div { ...blockProps }>
			<a
				href={ href }
				target={ linkTarget }
				rel={ linkTarget ? NEW_TAB_REL : null }
				aria-label={ title }
				title={ title ?? null }
				dangerouslySetInnerHTML={ SvgEl( props.attributes ) }
			/>
		</div>
	);
};
