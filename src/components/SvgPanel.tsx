import {
	__experimentalUnitControl as UnitControl,
	Button,
	ColorPalette,
	IconButton,
	Panel,
	PanelBody,
	PanelRow,
	RangeControl,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { relOptions, rotationRangePresets } from '../utils/presets';
import { SvgoStats } from './SvgoStats';
import {
	optimizeSvg,
	svgAddPathStroke,
	svgRemoveFill,
	updateColor,
} from '../utils/svgTools';
import { useEffect, useState } from '@wordpress/element';

function SvgPanel( {
	attributes,
	setAttributes,
	colors,
	originalSvg,
} ): JSX.Element {
	const { width, height, rotation, svg, rel, title } = attributes;
	const [ currentColor, setColor ] = useState< string >( '' );
	const [ pathStrokeWith, setPathStrokeWith ] = useState< number >( 1.0 );

	/* Setting the first color detected as the default color. */
	useEffect( () => {
		if ( colors.length > 0 )
			setColor( colors?.length ? colors[ 0 ].color : '' );
	}, [] );

	return (
		<Panel>
			<PanelBody title="Settings">
				<div
					style={ {
						display: 'flex',
						gap: '10px',
						alignItems: 'start',
					} }
				>
					<UnitControl
						isPressEnterToChange
						label={ __( 'Width' ) }
						value={ width }
						units={ [
							{
								a11yLabel: 'Pixels (px)',
								label: 'px',
								step: 1,
								value: 'px',
							},
						] }
						onChange={ ( newValue ) => {
							setAttributes( {
								width: parseInt( newValue, 10 ),
							} );
						} }
					/>
					<UnitControl
						isPressEnterToChange
						label={ __( 'Height' ) }
						value={ height }
						units={ [
							{
								a11yLabel: 'Pixels (px)',
								label: 'px',
								step: 1,
								value: 'px',
							},
						] }
						onChange={ ( newValue ) => {
							setAttributes( {
								height: parseInt( newValue, 10 ),
							} );
						} }
					/>
				</div>

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
							rotation: Number( ev ),
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
						onClick={ async () => {
							optimizeSvg( svg ).then(
								( optimizedSvg: string ) => {
									setAttributes( {
										optimizedSvg,
									} );
								}
							);
						} }
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
									pathStrokeColor: currentColor || undefined,
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
						typeof e === 'number' ? setPathStrokeWith( e ) : null
					}
					min={ 0 }
					max={ 20 }
					step={ 0.1 }
				/>
			</PanelBody>

			<PanelBody title="Editor">
				<h2 className={ 'block-editor-image-size-control__row' }>
					SVG Colors
				</h2>

				<ColorPalette
					enableAlpha={ true }
					clearable={ false }
					colors={ colors }
					value={ currentColor }
					onSelect={ ( newColor ) => setColor( newColor ) }
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
									svg: newSvg,
								} );
							}
							setColor( newColor );
						}
					} }
				/>
			</PanelBody>

			<PanelBody title="Seo">
				<SelectControl
					label={ __( 'Rel target' ) }
					help={ __(
						'The rel attribute defines the relationship between a linked resource and the current document.'
					) }
					options={ relOptions }
					value={ rel ?? 'icon' }
					onChange={ ( newRel ) => setAttributes( { rel: newRel } ) }
				/>
				<TextControl
					label={ __( 'Svg title' ) }
					help={ __(
						'Notice: This inline style will override any other inline style generated by Gutenberg.'
					) }
					value={ title }
					onChange={ ( newTitle ) =>
						setAttributes( { title: newTitle } )
					}
				/>
			</PanelBody>
		</Panel>
	);
}

export default SvgPanel;
