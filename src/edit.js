import { Component, useEffect, useRef, useState } from '@wordpress/element';
import optimize from 'svgo-browser/lib/optimize';
import DOMPurify from 'dompurify';
import {
	Button,
	ButtonGroup,
	ColorIndicator,
	ColorPicker,
	Dropdown,
	DropZone,
	FormFileUpload,
	Panel,
	PanelBody,
	PanelRow,
	Placeholder,
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
	MediaPlaceholder,
	useBlockProps,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { blockStyle, svgIcon } from './index';
import { link as linkIcon, linkOff } from '@wordpress/icons';

const ALLOWED_MEDIA_TYPES = [ 'image/svg+xml' ];
const NEW_TAB_REL = 'noreferrer noopener';

export const Edit = ( props ) => {
	const {
		attributes: {
			linkTarget,
			rel,
			url,
			height,
			width,
			svg,
			originalSvg,
			colors,
		},
		isSelected,
		setAttributes,
		toggleSelection,
	} = props;
	// LINK toolbar stuff
	const ref = useRef();
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const [ pathStrokeWith, setPathStrokeWith ] = useState( 1.0 );
	const isURLSet = !! url;
	const opensInNewTab = linkTarget === '_blank';

	useEffect( () => {
		if ( ! isSelected ) {
			setIsEditingURL( false );
		}
	}, [ isSelected ] );

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

	function startEditing( event ) {
		event.preventDefault();
		setIsEditingURL( true );
	}

	function unlink() {
		setAttributes( {
			url: undefined,
			linkTarget: undefined,
			rel: undefined,
		} );
		setIsEditingURL( false );
	}

	const optimizeSvg = () => {
		optimize( svg ).then( ( el ) => {
			setAttributes( {
				svg: el,
			} );
		} );
	};

	const getSvgDoc = ( svg ) => {
		const parser = new DOMParser();
		return parser.parseFromString( svg, 'image/svg+xml' );
	};

	const getSvgString = ( svgDoc ) => {
		const serializer = new XMLSerializer();
		return serializer.serializeToString( svgDoc );
	};

	const collectColors = ( fileContent ) => {
		const colorCollection = [];
		if ( fileContent ) {
			for ( const match of fileContent.matchAll(
				/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g
			) ) {
				if ( match[ 0 ] ) {
					colorCollection.push( match[ 0 ] );
					if ( colorCollection.length > 10 ) return;
				}
			}
		}
		return [ ...new Set( colorCollection ) ] || [];
	};
	useEffect( () => {
		const colorCollection = collectColors( svg );
		setAttributes( {
			colors: colorCollection,
		} );
	}, [ svg ] );

	// svg

	// TODO: attributes {el: [path, circle, rect], borderWidth: 2, borderColor: 'hex' }
	const svgAddPathStroke = () => {
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

	const updateColor = ( newColor, color ) => {
		// updates the colors array
		const newSvg = svg.replaceAll( color, newColor );

		const colorCollection = collectColors( svg ) || [];

		setAttributes( {
			colors: colorCollection,
			svg: newSvg,
		} );
	};

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

	const onImageSelect = ( files ) => {
		files.forEach( ( file ) => {
			const reader = new FileReader();
			reader.onload = () => {
				// sanitize content first
				const fileContent = DOMPurify.sanitize( reader.result );
				const parsedData = {};

				if ( fileContent ) {
					const viewBox = fileContent.match(
						/viewBox=["']([^\\"']*)/
					);
					if ( viewBox ) {
						const svgDataRaw = viewBox[ 1 ].split( ' ' );
						parsedData.width = parseInt( svgDataRaw[ 2 ], 10 );
						parsedData.height = parseInt( svgDataRaw[ 3 ], 10 );
					} else {
						const sizes = [
							...fileContent.matchAll(
								/(height|width)=["']([^\\"']*)/g
							),
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

					// collect colors
					const colorCollection = collectColors( fileContent ) || [];

					setAttributes( {
						originalSvg: fileContent,
						svg: fileContent,
						height: parsedData.height,
						width: parsedData.width,
						colors: colorCollection,
					} );
				}
			};
			reader.onabort = () => console.log( 'file reading was aborted' );
			reader.onerror = () => console.log( 'file reading has failed' );

			try {
				reader.readAsText( file );
			} catch ( err ) {
				console.log( err );
				console.log( file );
			}
		} );
	};

	class SVG extends Component {
		render() {
			function createMarkup() {
				return {
					__html: DOMPurify.sanitize( svg ),
				};
			}

			return (
				<div
					style={ blockStyle( width, height ) }
					dangerouslySetInnerHTML={ createMarkup() }
				/>
			);
		}
	}

	const SvgDropZone = () => {
		return (
			<div>
				<DropZone
					onHTMLDrop={ ( e ) => console.log( e ) }
					onFilesDrop={ ( files ) => {
						onImageSelect( files );
					} }
					onDrop={ ( e ) => console.log( e ) }
				/>
			</div>
		);
	};

	return (
		<div { ...useBlockProps() }>
			<InspectorControls key="settings">
				<Panel header="Settings">
					<PanelBody>
						<RangeControl
							label={ 'Width' }
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
							label={ 'Height' }
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
					</PanelBody>
				</Panel>

				<Panel title="editor">
					<PanelBody title="Editor" initialOpen={ false }>
						<PanelRow>
							<b>SVGO</b>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ () => {
									setAttributes( {
										svg: optimizeSvg(),
									} );
								} }
							>
								{ __( 'Optimize' ) }
							</Button>
						</PanelRow>
						<PanelRow>
							<p>Restore Original</p>
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
							<p>Remove Fill</p>
							<Button
								isSmall={ true }
								variant={ 'primary' }
								onClick={ ( e ) => svgRemoveFill( e ) }
							>
								{ __( 'Remove Fill' ) }
							</Button>
						</PanelRow>

						<PanelRow>
							<p>Add Stroke</p>
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
							label={ 'SVG Markup Editor' }
							value={ svg || '' }
							onChange={ ( ev ) => {
								setAttributes( { svg: ev } );
							} }
						/>
					</PanelBody>
				</Panel>

				<Panel title="colors">
					<PanelBody
						title="Colors"
						initialOpen={ true }
						style={ { display: 'flex', flexDirection: 'column' } }
					>
						{ colors &&
							colors.map( ( color, index ) => (
								<Dropdown
									key={ index }
									renderToggle={ ( { onToggle } ) => (
										<PanelRow>
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
										</PanelRow>
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
							label="Replace"
							accept={ ALLOWED_MEDIA_TYPES }
							onClick={ ( event ) => ( event.target.value = '' ) }
							onChange={ ( ev ) => {
								onImageSelect(
									Object.values( ev.target.files )
								);
							} }
						>
							Replace{ ' ' }
						</FormFileUpload>
					</ToolbarGroup>
				</BlockControls>
			) }
			{ isSelected && isEditingURL && (
				<Popover
					position="bottom center"
					onClose={ () => {
						setIsEditingURL( false );
						// richTextRef.current?.focus();
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
					<SVG height={ height } width={ height } />
				</ResizableBox>
			) : (
				<SVG />
			) }
			{ ! svg && (
				<>
					<div
						className="svg-preview-container"
						style={ {
							backgroundColor: '#f3f3f3',
							padding: '24px',
							borderRadius: '8px',
							textAlign: 'center',
						} }
					>
						<SvgDropZone />
						<div>
							<span>Drop here a Svg</span>
						</div>
						<div>
							<span>or select one from your computer</span>
						</div>
						<MediaUploadCheck>
							<MediaUpload
								type="image"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ svg }
								render={ () => (
									<FormFileUpload
										accept={ ALLOWED_MEDIA_TYPES }
										onClick={ ( event ) =>
											( event.target.value = '' )
										}
										variant={ 'secondary' }
										onChange={ ( ev ) => {
											onImageSelect(
												Object.values( ev.target.files )
											);
										} }
									>
										{ svg
											? 'Replace Object'
											: 'Select Object' }
									</FormFileUpload>
								) }
							/>
						</MediaUploadCheck>
						<span>or copy and paste the svg markup here:</span>
						<TextareaControl
							onChange={ ( e ) =>
								setAttributes( {
									svg: e,
								} )
							}
						></TextareaControl>
					</div>
				</>
			) }
		</div>
	);
};
