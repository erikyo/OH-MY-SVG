import { useBlockProps } from '@wordpress/block-editor';
import DOMPurify from 'dompurify';

// This handles the migration from v1.3.0 to v1.4.0
const v2 = {
	attributes: {
		// 🚨 CRITICAL FIX: We must override the block.json selector for this deprecation.
		// The old block didn't have .svg-block-wrapper, so we just target the immediate inner div.
		svg: {
			type: 'string',
			source: 'html',
			selector: '.wp-block-codekraft-oh-my-svg > div',
		},
		href: {
			type: 'string',
		},
		rel: {
			type: 'string',
		},
		linkTarget: {
			type: 'string',
			default: '_self',
		},
		title: {
			type: 'string',
		},
		height: {
			type: 'number',
		},
		filesize: {
			type: 'number',
		},
		width: {
			type: 'number',
		},
		aspectRatio: {
			type: 'string',
		},
		rotation: {
			type: 'number',
			default: 0,
		},
		style: {
			type: 'object',
			default: {},
		},
	},
	supports: {
		align: true,
		anchor: true,
		className: true,
		color: {
			background: true,
			gradients: true,
		},
		spacing: {
			margin: true,
			padding: true,
			blockGap: true,
		},
	},
	save(props: { attributes: any }) {
		const { attributes } = props;

		// 🚨 CRITICAL FIX: Do NOT use DOMPurify here. The DB contains raw SVG with <style> tags
		// and 'style=' attributes. Sanitizing it will strip them, causing a mismatch with the DB.
		function createMarkup() {
			return {
				__html: attributes.svg || '',
			};
		}

		// Clone the blockProps to strip out forced WP layout defaults
		const blockProps = { ...useBlockProps.save() };

		// Remove forced 'alignnone' class from block.json defaults
		if (typeof blockProps.className === 'string') {
			blockProps.className = blockProps.className
				.replace(/\balignnone\b/g, '')
				.replace(/\s+/g, ' ')
				.trim();
		}

		// Remove forced display: flex from block.json layout support
		if (blockProps.style) {
			blockProps.style = { ...blockProps.style };
			delete blockProps.style.display;
		}

		return (
			<div {...blockProps}>
				<div
					style={{ width: 'inherit' }}
					dangerouslySetInnerHTML={createMarkup()}
				/>
			</div>
		);
	},
};

// The older v1 deprecation
const v1 = {
	supports: {
		align: true,
		anchor: true,
		className: true,
		color: {
			background: true,
			gradients: true,
		},
		spacing: {
			margin: true,
			padding: true,
			blockGap: true,
		},
	},
	attributes: {
		style: {
			type: 'object',
			default: {},
		},
		svg: {
			type: 'string',
			default: '',
		},
		originalSvg: {
			type: 'string',
			default: false,
		},
		url: {
			type: 'string',
			default: '',
		},
		height: {
			type: 'number',
			default: false,
		},
		width: {
			type: 'number',
			default: false,
		},
		rotation: {
			type: 'number',
			default: 0,
		},
		colors: {
			type: 'array',
			default: [],
		},
	},

	migrate(attributes: { url: any }) {
		return {
			...attributes,
			href: attributes.url,
		};
	},

	save(props: { attributes: any }) {
		const { attributes } = props;

		function createMarkup() {
			return {
				__html: DOMPurify.sanitize(attributes.svg) || '',
			};
		}

		const customStyle = {
			width: attributes.width || null,
			height: attributes.height || null,
			transform: attributes.rotation
				? 'rotate(' + attributes.rotation + 'deg)'
				: undefined,
			maxHeight: '100%',
		};

		const blockProps = useBlockProps.save({
			style: customStyle,
		});

		const newBlock = attributes.url ? (
			<a
				{...blockProps}
				href={attributes.url}
				dangerouslySetInnerHTML={createMarkup()}
			/>
		) : (
			<div {...blockProps} dangerouslySetInnerHTML={createMarkup()} />
		);

		return newBlock;
	},
};

export default [v2, v1];
