import { useEffect, useRef, useState } from '@wordpress/element';
import DOMPurify from 'dompurify';
import {
	Button,
	ColorIndicator,
	ColorPicker,
	Dropdown,
	DropZone,
	FormFileUpload,
	Panel,
	PanelBody,
	PanelRow,
	Popover,
	RangeControl,
	ResizableBox,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
	__experimentalLinkControl as LinkControl,
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { link as linkIcon, linkOff } from '@wordpress/icons';
import SVG from './Svg';
import {
	collectColors,
	optimizeSvg,
	getSvgSize,
	svgRemoveFill,
	svgAddPathStroke,
} from './utils';
import { ErrorSvg } from './icons';

const ALLOWED_MEDIA_TYPES = [ 'image/svg+xml' ];
const NEW_TAB_REL = 'noreferrer noopener';

/**
 * @module Edit
 *
 * @description The edit view
 *
 * @param {Object} props - the edit view stored props
 *
 * @return {JSX.Element} - the Block editor view
 */
export const Edit = ( props ) => {
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
	const {
		style,
		attributes: {
			align,
			linkTarget,
			rel,
			url,
			height,
			width,
			rotation,
			svg,
			originalSvg,
			colors,
		},
		classes,
		isSelected,
		setAttributes,
		toggleSelection,
	} = props;

	/**
	 * @property {number} pathStrokeWith - the width of the border / stroke
	 * @callback setPathStrokeWith
	 */
	const [ pathStrokeWith, setPathStrokeWith ] = useState( 1.0 );

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

	/**
	 * Checking if the block is selected.
	 * If it is not selected, it sets the isEditingURL state to false.
	 *
	 * @type {setIsEditingURL}
	 * @property {boolean} isSelected - if the svg has been selected
	 */
	useEffect( () => {
		if ( isSelected ) {
			setIsEditingURL( false );
		}
	}, [ isSelected ] );

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
	function onToggleOpenInNewTab( value ) {
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
	function startEditing( event ) {
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
	 * Whenever the svg is changed it collects the colors used in the image
	 *
	 * @type {useEffect}
	 * @property {attributes.colors} colors - the svg color array
	 */
	useEffect( () => {
		setAttributes( {
			colors: collectColors( svg ),
		} );
	}, [ svg ] );

	/**
	 * @function loadSvg
	 * @description This function is launched when an SVG file is read.
	 * Sequentially: first cleans up the markup, tries to figure out the size of the image if is possible,
	 * and then replaces the current svg
	 *
	 * @param {attributes.svg|ArrayBuffer} res - The string that was read into the file that is supposed to be a svg
	 */
	const loadSvg = ( res ) => {
		const svgMarkup = DOMPurify.sanitize( res );
		const { parsedWidth, parsedHeight } = getSvgSize( svgMarkup );
		setAttributes( {
			width: parsedWidth || width,
			height: parsedHeight || height,
			originalSvg: svgMarkup || originalSvg || '',
			svg: svgMarkup || ErrorSvg( __( '😓 Error!' ) ),
		} );
	};

	/**
	 * @function updateColor
	 *
	 * @description Replace a color used in the svg image with another color
	 *
	 * @param {string} newColor
	 * @param {string} color
	 */
	const updateColor = ( newColor, color ) => {
		// updates the colors array
		const newSvg = svg.replaceAll( color, newColor );

		/* TODO: i'm lazy but it would be better to replace only the color */
		const colorCollection = collectColors( newSvg ) || [];

		setAttributes( {
			colors: colorCollection,
			svg: newSvg,
		} );
	};

	/**
	 * @function onImageSelect
	 *
	 * @description Triggered when an image is selected with an input of file type
	 *
	 * Loads the file with FileReader and then passes the result to the function that cleans/parses in its contents
	 *
	 * @param {Array} files
	 */
	const onImageSelect = ( files ) => {
		files.forEach( ( file ) => {
			const reader = new window.FileReader();
			reader.onload = () => {
				loadSvg( reader.result );
			};
			reader.onabort = () => {
				throw new Error( 'file reading was aborted' );
			};
			reader.onerror = () => {
				throw new Error( 'file reading has failed' );
			};

			try {
				reader.readAsText( file );
			} catch ( err ) {
				throw new Error( 'Failed to read the given file', {
					cause: err,
				} );
			}
		} );
	};

	/**
	 * @function SvgDropZone
	 * @description The SvgDropZone component
	 *
	 * `<DropZone />` is a component that accepts a function as a prop called `onFilesDrop`.
	 * When a file is dropped into the drop zone, the `onFilesDrop` function is called with the dropped file as an argument
	 *
	 * @return {JSX.Element} DropZone - returns a div with a DropZone component.
	 */
	const SvgDropZone = () => {
		return (
			<div>
				<DropZone
					onFilesDrop={ ( files ) => {
						onImageSelect( files );
					} }
				/>
			</div>
		);
	};

	const blockProps = useBlockProps( {
		style: {
			display: align === 'center' ? 'table' : null,
			maxWidth: align === 'full' ? 'none' : null,
		},
		ref,
		className: classes,
	} );

	return (
		<div { ...blockProps }>
			<InspectorControls key="settings">
				<Panel header="Settings">
					<PanelBody title="Settings">
						<RangeControl
							label={ __( 'Width' ) }
							type={ 'number' }
							value={ width }
							min={ 0 }
							max={ 2000 }
							step={ 1 }
							onChange={ ( ev ) => {
								setAttributes( {
									width: ev,
								} );
							} }
						/>
						<RangeControl
							label={ __( 'Height' ) }
							type={ 'number' }
							value={ height }
							min={ 0 }
							max={ 2000 }
							step={ 1 }
							onChange={ ( ev ) => {
								setAttributes( {
									height: ev,
								} );
							} }
						/>
						<RangeControl
							label={ __( 'Rotation' ) }
							type={ 'number' }
							value={ rotation }
							min={ 0 }
							max={ 359 }
							marks={ [
								{
									value: 0,
									label: '0',
								},
								{
									value: 90,
									label: '90',
								},
								{
									value: 180,
									label: '180',
								},
								{
									value: 270,
									label: '270',
								},
							] }
							step={ 1 }
							onChange={ ( ev ) => {
								setAttributes( {
									rotation: ev,
								} );
							} }
						/>
					</PanelBody>
				</Panel>

				<Panel title="editor">
					<PanelBody title="Editor" initialOpen={ true }>
						<PanelRow>
							<p>SVGO</p>
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

						<hr />

						<TextareaControl
							label={ __( 'SVG Markup Editor' ) }
							value={ svg || '' }
							onChange={ ( ev ) => {
								setAttributes( { svg: ev } );
							} }
						/>
					</PanelBody>
				</Panel>

				<Panel title="colors">
					<PanelBody
						title={ __( 'Colors' ) }
						initialOpen={ true }
						style={ { display: 'flex', flexDirection: 'column' } }
					>
						{ colors &&
							colors.map( ( color, index ) => (
								<div
									key={ index }
									style={ {
										minWidth: '100%',
										borderBottom: '1px solid #f3f3f3',
									} }
								>
									<Dropdown
										renderToggle={ ( { onToggle } ) => (
											<Button onClick={ onToggle }>
												<ColorIndicator
													colorValue={ color }
												/>
												<span
													style={ {
														marginLeft: '8px',
													} }
												>
													{ color }
												</span>
											</Button>
										) }
										renderContent={ () => (
											<ColorPicker
												color={ color }
												onChange={ ( e ) =>
													updateColor( e, color )
												}
												defaultValue={ color }
											/>
										) }
									></Dropdown>
								</div>
							) ) }
					</PanelBody>
				</Panel>
			</InspectorControls>
			{ svg && (
				<BlockControls group="block">
					<ToolbarGroup>
						{ ! isURLSet && (
							<ToolbarButton
								name="link"
								icon={ linkIcon }
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
							onChange={ ( ev ) => {
								onImageSelect(
									Object.values( ev.target.files )
								);
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
					anchorRef={ ref.current }
					focusOnMount={ isEditingURL ? 'firstElement' : false }
				>
					<LinkControl
						className="wp-block-navigation-link__inline-link-input"
						value={ { url } }
						onChange={ ( {
							url: newURL = '',
							opensInNewTab: newOpensInNewTab,
						} ) => {
							setAttributes( { url: newURL } );

							if ( opensInNewTab !== newOpensInNewTab ) {
								onToggleOpenInNewTab( newOpensInNewTab );
							}
						} }
						forceIsEditingLink={ isEditingURL }
					/>
				</Popover>
			) }
			{ svg && isSelected ? (
				<ResizableBox
					size={ {
						width: width ?? 'auto',
						height: height ?? 'auto',
					} }
					showHandle={ isSelected }
					minHeight="10"
					minWidth="10"
					maxWidth="100%"
					lockAspectRatio
					enable={ {
						top: false,
						right: true,
						bottom: true,
						left: true,
					} }
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
						markup={ svg }
						width={ width }
						height={ height }
						rotation={ rotation }
					/>
				</ResizableBox>
			) : (
				<SVG
					markup={ svg }
					width={ width }
					height={ height }
					rotation={ rotation }
				/>
			) }
			{ ! svg && (
				<>
					<div
						className="svg-preview-container"
						style={ {
							backgroundColor: '#fff',
							border: '2px dashed #2271b1',
							padding: '24px',
							borderRadius: '8px',
							textAlign: 'center',
						} }
					>
						<SvgDropZone />
						<p>
							{ __(
								'Drop here your Svg or select one from your computer'
							) }
						</p>
						<MediaUploadCheck>
							<MediaUpload
								type="image"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ svg }
								render={ () => (
									<FormFileUpload
										accept={ ALLOWED_MEDIA_TYPES }
										onChange={ ( ev ) => {
											onImageSelect(
												Object.values( ev.target.files )
											);
										} }
										variant={ 'secondary' }
									>
										{ svg
											? __( 'Replace Object' )
											: __( 'Select Object' ) }
									</FormFileUpload>
								) }
							/>
						</MediaUploadCheck>
						<p style={ { marginTop: '16px' } }>
							{ __( 'or copy and paste the svg markup here:' ) }
						</p>
						<TextareaControl
							onChange={ ( e ) => loadSvg( e ) }
						></TextareaControl>
					</div>
				</>
			) }
		</div>
	);
};
