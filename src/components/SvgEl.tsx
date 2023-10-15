import { updateHtmlProp, cleanMarkup } from '../utils/common';
import { hasAlign } from '../utils/svgTools';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return { string | null } the SVG components
 */
const SvgEl = ( attributes: any ): { __html: string } => {
	const { svg, width, height, rotation, align } = attributes;

	const svgStyle =
		Number( rotation ) !== 0 ? `transform:rotate(${ rotation }deg)` : null;

	const svgWidth =
		width && hasAlign( align, [ 'full', 'wide', 'none' ] ) ? width : '100%';
	const svgHeight =
		height && hasAlign( align, [ 'full', 'wide', 'none' ] )
			? height
			: '100%';

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
		{ prop: 'style', value: svgStyle || false },
	] );

	return cleanMarkup( svgDoc );
};

export default SvgEl;
