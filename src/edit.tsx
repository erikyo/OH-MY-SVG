import { useEffect, useRef, useState } from '@wordpress/element';
import { ResizableBox, SVG } from '@wordpress/components';
import {
	__experimentalUseBorderProps as useBorderProps,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useSetting,
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';
import {
	collectColors,
	getSvgBoundingBox,
	getSvgSize,
	hasAlign,
	loadSvg,
	readSvg,
	scaleProportionally,
} from './utils/svgTools';
import { SvgAttributesEditor, SvgColorDef, SvgSizeDef } from './types';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';
import SvgPanel from './components/SvgPanel';
import SvgControls from './components/SvgControls';
import SvgPlaceholder from './components/SvgPlaceholder';
import OHMYSVG from './components/SVG';

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
	const { align, height, width, href, svg, originalSvg } =
		attributes as SvgAttributesEditor;

	const { toggleSelection } = useDispatch( blockEditorStore );

	/**
	 * @function useRef
	 * @description get the reference to the link
	 *
	 * Create a refs for the input element created with the render method
	 */
	const svgRef = useRef( null );

	const [ maxWidth, setMaxWidth ] = useState( undefined );

	const [ colors, setColors ] = useState< [] | SvgColorDef[] >( [] );
	const [ originalSize, setOriginalSize ] = useState< SvgSizeDef >( {
		width: 0,
		height: 0,
	} );

	/* the block editor sizes */
	const defaultLayout = useSetting( 'layout' ) || {};

	/* Emit notices */
	const { createErrorNotice } = useDispatch( noticesStore );

	/**
	 * Whenever the svg is changed it collects the colors used in the image and resize the image accordingly to its container
	 *
	 * @type {useEffect}
	 */
	useEffect( () => {
		setColors( collectColors( svg ) );
	}, [ svg ] );

	/**
	 * Returns the maximum content width based on the alignment.
	 *
	 * @return {number|undefined} The maximum content width. Returns `defaultLayout.contentSize` if `align` is undefined,
	 * `defaultLayout.wideSize` if `align` is 'wide', and `undefined` otherwise.
	 */
	function contentMaxWidth() {
		if ( typeof align === 'undefined' ) {
			return defaultLayout.contentSize;
		} else if ( align === 'wide' ) {
			return defaultLayout.wideSize;
		}
		return undefined;
	}

	/**
	 * Whenever the alignment is changed set the max width of the current block
	 *
	 * @type {useEffect}
	 */
	useEffect( () => {
		if ( ! isSelected ) return;
		// if the element has a width and height set the new width
		const svgbbox = getSvgBoundingBox( svgRef.current );
		if ( ! height || ! width ) {
			setAttributes( { width: svgbbox.width, height: svgbbox.height } );
			return;
		}
		// get the max width of the content
		const maxWidth = contentMaxWidth();
		if ( maxWidth ) {
			setAttributes( calcSvgResize( maxWidth ) );
			setMaxWidth( maxWidth );
		} else {
			setAttributes( {
				width: width || svgbbox.width,
				height: height || svgbbox.height,
			} );
			setMaxWidth( undefined );
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
			setColors( collectColors( svg ) );

			const size: SvgSizeDef = getSvgSize( svg );
			setOriginalSize( size );

			setAttributes( {
				originalSvg: originalSvg || svg,
			} );
		}
	}, [] );

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
	 * Reads and updates an SVG file.
	 *
	 * @param {File | undefined} newFile           - The new file to be read and updated.
	 * @param {Function}         updateSvgCallback - The callback function to update the SVG.
	 * @return {void}
	 */
	function readAndUpdateSvg( newFile: File | undefined ) {
		if ( ! newFile ) return;
		readSvg( newFile ).then( ( newSvg: string ) => {
			if ( newFile !== null ) {
				const svgDecoded = loadSvg( {
					newSvg,
					fileData: newFile || undefined,
					oldSvg: attributes,
				} );

				return svgDecoded
					? updateSvgData( svgDecoded )
					: createErrorNotice( __( '😓 cannot update!' ) );
			}
		} );
	}

	/**
	 * Calculates the size of the SVG image after resizing.
	 *
	 * @param {number} viewSize - The desired size of the SVG image.
	 * @return {Object} An object containing the width and height of the resized SVG image.
	 */
	function calcSvgResize( viewSize ) {
		return {
			width: parseInt( viewSize, 10 ),
			height: scaleProportionally(
				width,
				height,
				parseInt( viewSize, 10 )
			),
		};
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
			newSvg.width >= Number( defaultLayout.contentSize )
				? calcSvgResize( defaultLayout.contentSize )
				: newSvgSize;

		setAttributes( {
			originalSvg: newSvg.svg,
			...newSvg,
			...size,
		} );
	}

	const borderProps = useBorderProps( attributes );
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			{ svg && (
				<InspectorControls>
					<SvgPanel
						originalSize={ originalSize }
						colors={ colors }
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</InspectorControls>
			) }

			<SvgControls
				attributes={ attributes }
				isSelected={ isSelected }
				setAttributes={ setAttributes }
				updateSvg={ updateSvg }
				SvgRef={ svgRef }
			/>

			{ svg && isSelected && ! hasAlign( align, [ 'full', 'wide' ] ) ? (
				<ResizableBox
					size={ {
						width,
						height,
					} }
					style={ {
						marginLeft: hasAlign( attributes.align, [ 'center' ] )
							? 'auto'
							: null,
						marginRight: hasAlign( attributes.align, [ 'center' ] )
							? 'auto'
							: null,
					} }
					minHeight={ 8 }
					minWidth={ 8 }
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
					<OHMYSVG
						attributes={ props.attributes }
						borderProps={ borderProps }
						svgRef={ svgRef }
					/>
				</ResizableBox>
			) : (
				<OHMYSVG
					attributes={ props.attributes }
					borderProps={ borderProps }
					svgRef={ svgRef }
				/>
			) }

			{ ! svg && (
				<SvgPlaceholder
					href={ href }
					readAndUpdateSvg={ readAndUpdateSvg }
					updateSvgCallback={ updateSvg }
				/>
			) }
		</div>
	);
};
