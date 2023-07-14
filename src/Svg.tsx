import { updateHtmlProp, cleanMarkup } from './utils/common';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return { string | null } the SVG components
 */
const getSVG = ( attributes: any ): { __html: string } => {
	const { svg, width, height, rotation } = attributes;

	const svgStyle = `transform:rotate(${ rotation }deg)`;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
		{ prop: 'style', value: svgStyle || false },
	] );

	return cleanMarkup( svgDoc );
};

export default getSVG;
