import { createHigherOrderComponent } from '@wordpress/compose';
import {
	BlockAlignmentControl,
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
	useSetting,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';
import { svgIcon } from './utils/icons';
import {
	Button,
	DropZone,
	FormFileUpload,
	MenuItem,
	PanelBody,
	PanelRow,
	Placeholder,
	TextareaControl,
} from '@wordpress/components';
import { ALLOWED_MEDIA_TYPES } from './constants';
import {
	loadSvg,
	readSvg,
	encodeSvg,
	optimizeSvg,
	convertSvgToBitmap,
} from './utils/svgTools';
import { SvgoStats } from './utils/components';
import { svgAttributesDef } from './types';

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
			attributes: { ref, url, width, height, svg },
			setAttributes,
			onSelectImage,
			isSelected,
		} = props;

		const { original, markup, originalWidth, originalHeight } = svg;

		const { createErrorNotice, createSuccessNotice } =
			useDispatch( noticesStore );

		const placeholder = (
			content: JSX.Element | React.ReactNode
		): JSX.Element => {
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

		const onSVGO = () => {
			setAttributes( {
				svg: {
					markup: optimizeSvg( markup ),
				},
			} );
		};

		function onRemoveSVG() {
			setAttributes( {
				svg: {
					original: svg.markup,
					markup: null,
				},
				url: null,
			} );
		}

		function onUpdateSvg( result: string | ArrayBuffer, file: File ) {
			const newSvg : svgAttributesDef | null = loadSvg( {
				markup: result,
				fileData: file,
				url: encodeSvg( result.toString() ),
				...props.attributes,
			} );

			if ( newSvg && newSvg.markup ) {
				setAttributes( {
					svg: {
						markup: newSvg.markup,
					},
				} );
			}
		}

		function onGenerateBitmap( svgMarkup: string ) {
			// create a webp with the svg markup using js canvas
			convertSvgToBitmap( {
				svgBase64: encodeSvg( svgMarkup ),
				width,
				height,
			} ).then( ( rasterImage ) => {
				// TODO: store the converted image
				console.log( rasterImage );
				setAttributes( {
					svg: {
						markup: rasterImage,
					},
				} );
			} );
		}

		const controls = (
			<BlockControls
				group={ 'block' }
				chilren={ false }
				components={ false }
			>
				<BlockAlignmentControl />
				<MediaReplaceFlow
					mediaURL={ null }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept={ ALLOWED_MEDIA_TYPES }
					onSelect={ readSvg }
					onError={ ( error: string ) => {
						createErrorNotice( error );
					} }
				>
					<MenuItem onClick={ onRemoveSVG }>
						{ __( 'Reset' ) }
					</MenuItem>
				</MediaReplaceFlow>
			</BlockControls>
		);

		return (
			<>
				<div { ...useBlockProps() }>
					{ controls }
					<InspectorControls>
						<PanelBody title="Editor" initialOpen={ true }>
							<PanelRow>
								<p>
									SVGO
									<SvgoStats
										original={ original }
										compressed={ markup }
									/>
								</p>
								<Button
									isSmall={ true }
									variant={ 'primary' }
									onClick={ onSVGO }
								>
									{ __( 'Optimize' ) }
								</Button>
								<Button
									isSmall={ true }
									variant={ 'primary' }
									onClick={ onGenerateBitmap( markup ) }
								>
									{ __( 'Generate bitmap' ) }
								</Button>
							</PanelRow>

							<hr />

							<TextareaControl
								label={ __( 'SVG Markup Editor' ) }
								value={ markup || '' }
								onChange={ ( newSvg ) => {
									setAttributes( {
										svg: {
											original: markup,
											markup: newSvg,
										},
									} );
								} }
							/>
						</PanelBody>
					</InspectorControls>

					{ isSelected && ! url && (
						<MediaPlaceholder
							onSelect={ onSelectImage }
							onSelectUrl={ null }
							allowedTypes={ ALLOWED_MEDIA_TYPES }
							placeholder={ () =>
								placeholder(
									<>
										<DropZone
											onFilesDrop={ ( files ) => {
												readSvg( files[ 0 ] ).then(
													( result ) =>
														onUpdateSvg(
															result,
															files[ 0 ]
														)
												);
											} }
										/>
										<div style={ { display: 'flex' } }>
											<FormFileUpload
												className={
													'components-button'
												}
												accept={ ALLOWED_MEDIA_TYPES }
												onChange={ ( ev ) => {
													ev.target?.files
														? readSvg(
																ev.target
																	.files[ 0 ]
														  ).then( ( result ) =>
																result
																	? onUpdateSvg(
																			result,
																			ev
																				.target
																				.files[ 0 ]
																	  )
																	: null
														  )
														: null;
												} }
												onError={ ( event ) => {
													createErrorNotice( event );
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
				</div>
				{ url && (
					<BlockEdit { ...useBlockProps.save( { ...props } ) } />
				) }
			</>
		);
	};
}, 'withOhMySvgImg' );