import { updateSvgMarkup } from '../utils/svgTools';
import { NEW_TAB_TARGET } from '../utils/constants';
import type { RefObject } from '@wordpress/element';
import { ErrorSvg } from './icons';
import { SvgAttributesDef } from '../types';

function OHMYSVG( {
	attributes,
	style = {},
	svgData,
	svgRef,
}: {
	attributes: SvgAttributesDef;
	style?: {};
	svgData?: { __html: TrustedHTML };
	svgRef?: RefObject< HTMLDivElement | HTMLAnchorElement >;
} ) {
	const { href, linkTarget, title, rel } = attributes;

	// build the SVG markup
	const cleanMarkup = updateSvgMarkup( attributes );

	// If the attribute href is not set, it will render a div element
	if ( href === undefined ) {
		return (
			<div
				className={ 'svg-block-wrapper' }
				{ ...style }
				dangerouslySetInnerHTML={ cleanMarkup }
				ref={ svgRef as RefObject< HTMLDivElement > }
			/>
		);
	}

	const anchorAttributes = {
		href,
		rel,
		target: linkTarget === NEW_TAB_TARGET ? NEW_TAB_TARGET : null,
		title: title ?? null,
	};

	// otherwise it will render an anchor element
	return (
		<a
			className={ 'svg-block-wrapper' }
			dangerouslySetInnerHTML={ cleanMarkup }
			ref={ svgRef as RefObject< HTMLAnchorElement > }
			{ ...anchorAttributes }
			{ ...style }
		/>
	);
}

export default OHMYSVG;
