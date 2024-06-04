import OHMYSVG from './components/SVG';

import {
	__experimentalGetElementClassName as getElementClassName,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetShadowClassesAndStyles as getShadowClassesAndStyles,
	useBlockProps,
} from '@wordpress/block-editor';
import { SvgAttributesSave } from './types';
import {
	getRotationCss,
	getWrapperProps,
	updateSvgMarkup,
} from './utils/svgTools';

/**
 * @module Save
 * @description The svg save function.
 *
 * @param                     props.SvgAttributesSave
 * @param                     props
 * @param {SvgAttributesSave} props.attributes        - The props to build the svg
 *
 * @return {JSX.Element} - Returns an anchor tag if the url attribute is set, otherwise it returns a div tag the collection of attributes needed for saving the svg as xml markup
 */
export const Save = ( props: {
	attributes: SvgAttributesSave;
} ): JSX.Element => {
	const attributes = props.attributes;

	const wrapperProps = getWrapperProps( props.attributes, {
		...getBorderClassesAndStyles( attributes ),
		...getShadowClassesAndStyles( attributes ),
	} );

	const svgMarkup = updateSvgMarkup( attributes );
	const blockProps = useBlockProps.save();

	return (
		<div { ...blockProps } style={ wrapperProps }>
			<OHMYSVG
				style={ {
					transform: getRotationCss( attributes.rotation ),
				} }
				attributes={ props.attributes }
				svgData={ svgMarkup }
			/>
		</div>
	);
};
