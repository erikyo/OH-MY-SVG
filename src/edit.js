import { Component, useEffect, useRef, useState } from '@wordpress/element';
import optimize from 'svgo-browser/lib/optimize';
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
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { blockStyle } from './index';
import { link as linkIcon, linkOff } from '@wordpress/icons';

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
const Edit = ( props ) => {
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
	 * @function optimizeSvg
	 * @description - SVGO Optimizations
	 *
	 * It takes the SVG string, optimizes it, and then sets the `svg` attribute to the optimized SVG string
	 *
	 * @type {setAttributes}
	 * @property {attributes.svg} svg - waits SVGO to optimize the svg then return the markup
	 */
	const optimizeSvg = () => {
		optimize( svg ).then( ( el ) => {
			setAttributes( {
				svg: el,
			} );
		} );
	};

	/**
	 * @function getSvgDoc
	 *
	 * @description It takes a string of SVG markup and returns a document object
	 *
	 * @param {string} svgData - The SVG data that you want to convert to a PNG.
	 * @return {Object} A DOMParser object.
	 */
	const getSvgDoc = ( svgData ) => {
		const parser = new window.DOMParser();
		return parser.parseFromString( svgData, 'image/svg+xml' );
	};

	/**
	 * @function getSvgString
	 *
	 * @description It takes an SVG document and returns a string representation of it
	 *
	 * @param {Node} svgDoc - The SVG document that you want to convert to a string.
	 *
	 * @return {string} A uncleaned string of the svgDoc.
	 *
	 */
	const getSvgString = ( svgDoc ) => {
		const serializer = new window.XMLSerializer();
		return serializer.serializeToString( svgDoc );
	};

	/**
	 * @function collectColors
	 *
	 * @description Collect the colors used into the svg. It takes a string of text and returns an array of unique colors found in that string
	 *
	 * @param {attributes.svg} fileContent - The content of the file that you want to extract colors from.
	 *
	 * @return {attributes.colors} An array of unique colors.
	 */
	function collectColors( fileContent ) {
		const colorCollection = [];
		if ( fileContent ) {
			const colorRegexp =
				/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g;
			const matchedColors = fileContent.matchAll( colorRegexp );
			for ( const match of matchedColors ) {
				if ( match[ 0 ] ) {
					colorCollection.push( match[ 0 ] );
					if ( colorCollection.length > 20 )
						return [ ...new Set( colorCollection ) ];
				}
			}
		}
		return [ ...new Set( colorCollection ) ] || [];
	}

	/**
	 * Whenever the svg is changed it collects the colors used in the image
	 *
	 * @type {useEffect}
	 * @property {attributes.colors} colors - the svg color array
	 */
	useEffect( () => {
		const colorCollection = collectColors( svg );
		setAttributes( {
			colors: colorCollection,
		} );
	}, [ svg ] );

	/**
	 * @function loadSvg
	 * @description This function is launched when an SVG file is read.
	 * Sequentially: first cleans up the markup, tries to figure out the size of the image if is possible,
	 * and then replaces the current svg
	 *
	 * @param {attributes.svg} res - The string that was read into the file that is supposed to be a svg
	 */
	const loadSvg = ( res ) => {
		const svgMarkup = DOMPurify.sanitize( res );
		getSvgSize( svgMarkup );
		setAttributes( {
			originalSvg: svgMarkup || originalSvg || '',
			svg: svgMarkup || '😓 error!',
		} );
	};

	/**
	 * @function svgAddPathStroke
	 *
	 * @description Add a stroke around path, circle, rect this for example is useful if you want to animate the svg line
	 */
	const svgAddPathStroke = () => {
		// TODO: attributes {el: [path, circle, rect], borderWidth: 2, borderColor: 'hex' }
		const svgDoc = getSvgDoc( svg );
		svgDoc.querySelectorAll( 'path, circle, rect' ).forEach( ( item ) => {
			item.setAttribute( 'stroke-width', pathStrokeWith + 'px' );
			item.setAttribute( 'stroke', '#20FF12' );
		} );
		const svgString = getSvgString( svgDoc );
		setAttributes( {
			svg: DOMPurify.sanitize( svgString ),
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

		const colorCollection = collectColors( svg ) || [];

		setAttributes( {
			colors: colorCollection,
			svg: newSvg,
		} );
	};

	/**
	 * @function svgRemoveFill
	 *
	 * @description Adds the "fill:transparent" property to the current svg (basically makes it transparent apart from the borders)
	 */
	const svgRemoveFill = () => {
		const svgDoc = getSvgDoc( svg );
		svgDoc.querySelectorAll( 'path, circle, rect' ).forEach( ( item ) => {
			item.setAttribute( 'fill', 'transparent' );
			if ( item.style.fill ) item.style.fill = 'transparent';
		} );
		const svgString = getSvgString( svgDoc );
		setAttributes( {
			svg: DOMPurify.sanitize( svgString ),
		} );
	};

	/**
	 * @function getSvgSize
	 *
	 * @description Parse the svg content to get the size of the svg image look first for viewbox and if not found, the height and width xml properties
	 *
	 * @param {string} fileContent
	 */
	const getSvgSize = ( fileContent ) => {
		const parsedData = {};
		if ( fileContent ) {
			// then get the image size data
			const viewBox = fileContent.match( /viewBox=["']([^\\"']*)/ );
			if ( viewBox ) {
				const svgDataRaw = viewBox[ 1 ].split( ' ' );
				parsedData.width = parseInt( svgDataRaw[ 2 ], 10 );
				parsedData.height = parseInt( svgDataRaw[ 3 ], 10 );
			} else {
				const sizes = [
					...fileContent.matchAll( /(height|width)=["']([^\\"']*)/g ),
				];
				sizes.forEach( ( size ) => {
					switch ( size[ 1 ] ) {
						case 'width':
						case 'height':
							return ( parsedData[ size[ 1 ] ] = parseInt(
								size[ 2 ],
								10
							) );
					}
				} );
			}

			setAttributes( {
				height: parsedData.height || height,
				width: parsedData.width || width,
			} );

			return parsedData;
		}
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
	 * @class SVG
	 * @function Object() { [native code] }
	 * @public
	 * @description The SVG Component
	 *
	 * @typedef {Object} Props
	 * @property {number} width    - the svg width
	 * @property {number} height   - the svg height
	 * @property {number} rotation - the svg rotation
	 *
	 * @return {Component} The SVG markup
	 */
	class SVG extends Component {
		/**
		 * @function render
		 * @return {JSX.Element} - the svg
		 */
		render() {
			/**
			 * @function createMarkup
			 * @description It takes the SVG string, sanitizes it, and returns it as html
			 *
			 * @return {Object} The sanitized SVG markup
			 */
			function createMarkup() {
				return {
					__html: DOMPurify.sanitize( svg ),
				};
			}

			return (
				<div
					style={ blockStyle( width, height, rotation ) }
					dangerouslySetInnerHTML={ createMarkup() }
				/>
			);
		}
	}

	/**
	 * @function SvgDropZone
	 * @description The SvgDropZone component
	 *
	 * `<DropZone />` is a component that accepts a function as a prop called `onFilesDrop`.
	 * When a file is dropped into the drop zone, the `onFilesDrop` function is called with the dropped file as an argument
	 *
	 * @return {Component} DropZone - returns a div with a DropZone component.
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

	return (
		<div>
			<InspectorControls key="settings">
				<Panel header="Settings">
					<PanelBody>
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
								onClick={ () => optimizeSvg() }
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
								onClick={ ( e ) => svgRemoveFill( e ) }
							>
								{ __( 'Remove Fill' ) }
							</Button>
						</PanelRow>

						<PanelRow>
							<p>{ __( 'Outline' ) }</p>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ ( e ) => svgAddPathStroke( e ) }
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
					style={ { margin: 0, ...style } }
					size={ {
						width: width ?? 'auto',
						height: height ?? 'auto',
					} }
					minHeight="50"
					minWidth="50"
					lockAspectRatio
					enable={ {
						top: false,
						right: true,
						bottom: true,
						left: true,
					} }
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes( {
							height: parseInt( height + delta.height, 10 ),
							width: parseInt( width + delta.width, 10 ),
						} );
						toggleSelection( true );
					} }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
				>
					<SVG />
				</ResizableBox>
			) : (
				<SVG />
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

export default Edit;
