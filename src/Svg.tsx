import { updateHtmlProp, cleanMarkup } from './utils/common';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return {JSX.Element|null} the SVG components
 */
const SVG = ( attributes: any ): JSX.Element | null => {
	const { svg, width, height, rotation, style, className } = attributes;

	const svgStyle = `transform:rotate(${ rotation }deg)`;

	const svgDoc = updateHtmlProp( svg, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
		{ prop: 'style', value: svgStyle || false },
	] );

	return (
		<div
			style={ {
				...style,
			} }
			className={ className }
			dangerouslySetInnerHTML={ cleanMarkup( svgDoc ) }
		></div>
	);
};

export default SVG;
