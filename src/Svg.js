/**
 * Svg component - it can be used to render SVG files
 *
 * @param {Object}              SVG
 * @param {string}              SVG.markup
 * @param {number|string|false} SVG.width
 * @param {number|string|false} SVG.height
 * @param {number|string|false} SVG.rotation
 *
 * @return {JSX.Element|null} the SVG component
 */
const SVG = ( { markup, width, height, rotation, className } ) => {
	return markup ? (
		<div
			className={ className }
			style={ {
				transform: rotation ? `rotate(${ rotation }deg)` : null,
			} }
			dangerouslySetInnerHTML={ markup
				.updateSvgProps( 'width', width || '100%' )
				.updateSvgProps( 'height', height || false )
				.cleanMarkup() }
		/>
	) : null;
};

export default SVG;
