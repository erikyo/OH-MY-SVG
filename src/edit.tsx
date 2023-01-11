import { Component, useEffect, useRef, useState } from '@wordpress/element';
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

import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import SVG from './Svg';
import {
	updateColor,
	collectColors,
	optimizeSvg,
	svgRemoveFill,
	svgAddPathStroke,
	loadSvg,
	readSvg,
} from './utils/svgTools';
import { hasAlign, onSvgReadError, scaleProportionally } from './utils/fn';
import { rotationRangePresets } from './utils/presets';
import { ErrorSvg, svgIcon} from './utils/icons';
import { ALLOWED_MEDIA_TYPES, NEW_TAB_REL } from './constants';
import { mediaPreview, SvgoStats } from './utils/components';
import {
	colorDef,
	fileDef,
	svgAttributesDef,
	svgAttributesEditor,
	svgSizes,
} from './types';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * @module Edit
 *
 * @param          props.attributes
 * @param          props.isSelected
 * @param          props.setAttributes
 * @param          props.toggleSelection
 * @description The edit view
 *
 * @param {Object} props                 - the edit view stored props
 *
 * @return {JSX.Element} - the Block editor view
 */
export const Edit = ( props: {
	attributes: svgAttributesDef;
	isSelected: boolean;
	setAttributes: any;
	toggleSelection: any;
} ): JSX.Element => {
	/**
	 * @property {boolean}  isSelected             - if the block is selected
	 * @property {Function} setAttributes          - Setter for the block attributes
	 * @property {Function} toggleSelection        - Setter for the block attributes
	 *
	 * @member props.attributes
	 * @typedef props - the edit props
	 * @typedef attributes        			           - The block attributes
	 * @property {Object}   attributes             - The block attributes
	 * @property {number}   attributes.svg         - the Svg image markup
	 * @property {number}   attributes.height      - the Svg height
	 * @property {number}   attributes.width       - the Svg width
	 * @property {number}   attributes.rotation    - the Svg rotation
	 * @property {number}   attributes.originalSvg - the original Svg before changes
	 * @property {Array}    attributes.colors      - a collection of colors used in the Svg
	 * @property {string}   attributes.url         - the target of the svg hyperlink
	 * @property {string}   attributes.rel         - stores whether the link opens into a new window
	 */
	const { attributes, isSelected, setAttributes, toggleSelection } = props;

	const {
		align,
		linkTarget,
		rel,
		url,
		height,
		width,
		rotation,
		svg,
		originalSvg,
	} = attributes as svgAttributesEditor;

	/**
	 * @function useRef
	 * @description get the reference to the link
	 *
	 * Create a refs for the input element created with the render method
	 *
	 * @typedef link
	 * @property {Object}           link            - the object that contains the data of the http link
	 * @property {string|undefined} link.url        - the link url
	 * @property {string|undefined} link.linkTarget - the link target
	 * @property {string|undefined} link.rel        - the link rel
	 *
	 * @property {Function}         ref             - the reference to that dom node
	 */
	const ref = useRef();
	const isURLSet = !! url;
	const opensInNewTab = linkTarget === '_blank';

	/**
	 * @property {boolean} isEditingURL - a bool value that stores id the link panel is open
	 * @callback setIsEditingURL
	 */
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const [ maxWidth, setMaxWidth ] = useState( null );

	const [ colors, setColors ] = useState< [] | colorDef[] >( [] );
	const [ currentColor, setColor ] = useState< string >( '' );
	const [ pathStrokeWith, setPathStrokeWith ] = useState< number >( 1.0 );
	const [ originalSize, setOriginalSize ] = useState< svgSizes >( {
		width: 50,
		height: 50,
	} );

	/* the block editor sizes */
	const defaultLayout = useSetting( 'layout' ) || {};
	const contentWidth = parseInt( defaultLayout.contentSize );

	/* Emit notices */
	const { createErrorNotice } = useDispatch( noticesStore );

	useEffect( () => {
		// on load collect colors
		if ( svg ) {
			setColors( collectColors( svg ) );
		}
	}, [] );

	useEffect( () => {
		// then set the first color detected as the default color
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
		let size = {};

		/* If the svg is new, it also stores the size of the image and if it is larger than the content, it resizes it. */
		if ( ! originalSvg ) {
			setOriginalSize( {
				width,
				height,
			} );

			/* if the svg with is bigger than the content width rescale it */
			if ( width >= contentWidth ) {
				size = {
					width: contentWidth,
					height: scaleProportionally( width, height, contentWidth ),
				};
			}
		}

		setColors( collectColors( svg ) );

		setAttributes( {
			size,
		} );
	}, [ svg ] );

	/**
	 * Whenever the alignment is changed set the max width of the current block
	 *
	 * @type {useEffect}
	 * @property {attributes.colors} colors - the svg color array
	 */
	useEffect( () => {
		function contentMaxWidth() {
			if ( [ 'wide' ].includes( align ) ) {
				return defaultLayout.wideSize;
			}
			return undefined;
		}
		setMaxWidth( contentMaxWidth() );
	}, [ align ] );

	/**
	 * Handle the checkbox state for "Open in new tab"
	 * If the user has checked the "Open in new tab" checkbox, then set the linkTarget attribute to "_blank" and the rel attribute to "noreferrer noopener".
	 * If the user has unchecked the "Open in new tab" checkbox, then set the linkTarget attribute to undefined and the rel attribute to undefined
	 *
	 * @function onToggleOpenInNewTab
	 *
	 * @param    {boolean}         value      - The value of the checkbox.
	 *
	 * @type {setAttributes}
	 * @property {link.linkTarget} linkTarget - the link target
	 * @property {link.rel}        rel        - the updated link rel
	 */
	function onToggleOpenInNewTab( value: boolean ) {
		const newLinkTarget = value ? '_blank' : undefined;

		let updatedRel = rel;
		if ( newLinkTarget && ! rel ) {
			updatedRel = NEW_TAB_REL;
		} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
			updatedRel = undefined;
		}

		setAttributes( {
			linkTarget: newLinkTarget,
			rel: updatedRel,
		} );
	}

	/**
	 * `startEditing` is a function that takes an event as an argument and prevents the default behavior of the event,
	 * then sets the state of `isEditingURL` to true
	 *
	 * @function startEditing
	 *
	 * @param {Event} event - The event object that triggered the function.
	 */
	function startEditing( event: Event ) {
		event.preventDefault();
		setIsEditingURL( true );
	}

	/**
	 * @function unlink
	 *
	 * @description It sets the attributes of the block to undefined, and then sets the state of the block to not editing the URL
	 */
	function unlink() {
		setAttributes( {
			url: undefined,
			linkTarget: undefined,
			rel: undefined,
		} );
		setIsEditingURL( false );
	}

	/**
	 * Since the updateSvg function is shared we can set attributes with the result of the updateSvg function
	 *
	 * @param {string} result
	 * @param {string} file
	 * @param          file.name
	 * @param          file.size
	 * @param          file.type
	 * @param          file.lastModified
	 * @param          replace
	 */
	const updateSvg = (
		result: string,
		file: File,
		replace: boolean = false
	) => {
		const newSvg = loadSvg( {
			markup: result,
			fileData: file,
			oldProps: props.attributes,
		} );
		if ( newSvg ) {
			setAttributes( {
				...newSvg,
				originalSvg: replace ? newSvg : originalSvg,
			} );
		} else {
			createErrorNotice( ErrorSvg( __( '😓 Error!' ) ) );
		}
	};

	/**
	 * The placeholder component that contains the button and the textarea input
	 *
	 * @param {JSX.Element} content the svg upload placeholder
	 */
	const placeholder = ( content: JSX.Element ) => {
		return (
			<Placeholder
				className="block-editor-media-placeholder"
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
			...borderProps.style, // Border radius, width and style.
			display: hasAlign( align, [ 'center' ] ) ? 'table' : null,
			maxWidth: hasAlign( align, 'full' ) ? 'none' : null,
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : null,
		},
		ref,
		className: classnames( borderProps.className ),
	} );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<Panel>
					<PanelBody title="Settings">
						<ImageSizeControl
							width
							height
							imageWidth={ originalSize.width }
							imageHeight={ originalSize.height }
							onChange={ ( e ) => {
								setAttributes( {
									width: e.width,
									height: e.height,
								} );
							} }
						/>

						<RangeControl
							__nextHasNoMarginBottom
							label={ __( 'Rotation' ) }
							type={ 'number' }
							value={ rotation }
							min={ 0 }
							max={ 359 }
							marks={ rotationRangePresets }
							step={ 1 }
							allowReset={ true }
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
											svg,
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
							onChange={ ( e ) => setPathStrokeWith( e ) }
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
							enablealpha={ true }
							clearable={ false }
							colors={ colors }
							value={ currentColor }
							onChange={ ( newColor ) => {
								if ( newColor ) {
									if (
										colors
											.map( ( c ) => c.color )
											.includes( newColor )
									) {
										console.log(
											`new color ${ newColor } already exists`
										);
									} else {
										setAttributes( {
											svg: updateColor(
												svg,
												newColor,
												currentColor
											),
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
				<BlockControls group="block">
					<ToolbarGroup>
						{ ! isURLSet && (
							<ToolbarButton
								name="link"
								icon={ link }
								title={ __( 'Link' ) }
								onClick={ startEditing }
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

						<FormFileUpload
							type={ 'file' }
							label={ __( 'Replace SVG' ) }
							accept={ ALLOWED_MEDIA_TYPES }
							multiple={ false }
							onChange={ ( ev ) => {
								const newFile: File | boolean =
									ev.target.files !== null
										? ev.target.files[ 0 ]
										: false;
								if ( newFile ) {
									readSvg( newFile ).then( ( newSvg ) => {
										if ( newSvg !== null ) {
											updateSvg( newSvg, newFile, true );
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
						value={ { svg, opensInNewTab } }
						onChange={ ( {
							url: newURL = '',
							opensInNewTab: newOpensInNewTab,
						} ) => {
							setAttributes( { url: newURL } );
							if ( opensInNewTab !== newOpensInNewTab ) {
								onToggleOpenInNewTab( newOpensInNewTab );
							}
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
					minHeight="10"
					minWidth="10"
					maxWidth={ maxWidth }
					lockAspectRatio
					enable={
						! hasAlign( align, [ 'full', 'wide' ] ) && {
							top: false,
							right: ! hasAlign( align, 'right' ),
							bottom: true,
							left: ! hasAlign( align, 'left' ),
						}
					}
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes( {
							height: height + delta.height,
							width: width + delta.width,
						} );
						toggleSelection( true );
					} }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
				>
					<SVG
						{ ...borderProps }
						markup={ svg }
						width={
							! hasAlign( align, [ 'full', 'wide' ] )
								? width
								: false
						}
						height={
							! hasAlign( align, [ 'full', 'wide' ] )
								? height
								: false
						}
						rotation={ rotation }
					/>
				</ResizableBox>
			) : (
				<SVG
					{ ...borderProps }
					markup={ svg }
					width={
						! hasAlign( align, [ 'full', 'wide' ] ) ? width : false
					}
					height={
						! hasAlign( align, [ 'full', 'wide' ] ) ? height : false
					}
					rotation={ rotation }
				/>
			) }

			{ ! svg && (
				<>
					<MediaPlaceholder
						icon={ <BlockIcon icon={ svgIcon } /> }
						type="image"
						multiple={ false }
						mediaPreview={ mediaPreview }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						value={ svg }
						disableMediaButtons={ url }
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
															files[ 0 ],
															true
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
												if (
													ev.target.files !== null
												) {
													readSvg(
														ev.target.files[ 0 ]
													).then( ( newSvg ) =>
														updateSvg(
															newSvg,
															ev.target.files[ 0 ]
														)
													);
												}
											} }
											onError={ () => onSvgReadError }
											variant={ 'secondary' }
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
												updateSvg( newSvg )
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
