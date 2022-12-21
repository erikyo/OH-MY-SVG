import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	MediaPlaceholder,
	useSetting,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';

import { ErrorSvg, svgIcon } from './icons';
import {
	Button,
	DropZone,
	FormFileUpload,
	PanelBody,
	PanelRow,
	Placeholder,
	TextareaControl,
} from '@wordpress/components';
import { ALLOWED_MEDIA_TYPES } from './index';
import { loadSvg, onSvgSelect, optimizeSvg } from './utils';
import { SvgoStats } from './components';

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
			attributes: { svg, originalSvg },
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

		const defaultLayout = useSetting( 'layout' ) || {};

		const applySVGO = async () => {
			setAttributes( {
				svg: optimizeSvg( svg ),
				imgSrc: `data:image/svg+xml;base64,${ btoa( svg ) }`,
			} );
		};

		return (
			<>
				<InspectorControls>
					<PanelBody title="Editor" initialOpen={ true }>
						<PanelRow>
							<p>
								SVGO
								<SvgoStats
									original={ originalSvg }
									compressed={ svg }
								/>
							</p>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ applySVGO }
							>
								{ __( 'Optimize' ) }
							</Button>
						</PanelRow>

						<hr />

						<TextareaControl
							label={ __( 'SVG Markup Editor' ) }
							value={ svg || '' }
							onChange={ ( ev ) => {
								setAttributes( { svg: ev } );
							} }
						/>
					</PanelBody>
					<PanelBody>
						<p>text</p>
					</PanelBody>
				</InspectorControls>
				{ isSelected && ! props.attributes.imgSrc && (
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
													setAttributes(
														loadSvg( {
															markup: result,
															file: files[ 0 ],
															contentSize:
																defaultLayout.contentSize,
															...props.attributes,
														} )
													)
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
													setAttributes(
														loadSvg( {
															markup: result,
															file: ev.target
																.files[ 0 ],
															contentSize:
																defaultLayout.contentSize,
															...props.attributes,
														} )
													);
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
				{ props.attributes.imgSrc && <BlockEdit { ...props } /> }
			</>
		);
	};
}, 'svgImgEdit' );
