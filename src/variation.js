import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	MediaPlaceholder,
	useBlockProps,
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

export const SVGBASE64 = 'data:image/svg+xml;base64,';

/**
 * infiniteLoop block Editor scripts
 */
export const withOhMySvgImg = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if (
			props.attributes.className !== 'oh-my-imgsvg' ||
			! props.isSelected
		) {
			return <BlockEdit { ...props } />;
		}

		const {
			name,
			attributes: { url, svg, originalSvg },
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

		const applySVGO = () => {
			setAttributes( {
				svg: optimizeSvg( svg ),
			} );
		};

		function encodeSvg( svgMarkup ) {
			return SVGBASE64 + btoa( svgMarkup );
		}

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
				{ isSelected && ! url && (
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
															url: encodeSvg(
																result
															),
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
															url: encodeSvg(
																result
															),
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
				{ url && <BlockEdit { ...props } /> }
			</>
		);
	};
}, 'withOhMySvgImg' );
