import { updateHtmlProp, cleanMarkup } from './utils/common';
import { svgAttributesDef } from './types';
import classnames from 'classnames';
import { transform } from '@babel/core';

/**
 * Svg component - it can be used to render SVG files
 *
 * @param  attributes
 * @return {JSX.Element|null} the SVG component
 */
const SVG = ( attributes: svgAttributesDef ): JSX.Element | null => {
	const { markup, width, height, rotation, className, style, filename } =
		attributes;

	const svgDoc = updateHtmlProp( markup, [
		{ prop: 'width', value: width || '100%' },
		{ prop: 'height', value: height || false },
	] );

	const cssTransforms = rotation
		? { transform: `:rotate(${ rotation }deg)` }
		: {};
	const styles = {
		...cssTransforms,
		...style,
	};

	return svgDoc ? (
		<div
			className={ classnames( className ) }
			data-svg={ filename || null }
			style={ styles }
			dangerouslySetInnerHTML={ cleanMarkup( svgDoc ) }
		/>
	) : null;
};

export default SVG;
