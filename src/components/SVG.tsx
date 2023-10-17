import { updateHtmlProp, cleanMarkup } from '../utils/common';
import { hasAlign } from '../utils/svgTools';
import { __experimentalUseBorderProps as useBorderProps } from '@wordpress/block-editor';
import { NEW_TAB_REL } from '../utils/constants';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @param  borderProps
 * @return { string | null } the SVG components
 */
export const SvgEl = (
	attributes: any,
	borderProps = {
		style: { borderWidth: false, borderRadius: false, borderColor: false },
		className: '',
	}
): { __html: TrustedHTML } => {
	const { svg, width, height, rotation, align } = attributes;

	const svgStyle = [
		Number( rotation ) !== 0 ? `transform:rotate(${ rotation }deg)` : null,
		!! borderProps.style.borderWidth &&
			'border-width:' + borderProps.style.borderWidth,
		!! borderProps.style.borderRadius &&
			'border-radius:' + borderProps.style.borderRadius,
		!! borderProps.style.borderColor &&
			'border-color:' + borderProps.style.borderColor,
		'box-sizing: border-box',
	]
		.filter( Boolean )
		.join( ';' );

	const svgWidth =
		width && ! hasAlign( align, [ 'full', 'wide' ] ) ? width : '100%';
	const svgHeight =
		height && ! hasAlign( align, [ 'full', 'wide' ] ) ? height : null;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: svgWidth },
		{ prop: 'height', value: svgHeight },
		{ prop: 'style', value: svgStyle || false },
		{ prop: 'class', value: borderProps.className },
	] );

	return cleanMarkup( svgDoc );
};

function OHMYSVG( {
	attributes,
	borderProps,
	svgRef = undefined,
	tag = undefined,
}: {
	attributes: any;
	borderProps: ReturnType< typeof useBorderProps >;
	svgRef?: React.RefObject< HTMLDivElement >;
	tag?: 'div' | 'a';
} ) {
	const { href, linkTarget, title, align } = attributes;

	// these are the default attributes for the svg
	const wrapperProps = {
		className: 'svg-block-wrapper',
		style: {
			width: hasAlign( align, [ 'full', 'wide', 'none' ] )
				? '100%'
				: attributes.width,
			height: hasAlign( align, [ 'full', 'wide', 'none' ] )
				? null
				: attributes.height,
			marginLeft: hasAlign( align, [ 'center' ] ) ? 'auto' : null,
			marginRight: hasAlign( align, [ 'center' ] ) ? 'auto' : null,
		},
	};

	// the svg tag
	const svgMarkup = SvgEl( attributes, borderProps );

	// if the tag is a div then it will render a div
	if ( tag === 'div' || ! href ) {
		return (
			<div
				{ ...wrapperProps }
				dangerouslySetInnerHTML={ svgMarkup }
				ref={ svgRef }
			/>
		);
	}
	// if the href attribute is set, it will render an anchor tag
	return (
		<a
			{ ...wrapperProps }
			ref={ svgRef }
			href={ href }
			target={ linkTarget }
			rel={ linkTarget ? NEW_TAB_REL : null }
			aria-label={ title }
			title={ title ?? null }
			dangerouslySetInnerHTML={ svgMarkup }
		/>
	);
}

export default OHMYSVG;
