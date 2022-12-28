import { updateHtmlProp, cleanMarkup } from './utils/common';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param {Object}              attributes
 * @param {string}              attributes.markup
 * @param {number|string|false} attributes.width
 * @param {number|string|false} attributes.height
 * @param {number|string|false} attributes.rotation
 * @param {string}              attributes.className
 * @param                       attributes.filename
 * @param                       attributes.style
 * @return {JSX.Element|null} the SVG component
 * @param {Object}              attributes
 */
const SVG = ( attributes ) => {
	const { markup, width, height, rotation, className, style, filename } =
		attributes;
	const svgDoc = updateHtmlProp( markup, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
	] );
	return svgDoc ? (
		<div
			className={ className }
			data-svg={ filename || null }
			style={ {
				...style,
				transform: rotation ? `rotate(${ rotation }deg)` : null,
			} }
			dangerouslySetInnerHTML={ cleanMarkup( svgDoc ) }
		/>
	) : null;
};

export default SVG;
