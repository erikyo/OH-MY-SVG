import { updateHtmlProp, cleanMarkup } from '../utils/common';
import { hasAlign } from '../utils/svgTools';
import { __experimentalUseBorderProps as useBorderProps } from '@wordpress/block-editor';
import { NEW_TAB_REL } from '../utils/constants';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return { string | null } the SVG components
 */
export const SvgEl = ( attributes: any ): { __html: TrustedHTML } => {
	const { svg, width, height, rotation, align } = attributes;

	const svgStyle =
		Number( rotation ) !== 0 ? `transform:rotate(${ rotation }deg)` : null;

	const svgWidth =
		width && ! hasAlign( align, [ 'full', 'wide' ] ) ? width : '100%';
	const svgHeight =
		height && ! hasAlign( align, [ 'full', 'wide' ] ) ? height : null;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: svgWidth },
		{ prop: 'height', value: svgHeight },
		{ prop: 'style', value: svgStyle || false },
	] );

	return cleanMarkup( svgDoc );
};

function OHMYSVG( {
	attributes,
	borderProps,
	svgRef = undefined,
	tag = 'div',
}: {
	attributes: any;
	borderProps: ReturnType< typeof useBorderProps >;
	svgRef?: React.RefObject< HTMLDivElement >;
	tag?: 'div' | 'a';
} ) {
	const { href, linkTarget, title } = attributes;

	// these are the default attributes for the svg
	const wrapperProps = {
		className: borderProps.className,
		style: {
			...borderProps.style,
			boxSizing: 'border-box',
			width: hasAlign( attributes.align, [ 'full', 'wide', 'none' ] )
				? '100%'
				: attributes.width,
			height: hasAlign( attributes.align, [ 'full', 'wide', 'none' ] )
				? null
				: attributes.height,
			marginLeft: hasAlign( attributes.align, [ 'center' ] )
				? 'auto'
				: null,
			marginRight: hasAlign( attributes.align, [ 'center' ] )
				? 'auto'
				: null,
		},
	};

	// if the tag is a div then it will render a div
	if ( tag === 'div' ) {
		return (
			<div
				{ ...wrapperProps }
				dangerouslySetInnerHTML={ SvgEl( attributes ) }
				ref={ svgRef }
			></div>
		);
	}
	// if the href attribute is set, it will render an anchor tag
	return (
		<a
			{ ...wrapperProps }
			href={ href }
			target={ linkTarget }
			rel={ linkTarget ? NEW_TAB_REL : null }
			aria-label={ title }
			title={ title ?? null }
			dangerouslySetInnerHTML={ SvgEl( attributes ) }
		/>
	);
}

export default OHMYSVG;
