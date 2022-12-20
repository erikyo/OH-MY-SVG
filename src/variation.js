import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	useBlockProps,
	store as blockEditorStore,
	MediaPlaceholder,
	mediaUpload,
	BlockIcon,
} from '@wordpress/block-editor';
import { PanelBody, TextareaControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { isBlobURL } from '@wordpress/blob';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

import { svgIcon } from './icons';
import SVG_VARIATION_NAMESPACE from './index';

const ALLOW_SVG = [ 'image/svg+xml' ];

/**
 * infiniteLoop block Editor scripts
 */
export const svgImgEdit = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if (
			props.attributes.className !== 'oh-my-imgsvg' ||
			! props.isSelected
		) {
			return <BlockEdit { ...props } />;
		}

		const { name, attributes, onSelectImage, clientId } = props;

		const { createErrorNotice, createSuccessNotice } =
			useDispatch( noticesStore );

		const { imageSizes, maxWidth, mediaUpload } = useSelect(
			( select ) => {
				const { getSettings } = select( blockEditorStore );

				const settings = Object.fromEntries(
					Object.entries( getSettings() ).filter( ( [ key ] ) =>
						[
							'imageEditing',
							'imageDimensions',
							'imageSizes',
							'maxWidth',
							'mediaUpload',
						].includes( key )
					)
				);

				return { ...settings };
			},
			[ clientId ]
		);

		const selectSVG = ( event ) => {
			event.preventDefault();
			const file = event.target.files[ 0 ];
			const reader = new FileReader();
			reader.onload = () => {
				const { setAttributes } = props;
				setAttributes( {
					url: reader.result,
					alt: file.name,
				} );
			};
			reader.readAsDataURL( file );
		};

		const openModal = ( event ) => {
			event.preventDefault();
			const { setAttributes } = props;
			mediaUpload( {
				allowedTypes: [ 'image/svg+xml' ],
				onFileChange: ( media ) => {
					const { url, alt } = media[ 0 ];
					setAttributes( { url, alt } );
				},
			} );
		};

		return (
			<>
				{ ! props.attributes.url && (
					<MediaPlaceholder
						onSelect={ onSelectImage }
						allowedTypes={ [ 'image/svg+xml' ] }
						labels={ {
							title: __( 'Add SVG' ),
							instructions: __(
								'Upload an SVG file or select one from your media library.'
							),
						} }
					/>
				) }
				{ props.attributes.url && <BlockEdit { ...props } /> }
				<input
					type="file"
					accept="image/svg+xml"
					onChange={ selectSVG }
					style={ { display: 'none' } }
					ref={ ( input ) => input && input.click() }
				/>
				<button onClick={ openModal }>{ __( 'Upload SVG' ) }</button>
			</>
		);
	};
}, 'svgImgEdit' );
