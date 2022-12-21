import { createHigherOrderComponent } from '@wordpress/compose';
import {InspectorControls, MediaPlaceholder} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';

import { ErrorSvg, svgIcon } from './icons';
import {DropZone, FormFileUpload, PanelBody, Placeholder} from '@wordpress/components';
import { ALLOWED_MEDIA_TYPES } from './index';
import { getSvgSize, onSvgSelect } from './utils';
import DOMPurify from 'dompurify';

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

		const {
			name,
			attributes: { width, height },
			setAttributes,
			onSelectImage,
			clientId,
			isSelected,
		} = props;

		const { createErrorNotice, createSuccessNotice } =
			useDispatch( noticesStore );

		const placeholder = ( content ) => {
			return (
				<Placeholder
					className="block-editor-media-placeholder"
					withIllustration={ ! isSelected }
					icon={ svgIcon }
					label={ __( 'Add a SVG (as image)' ) }
					instructions={ __(
						'Drop here your Svg, select one from your computer or copy and paste the svg markup in the textarea below'
					) }
				>
					{ content }
				</Placeholder>
			);
		};

		const loadSvg = ( { markup, file } ) => {
			const svgMarkup = DOMPurify.sanitize( markup );
			const { parsedWidth, parsedHeight } = getSvgSize( svgMarkup );

			if ( ! parsedWidth && ! parsedHeight && svgMarkup.length < 10 ) {
				return null;
			}

			setAttributes( {
				width: parsedWidth || width,
				height: parsedHeight || height,
				// originalSvg: svgMarkup || originalSvg || '',
				svg: svgMarkup || ErrorSvg( __( '😓 Error!' ) ),
				url: `data:image/svg+xml;base64,${ btoa( svgMarkup ) }`,
				name: file.name,
				alt: 'the name of the image is ' + file.name,
				lastModified: file.lastModified,
				size: file.size,
				type: file.type,
			} );
		};

		return (
			<>
				<InspectorControls>
					<PanelBody>
						<p>text</p>
					</PanelBody>
				</InspectorControls>
				{ ! props.attributes.url && (
					<MediaPlaceholder
						onSelect={ onSelectImage }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						placeholder={ () =>
							placeholder(
								<>
									<DropZone
										onFilesDrop={ ( files ) => {
											onSvgSelect( files[ 0 ] ).then(
												( result ) =>
													loadSvg( {
														markup: result,
														file: files[ 0 ],
													} )
											);
										} }
									/>
									<div style={ { display: 'flex' } }>
										<FormFileUpload
											className={ 'components-button' }
											accept={ ALLOWED_MEDIA_TYPES }
											onChange={ ( ev ) => {
												onSvgSelect(
													ev.target.files[ 0 ]
												).then( ( result ) => {
													loadSvg( {
														markup: result,
														file: ev.target
															.files[ 0 ],
													} );
												} );
											} }
											onError={ ( error ) => {
												createErrorNotice( error );
											} }
											variant={ 'secondary' }
										>
											{ __( 'Select a Svg image' ) }
										</FormFileUpload>
									</div>
								</>
							)
						}
					/>
				) }
				{ props.attributes.url && <BlockEdit { ...props } /> }
			</>
		);
	};
}, 'svgImgEdit' );
