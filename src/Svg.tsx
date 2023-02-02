import { updateHtmlProp, cleanMarkup } from './utils/common';
import classnames from 'classnames';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return {JSX.Element|null} the SVG components
 */
const SVG = ( attributes: any ): JSX.Element | null => {
	const { svg, width, height, rotation, style, className } =
		attributes;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
	] );

	return (
		<div
			style={ {
				...style,
				display: 'inline-flex',
				transform: rotation ? `rotate(${ rotation }deg)` : undefined,
			} }
			className={ className }
			dangerouslySetInnerHTML={ cleanMarkup( svgDoc ) }
		></div>
	);
};

export default SVG;
