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

export const Edit = ( props ) => {
	const {
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

	const [ pathStrokeWith, setPathStrokeWith ] = useState( 1.0 );

	// LINK toolbar stuff
	const ref = useRef();
	const [ isEditingURL, setIsEditingURL ] = useState( false );
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

	const getSvgDoc = ( svgData ) => {
		const parser = new DOMParser();
		return parser.parseFromString( svgData, 'image/svg+xml' );
	};

	const getSvgString = ( svgDoc ) => {
		const serializer = new XMLSerializer();
		return serializer.serializeToString( svgDoc );
	};

	const collectColors = ( fileContent ) => {
		const colorCollection = [];
		if ( fileContent ) {
			const matchedColors = fileContent.matchAll(
				/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g
			);
			for ( const match of matchedColors ) {
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
	const loadSvg = ( res ) => {
		const svgMarkup = DOMPurify.sanitize( res );
		getSvgSize( svgMarkup );
		setAttributes( {
			originalSvg: originalSvg || svgMarkup,
			svg: svgMarkup || '😓 error!',
		} );
	};

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

	const onImageSelect = ( files ) => {
		files.forEach( ( file ) => {
			const reader = new FileReader();
			reader.onload = () => {
				loadSvg( reader.result );
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
					style={ blockStyle( width, height, rotation ) }
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
						<RangeControl
							label={ 'Rotation' }
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
					<PanelBody title="Editor" initialOpen={ false }>
						<PanelRow>
							<p>SVGO</p>
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
							type={ 'file' }
							label="Replace"
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
										onChange={ ( ev ) => {
											onImageSelect(
												Object.values( ev.target.files )
											);
										} }
										variant={ 'secondary' }
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
							onChange={ ( e ) => loadSvg( e ) }
						></TextareaControl>
					</div>
				</>
			) }
		</div>
	);
};
