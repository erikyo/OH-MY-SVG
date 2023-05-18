import { useEffect, useRef, useState } from '@wordpress/element';
import {
	Button,
	FormFileUpload,
	Panel,
	PanelBody,
	PanelRow,
	Popover,
	Placeholder,
	RangeControl,
	ResizableBox,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
	TextControl,
	DropZone,
	ColorPalette,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
	__experimentalUseBorderProps as useBorderProps,
	__experimentalLinkControl as LinkControl,
	__experimentalImageSizeControl as ImageSizeControl,
	useBlockProps,
	MediaPlaceholder,
	BlockIcon,
	useSetting,
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';
import { edit, link, linkOff } from '@wordpress/icons';
import SVG from './Svg';
import {
	updateColor,
	collectColors,
	optimizeSvg,
	svgRemoveFill,
	svgAddPathStroke,
	loadSvg,
	readSvg,
	getSvgSize,
} from './utils/svgTools';
import { hasAlign, onSvgReadError, scaleProportionally } from './utils/fn';
import { getAlignStyle, rotationRangePresets } from './utils/presets';
import { svgIcon } from './utils/icons';
import { ALLOWED_MEDIA_TYPES, NEW_TAB_REL } from './constants';
import { SvgoStats } from './utils/components';
import { SvgColorDef, SvgAttributesEditor, SvgSizeDef } from './types';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';

/**
 * @module Edit
 * @description The edit view
 *
 * @param {Object} props - the edit view stored props
 *
 * @return {JSX.Element} - the Block editor view
 */
export const Edit = (
	props: BlockEditProps< BlockAttributes >
): JSX.Element => {
	const { attributes, setAttributes, isSelected } = props;
	const {
		align,
		height,
		width,
		rotation,
		href,
		linkTarget,
		rel,
		svg,
		originalSvg,
	} = attributes as SvgAttributesEditor;

	const { toggleSelection } = useDispatch( blockEditorStore );

	/**
	 * @function useRef
	 * @description get the reference to the link
	 *
	 * Create a refs for the input element created with the render method
	 *
	 * @typedef link
	 * @property {Object}           link            - the object that contains the data of the http link
	 * @property {string|undefined} link.href       - the link href
	 * @property {string|undefined} link.linkTarget - the link target
	 * @property {string|undefined} link.rel        - the link rel
	 *
	 * @property {Function}         ref             - the reference to that dom node
	 */
	const ref = useRef( null );
	const isURLSet = !! href;
	const opensInNewTab = linkTarget === '_blank';

	/**
	 * @property {boolean} isEditingURL - a bool value that stores id the link panel is open
	 * @callback setIsEditingURL
	 */
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const [ maxWidth, setMaxWidth ] = useState( undefined );

	let [ colors, setColors ] = useState< [] | SvgColorDef[] >( [] );
	const [ currentColor, setColor ] = useState< string >( '' );
	const [ pathStrokeWith, setPathStrokeWith ] = useState< number >( 1.0 );
	const [ originalSize, setOriginalSize ] = useState< SvgSizeDef >( {
		width: 0,
		height: 0,
	} );

	/* the block editor sizes */
	const defaultLayout = useSetting( 'layout' ) || {};
	const contentWidth = parseInt( defaultLayout.contentSize );

	/* Emit notices */
	const { createErrorNotice } = useDispatch( noticesStore );

	/* Setting the first color detected as the default color. */
	useEffect( () => {
		if ( colors.length > 0 )
			setColor( colors?.length ? colors[ 0 ].color : '' );
	}, [ colors ] );

	/**
	 * Checking if the block is selected.
	 * If it is not selected, it sets the isEditingURL state to false.
	 *
	 * @type {setIsEditingURL}
	 * @property {boolean} isSelected - if the svg has been selected
	 */
	useEffect( () => {
		if ( ! isSelected ) {
			setIsEditingURL( false );
		}
	}, [ isSelected ] );

	/**
	 * Whenever the svg is changed it collects the colors used in the image and resize the image accordingly to its container
	 *
	 * @type {useEffect}
	 */
	useEffect( () => {
		setColors( collectColors( svg ) );
	}, [ svg ] );

	/**
	 * Whenever the alignment is changed set the max width of the current block
	 *
	 * @type {useEffect}
	 */
	useEffect( () => {
		if ( align ) {
			function contentMaxWidth() {
				if ( align?.includes( 'wide' ) ) {
					return defaultLayout.wideSize;
				}
				return undefined;
			}
			getSvgBoundingBox( ref.current ); // initial size
			setMaxWidth( contentMaxWidth() );
		}
	}, [ align ] );

	/**
	 *  Using the useEffect hook to collect the colors and size from the SVG onload
	 *
	 * @type {useEffect}
	 */
	useEffect( () => {
		// on load collect colors
		if ( svg ) {
			colors = collectColors( svg );

			const size: SvgSizeDef = getSvgSize( svg );
			setOriginalSize( size );

			setAttributes( {
				originalSvg: originalSvg || svg,
			} );
		}
	}, [] );

	const getSvgBoundingBox = ( el: HTMLElement ) => {
		const rect = el.getBoundingClientRect();
		setAttributes( {
			width: rect.width,
			height: rect.height,
		} );
	};

	/**
	 * Handle the checkbox state for "Open in new tab"
	 * If the user has checked the "Open in new tab" checkbox, then set the linkTarget attribute to "_blank" and the rel attribute to "noreferrer noopener".
	 * If the user has unchecked the "Open in new tab" checkbox, then set the linkTarget attribute to undefined and the rel attribute to undefined
	 *
	 * @param {boolean} value - The value of the url edit area.
	 */
	function setToggleOpenInNewTab( value: boolean ) {
		const newLinkTarget = value ? '_blank' : undefined;

		let updatedRel = rel;
		if ( newLinkTarget && ! rel ) {
			updatedRel = NEW_TAB_REL;
		} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
			updatedRel = undefined;
		}

		return {
			linkTarget: newLinkTarget,
			rel: updatedRel,
		};
	}

	/**
	 * `startEditing` is a function that takes an event as an argument and prevents the default behavior of the event,
	 * then sets the state of `isEditingURL` to true
	 *
	 * @param {Event} event - The event object that triggered the function.
	 */
	function startEditing( event: Event ) {
		event.preventDefault();
		setIsEditingURL( true );
	}

	/**
	 * It sets the attributes of the block to undefined, and then sets the state of the block to not editing the URL
	 */
	function unlink() {
		setAttributes( {
			href: undefined,
			linkTarget: undefined,
			rel: undefined,
		} );
		setIsEditingURL( false );
	}

	/**
	 * Since the updateSvg function is shared we can set attributes with the result of the updateSvg function
	 *
	 * @param result
	 * @param file
	 */
	function updateSvg( result: string, file: File | undefined ) {
		const newSvg = loadSvg( {
			newSvg: result,
			fileData: file || undefined,
			oldSvg: attributes,
		} );

		return newSvg
			? updateSvgData( newSvg )
			: createErrorNotice( __( '😓 cannot update!' ) );
	}

	/**
	 * This function updates the attributes of the original svg and has to be called after each update of the svg shape
	 *
	 * @param newSvg - Partial< BlockAttributes >
	 */
	function updateSvgData( newSvg: Partial< BlockAttributes > ) {
		const newSvgSize = { width: newSvg.width, height: newSvg.height };

		setOriginalSize( newSvgSize );

		/* if the svg with is bigger than the content width rescale it */
		const size =
			newSvg.width >= contentWidth
				? {
						width: contentWidth,
						height: scaleProportionally(
							width,
							height,
							contentWidth
						),
				  }
				: newSvgSize;

		setAttributes( {
			originalSvg: newSvg.svg,
			...newSvg,
			...size,
		} );
	}

	/**
	 * The placeholder component that contains the button and the textarea input
	 *
	 * @param {JSX.Element} content the svg upload placeholder
	 */
	const placeholder = ( content: JSX.Element ) => {
		return (
			<Placeholder
				className="block-editor-media-placeholder"
				// @ts-ignore
				withIllustration={ ! isSelected }
				icon={ svgIcon }
				label={ __( 'SVG' ) }
				instructions={ __(
					'Drop here your Svg, select one from your computer or copy and paste the svg markup in the textarea below'
				) }
			>
				{ content }
			</Placeholder>
		);
	};

	const borderProps = useBorderProps( attributes );
	const blockProps = useBlockProps( {
		style: {
			...borderProps.style,
			display: hasAlign( align, 'center' ) ? 'table' : undefined,
		},
		className: borderProps.className,
		ref,
	} );

	const rawSvg = (
		<SVG
			svg={ svg }
			width={ ! hasAlign( align, [ 'full', 'wide' ] ) ? width : '100%' }
			height={ ! hasAlign( align, [ 'full', 'wide' ] ) ? height : false }
			rotation={ rotation }
			style={ {
				...getAlignStyle( align ),
			} }
		/>
	);

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<Panel>
					<PanelBody title="Settings">
						<ImageSizeControl
							width={ width }
							height={ height }
							imageWidth={ originalSize.width || 0 }
							imageHeight={ originalSize.height || 0 }
							onChange={ ( e: SvgSizeDef ) => {
								setAttributes( {
									width: e.width,
									height: e.height,
								} );
							} }
						/>

						<RangeControl
							// @ts-ignore
							__nextHasNoMarginBottom
							label={ __( 'Rotation' ) }
							value={ rotation || 0 }
							min={ -180 }
							max={ 180 }
							marks={ rotationRangePresets }
							step={ 1 }
							onChange={ ( ev ) => {
								setAttributes( {
									rotation: ev,
								} );
							} }
						/>
					</PanelBody>

					<PanelBody title="Optimization">
						<PanelRow>
							<p>
								SVGO{ ' ' }
								<SvgoStats
									original={ originalSvg }
									compressed={ svg }
								/>
							</p>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ async () =>
									setAttributes( {
										svg: optimizeSvg( svg ),
									} )
								}
							>
								{ __( 'Optimize' ) }
							</Button>
						</PanelRow>

						<PanelRow>
							<p>{ __( 'Restore Original' ) }</p>
							<Button
								disabled={ ! originalSvg }
								isSmall={ true }
								variant={ 'secondary' }
								onClick={ () => {
									setAttributes( {
										svg: originalSvg,
									} );
								} }
							>
								{ __( 'Reset' ) }
							</Button>
						</PanelRow>

						<hr />

						<TextareaControl
							label={ __( 'SVG Markup Editor' ) }
							value={ svg || '' }
							onChange={ ( newSvg ) => {
								setAttributes( { svg: newSvg } );
							} }
						/>
					</PanelBody>

					<PanelBody title={ 'Tools' } initialOpen={ false }>
						<PanelRow>
							<p>{ __( 'Fill' ) }</p>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ () =>
									setAttributes( {
										svg: svgRemoveFill( svg ),
									} )
								}
							>
								{ __( 'Remove Fill' ) }
							</Button>
						</PanelRow>

						<PanelRow>
							<p>{ __( 'Outline' ) }</p>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ () =>
									setAttributes( {
										svg: svgAddPathStroke( {
											svgMarkup: svg,
											pathStrokeWith,
											pathStrokeColor:
												currentColor || undefined,
										} ),
									} )
								}
							>
								{ __( 'Add Stroke' ) }
							</Button>
						</PanelRow>

						<RangeControl
							label={ 'Stroke Size' }
							value={ pathStrokeWith }
							onChange={ ( e ) =>
								typeof e === 'number'
									? setPathStrokeWith( e )
									: null
							}
							min={ 0 }
							max={ 20 }
							step={ 0.1 }
						/>
					</PanelBody>

					<PanelBody title="Editor">
						<h2
							className={ 'block-editor-image-size-control__row' }
						>
							SVG Colors
						</h2>

						<ColorPalette
							enableAlpha={ true }
							clearable={ false }
							colors={ colors }
							value={ currentColor }
							onChange={ ( newColor ) => {
								if ( newColor ) {
									if (
										! colors
											.map( ( c ) => c.color )
											.includes( newColor )
									) {
										const newSvg = updateColor(
											svg,
											newColor,
											currentColor
										);
										setAttributes( {
											...attributes,
											svg: newSvg,
										} );
									}
									setColor( newColor );
								}
							} }
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>

			{ svg && (
				<BlockControls>
					<ToolbarGroup>
						{ ! isURLSet && (
							<ToolbarButton
								name="link"
								icon={ link }
								title={ __( 'Link' ) }
								onClick={ ( e ) => startEditing( e ) }
							/>
						) }
						{ isURLSet && (
							<ToolbarButton
								name="link"
								icon={ linkOff }
								title={ __( 'Unlink' ) }
								onClick={ unlink }
								isActive={ true }
							/>
						) }
						{ isURLSet && (
							<ToolbarButton
								name="edit"
								icon={ edit }
								title={ __( 'Edit' ) }
								onClick={ ( e: any ) => startEditing( e ) }
							/>
						) }

						<FormFileUpload
							type={ 'button' }
							label={ __( 'Replace SVG' ) }
							accept={ ALLOWED_MEDIA_TYPES[ 0 ] }
							multiple={ false }
							onChange={ ( ev ) => {
								const newFile: File | boolean =
									ev.target.files !== null
										? ev.target.files[ 0 ]
										: false;
								if ( newFile ) {
									readSvg( newFile ).then( ( newSvg ) => {
										if ( newSvg !== null ) {
											updateSvg( newSvg, newFile );
										}
									} );
								}
							} }
						>
							Replace
						</FormFileUpload>
					</ToolbarGroup>
				</BlockControls>
			) }

			{ isSelected && isEditingURL && (
				<Popover
					position="bottom center"
					onClose={ () => {
						setIsEditingURL( false );
					} }
					anchor={ ref.current }
					focusOnMount={ isEditingURL ? 'firstElement' : false }
				>
					<LinkControl
						className="wp-block-navigation-link__inline-link-input"
						value={ { url: href, opensInNewTab } }
						onChange={ ( {
							url: newURL = '',
							opensInNewTab: newOpensInNewTab = false,
						} ) => {
							let toggleMeta;

							if ( opensInNewTab !== newOpensInNewTab ) {
								toggleMeta =
									setToggleOpenInNewTab( newOpensInNewTab );
							}

							setAttributes( {
								...toggleMeta,
								href: newURL,
							} );
						} }
						onRemove={ () => {
							unlink();
						} }
						forceIsEditingLink={ isEditingURL }
					/>
				</Popover>
			) }

			{ svg && isSelected ? (
				<ResizableBox
					size={ {
						width: hasAlign( align, [ 'full', 'wide' ] )
							? '100%'
							: width,
						height: hasAlign( align, [ 'full', 'wide' ] )
							? 'auto'
							: height,
					} }
					showHandle={ isSelected && align !== 'full' }
					minHeight={ 10 }
					minWidth={ 10 }
					maxWidth={ maxWidth }
					lockAspectRatio
					enable={
						! hasAlign( align, [ 'full', 'wide' ] )
							? {
									top: false,
									right: ! hasAlign( align, 'right' ),
									bottom: true,
									left: ! hasAlign( align, 'left' ),
							  }
							: undefined
					}
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes( {
							height: Number( height ) + delta.height,
							width: Number( width ) + delta.width,
						} );
						toggleSelection( true );
					} }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
				>
					{ rawSvg }
				</ResizableBox>
			) : (
				rawSvg
			) }
			{ ! svg && (
				<>
					<MediaPlaceholder
						icon={ <BlockIcon icon={ svgIcon } /> }
						multiple={ false }
						mediaPreview={ <>mediaPreview</> }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						disableMediaButtons={ href }
						placeholder={ () =>
							placeholder(
								<>
									<DropZone
										onFilesDrop={ ( files ) => {
											readSvg( files[ 0 ] ).then(
												( newSvg ) => {
													if ( newSvg !== null ) {
														updateSvg(
															newSvg,
															files[ 0 ]
														);
													}
												}
											);
										} }
									/>
									<div style={ { display: 'flex' } }>
										<FormFileUpload
											className={ 'components-button' }
											accept={ ALLOWED_MEDIA_TYPES.join() }
											multiple={ false }
											onChange={ ( ev ) => {
												if ( ev.target.files?.length ) {
													readSvg(
														ev.target.files[ 0 ]
													).then( ( newSvg ) =>
														newSvg &&
														ev.target.files
															? updateSvg(
																	newSvg,
																	ev.target
																		.files[ 0 ]
															  )
															: createErrorNotice(
																	__(
																		'empty file'
																	)
															  )
													);
												}
											} }
											onError={ () => onSvgReadError }
										>
											{ __( 'Select a Svg image' ) }
										</FormFileUpload>
										<TextControl
											className={ 'components-button' }
											placeholder={ __(
												'Paste here your SVG markup'
											) }
											value={ svg }
											onChange={ ( newSvg ) =>
												updateSvg( newSvg, undefined )
											}
										></TextControl>
									</div>
								</>
							)
						}
					/>
				</>
			) }
		</div>
	);
};
