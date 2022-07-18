/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import {
	DropZone,
	FormFileUpload,
	Panel,
	PanelBody,
	PanelRow,
	Placeholder,
	RangeControl,
	TextareaControl,
	ColorPicker,
	ToolbarGroup,
	ResizableBox,
	Button,
	ButtonGroup,
	ColorIndicator,
	Dropdown,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
} from '@wordpress/block-editor';
import DOMPurify from 'dompurify';
import optimize from 'svgo-browser/lib/optimize';
import { __ } from '@wordpress/i18n';

const blockIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
		<path d="M245.2 153.5a36 36 0 0 0-32-60.7 36 36 0 0 0-20.3-65.6 36 36 0 0 0-29.7 15.7 36 36 0 0 0-60.7-32.1 36 36 0 0 0-9.9 32.1 36 36 0 0 0-65.7 20.2 36 36 0 0 0 15.7 29.7 36.5 36.5 0 0 0-6.7-.6 35.7 35.7 0 0 0-35.9 36A35.7 35.7 0 0 0 36 164c2.2 0 4.5-.3 6.6-.7A36 36 0 0 0 63 229.1a36 36 0 0 0 29.7-15.8 36 36 0 0 0 60.7 32.2 36 36 0 0 0 9.9-32.2 36 36 0 0 0 65.6-20.2 36 36 0 0 0-15.7-29.7 36.4 36.4 0 0 0 32.1-9.9" />
		<path
			fill="#FFB13B"
			d="M234.4 113.5c-8-8-21.1-8-29.2 0h-42.1l29.8-29.8a20.6 20.6 0 1 0-20.6-20.6l-29.9 29.8V50.7a20.6 20.6 0 1 0-29.1 0V93L83.5 63.1a20.6 20.6 0 1 0-20.6 20.6l29.8 29.8H50.5a20.6 20.6 0 1 0 0 29.2h42.2l-29.8 29.8a20.6 20.6 0 1 0 20.6 20.6l29.8-29.8v42.2a20.6 20.6 0 1 0 29.1 0v-42.2l29.9 29.8a20.6 20.6 0 1 0 20.6-20.6L163 142.7h42.1a20.6 20.6 0 1 0 29.2-29.2"
		/>
	</svg>
);

// The block configuration
const blockConfig = require( './block.json' );

const blockStyle = ( width, height ) => {
	return {
		width: width || null,
		height: height || null,
		display: 'flex',
		justifyContent: 'center',
	};
};

const ALLOWED_MEDIA_TYPES = [ 'image/svg+xml' ];

const Edit = ( props ) => {
	const {
		attributes: { height, width, svg, originalSvg, colors },
		isSelected,
		setAttributes,
		toggleSelection,
	} = props;

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
		for ( const match of fileContent.matchAll(
			/#[a-zA-Z0-9]{6}|rgb\((?:\s*\d+\s*,){2}\s*\d+\)|rgba\((\s*\d+\s*,){3}[\d.]+\)/g
		) ) {
			if ( match[ 0 ] ) {
				colorCollection.push( match[ 0 ] );
				if ( colorCollection.length > 10 ) return;
			}
		}
		return [ ...new Set( colorCollection ) ];
	};

	// TODO: attributes {el: [path, circle, rect], borderWidth: 2, borderColor: 'hex' }
	const svgAddPathStroke = () => {
		const svgDoc = getSvgDoc( svg );
		svgDoc.querySelectorAll( 'path, circle, rect' ).forEach( ( item ) => {
			item.setAttribute( 'stroke-width', '2px' );
			item.setAttribute( 'stroke', '#ffffff' );
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
				<PanelBody title="SVG Block" icon="code" initialOpen={ true }>
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
					<PanelRow>
						<b>SVGO</b>
						<ButtonGroup>
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
							&nbsp;
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
						</ButtonGroup>
					</PanelRow>
					<h4>SVG markup</h4>
					<TextareaControl
						label={ 'Code' }
						value={ svg || '' }
						onChange={ ( ev ) => {
							setAttributes( { svg: ev } );
						} }
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls key="style">
				<PanelBody header="SVG Edit">
					<PanelRow>
						<b>Editor</b>
					</PanelRow>
					<ButtonGroup>
						<Button
							variant={ 'primary' }
							onClick={ ( e ) => svgAddPathStroke( e ) }
						>
							{ __( 'Add Stroke' ) }
						</Button>
						&nbsp;
						<Button
							variant={ 'primary' }
							onClick={ ( e ) => svgRemoveFill( e ) }
						>
							{ __( 'Remove Fill' ) }
						</Button>
					</ButtonGroup>
				</PanelBody>
			</InspectorControls>
			<InspectorControls key="colors">
				<PanelBody>
					<div style={ { display: 'flex', flexDirection: 'column' } }>
						<b>Colors</b>
						{ colors &&
							colors.map( ( color, index ) => (
								<Dropdown
									key={ index }
									renderToggle={ ( { onToggle } ) => (
										<Button
											style={ { width: '100%' } }
											onClick={ onToggle }
										>
											<ColorIndicator
												colorValue={ color }
											/>
											<p style={ { marginLeft: '8px' } }>
												{ color }
											</p>
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
							) ) }
					</div>
				</PanelBody>
			</InspectorControls>
			{ svg && (
				<BlockControls group="block">
					<ToolbarGroup>
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
			{ ! svg &&
				( isSelected ? (
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
								<span>
									Drop a Svg here or select one from the media
									library
								</span>
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
													Object.values(
														ev.target.files
													)
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
						</div>
					</>
				) : (
					<Placeholder
						icon={ blockIcon }
						style={ {
							textAlign: 'center',
						} }
					>
						<h2>SVG</h2>
						<p>Click here to add a svg</p>
						<FormFileUpload
							accept={ ALLOWED_MEDIA_TYPES }
							onClick={ ( event ) => ( event.target.value = '' ) }
							variant={ 'primary' }
							onChange={ ( ev ) => {
								onImageSelect(
									Object.values( ev.target.files )
								);
							} }
						>
							Add a SVG image from your computer
						</FormFileUpload>
					</Placeholder>
				) ) }
		</div>
	);
};

export const Save = ( { attributes } ) => {
	function createMarkup() {
		return {
			__html: DOMPurify.sanitize( attributes.svg ),
		};
	}

	const customStyle = blockStyle( attributes.width, attributes.height );

	return (
		<div
			{ ...useBlockProps.save( { style: customStyle } ) }
			dangerouslySetInnerHTML={ createMarkup() }
		/>
	);
};

// Register the block
/// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
registerBlockType( blockConfig.name, {
	...blockConfig,
	icon: blockIcon,
	apiVersion: 2,
	edit: Edit,
	save: Save,
	// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/
	supports: {
		align: true,
		anchor: true,
		className: true,
		color: {
			background: true,
		},
		spacing: {
			margin: true, // Enable margin UI control.
			padding: true, // Enable padding UI control.
			blockGap: true, // Enables block spacing UI control.
		},
	},
	attributes: {
		style: {
			type: 'object',
		},
		svg: {
			type: 'string',
			default: false,
		},
		originalSvg: {
			type: 'string',
			default: false,
		},
		height: {
			type: 'number',
			default: false,
		},
		width: {
			type: 'number',
			default: false,
		},
		colors: {
			type: 'array',
			default: [],
		},
		svgData: {
			type: 'object',
			default: {
				pathStroke: 2,
			},
		},
	},
} );
