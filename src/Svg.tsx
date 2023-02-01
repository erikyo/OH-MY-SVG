import { updateHtmlProp, cleanMarkup } from './utils/common';
import classnames from 'classnames';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return {JSX.Element|null} the SVG components
 */
const SVG = ( attributes: any ): JSX.Element | null => {
	const { svg, width, height, rotation, href, target, borderProps } =
		attributes;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
	] );

	const svgTag = (
		<div
			className={ classnames( 'block-svg', borderProps?.className ) }
			style={ {
				transform: rotation ? `rotate(${ rotation }deg)` : undefined,
			} }
			dangerouslySetInnerHTML={ cleanMarkup( svgDoc ) }
		></div>
	);

	return href ? (
		<a href={ href } { ...target }>
			{ svgTag }
		</a>
	) : (
		svgTag
	);
};

export default SVG;
