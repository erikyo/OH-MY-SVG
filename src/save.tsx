import OHMYSVG from './components/SVG';

import {
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	useBlockProps,
} from '@wordpress/block-editor';
import { SvgAttributesSave } from './types';

/**
 * @module Save
 * @description The svg save function.
 *
 * @param                     props
 * @param {SvgAttributesSave} props.attributes - The props to build the svg
 *
 * @return {JSX.Element} - Returns an anchor tag if the url attribute is set, otherwise it returns a div tag the collection of attributes needed for saving the svg as xml markup
 */
export const Save = ( props: {
	attributes: SvgAttributesSave;
} ): JSX.Element => {
	const { href } = props.attributes;

	const borderProps = getBorderClassesAndStyles( props.attributes );
	const blockProps = useBlockProps.save();

	if ( ! href ) {
		return (
			<div { ...blockProps }>
				<OHMYSVG
					attributes={ props.attributes }
					borderProps={ borderProps }
					tag={ !! href ? 'a' : 'div' }
				/>
			</div>
		);
	}
};
