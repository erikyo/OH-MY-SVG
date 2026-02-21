import getSVG from './Svg';
import classnames from 'classnames';

import { useBlockProps } from '@wordpress/block-editor';
import { hasAlign } from './utils/fn';
import type { SvgAttributesSave } from './types';

// Extend attributes interface to include mediaUrl
interface ExtendedAttributes extends SvgAttributesSave {
	mediaUrl?: string;
	storage?: 'inline' | 'media';
}
import { NEW_TAB_REL } from './constants';
import { getAlignStyle } from './utils/presets';

/**
 * @module Save
 * @description The svg save function.
 *
 * @param                    props
 * @param {SvgAttributesDef} props.attributes - The props to build the svg
 *
 * @return {JSX.Element} - Returns an anchor tag if the url attribute is set, otherwise it returns a div tag the collection of attributes needed for saving the svg as xml markup
 */
export const Save = (props: {
	attributes: SvgAttributesSave;
}): JSX.Element => {
	const {
		href,
		linkTarget,
		width,
		height,
		title,
		rotation,
		align,
		onclick,
	} = props.attributes;

	const blockProps = useBlockProps.save({
		style: {
			...getAlignStyle(align),
		},
		className: classnames(
			align ? `align${align}` : 'alignnone',
		),
	});

	const SvgTag = () => {
		const style = {
			...getAlignStyle(align),
			margin: hasAlign(align, 'center') ? 'auto' : undefined,
			transform:
				Number(rotation) !== 0
					? `rotate( ${rotation}deg )`
					: undefined,
		};
		const widthAttr = !hasAlign(align, ['full', 'wide']) ? width : '100%';
		const heightAttr = !hasAlign(align, ['full', 'wide']) ? height : undefined;

		if (props.attributes.storage === 'media' && props.attributes.mediaUrl) {
			return (
				<img
					src={props.attributes.mediaUrl}
					alt=""
					style={style}
					width={widthAttr}
					height={heightAttr}
				/>
			);
		}

		return (
			<svg
				dangerouslySetInnerHTML={getSVG(props.attributes)}
				width={widthAttr}
				height={heightAttr}
				style={style}
			/>
		);
	};

	return (
		<div
			{...blockProps}
			dangerouslySetInnerHTML={
				href ? undefined : (props.attributes.storage === 'media' ? undefined : getSVG(props.attributes))
			}
		>
			{href ? (
				<a
					href={href}
					target={linkTarget}
					rel={linkTarget ? NEW_TAB_REL : undefined}
					title={title ?? undefined}
					onClick={onclick}
				>
					<SvgTag />
				</a>
			) : (
				props.attributes.storage === 'media' ? <SvgTag /> : null
			)}
		</div>
	);
};
