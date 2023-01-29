import { updateHtmlProp, cleanMarkup } from './utils/common';
import { SvgAttributesSave } from './types';
import classnames from 'classnames';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  props
 * @return {JSX.Element|null} the SVG components
 */
const SVG = ( props: SvgAttributesSave ): JSX.Element | null => {
	const { svg, width, height, rotation, className, style } = props;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
	] );

	return svgDoc ? (
		<div
			className={ className }
			style={ {
				...style,
				transform: `rotate(${ rotation }deg)`,
			} }
			dangerouslySetInnerHTML={ cleanMarkup( svgDoc ) }
		/>
	) : null;
};

export default SVG;
