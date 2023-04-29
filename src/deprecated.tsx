import { useBlockProps } from '@wordpress/block-editor';
import DOMPurify from 'dompurify';

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
			margin: true, // Enable margin UI control.
			padding: true, // Enable padding UI control.
			blockGap: true, // Enables block spacing UI control.
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

	migrate( attributes: { url: any } ) {
		return {
			...attributes,
			href: attributes.url,
		};
	},

	save( props: { attributes: any } ) {
		const { attributes } = props;

		function createMarkup() {
			return {
				__html: DOMPurify.sanitize( attributes.svg ) || '',
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

		const blockProps = useBlockProps.save( {
			style: customStyle,
		} );

		const newBlock = attributes.url ? (
			<a
				{ ...blockProps }
				href={ attributes.url }
				dangerouslySetInnerHTML={ createMarkup() }
			/>
		) : (
			<div { ...blockProps } dangerouslySetInnerHTML={ createMarkup() } />
		);

		return newBlock;
	},
};
export default [ v1 ];
