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
	contentMaxWidth,
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
import { isKeyboardEvent } from '@wordpress/keycodes';

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
	const { align, height, width, href, svg } =
		attributes as SvgAttributesEditor;

	/**
	 * @function useRef
	 * @description get the reference to the link
	 *
	 * Create a refs for the input element created with the render method
	 */
	const svgRef = useRef< HTMLDivElement | HTMLAnchorElement | null >( null );

	const [ maxWidth, setMaxWidth ] = useState( undefined );

	const [ originalSvg, setOriginalSvg ] = useState< string | null >( null );

	const [ colors, setColors ] = useState< [] | SvgColorDef[] >( [] );

	/** The block editor sizes */
	const defaultLayout = useSetting( 'layout' ) || {};

	/** The block is selected */
	const { toggleSelection } = useDispatch( blockEditorStore );

	/** Emit notices */
	const { createErrorNotice } = useDispatch( noticesStore );

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
	 * @param {File | undefined} newFile - The new file to be read and updated.
	 * @return {void}
	 */
	function readAndUpdateSvg( newFile: File | undefined ) {
		if ( ! newFile ) return;
		readSvg( newFile ).then( ( newSvg: string ) => {
			updateSvg( newSvg, newFile );
		} );
	}

	/**
	 * Calculates the size of the SVG image after resizing.
	 *
	 * @param {number} viewSize - The desired size of the SVG image.
	 * @return {Object} An object containing the width and height of the resized SVG image.
	 */
	function calcSvgResize( viewSize ): SvgSizeDef {
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
		const newSvgSize: SvgSizeDef = {
			width: newSvg.width,
			height: newSvg.height,
		};

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
		if ( ! isSelected ) return;
		// if the element has a width and height set the new width
		const svgbbox = getSvgBoundingBox( svgRef.current );
		if ( ! height || ! width ) {
			if ( svgbbox ) {
				setAttributes( {
					width: svgbbox.width,
					height: svgbbox.height,
				} );
			}
			return;
		}
		// get the max width of the content
		const maxWidth = contentMaxWidth( align, defaultLayout );
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
			setOriginalSvg( svg );

			setColors( collectColors( svg ) );

			const size: SvgSizeDef = getSvgSize( svg );

			setAttributes( {
				originalSvg: originalSvg || svg,
			} );
		}
	}, [] );

	const borderProps = useBorderProps( attributes );
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			{ svg && (
				<InspectorControls>
					<SvgPanel
						colors={ colors }
						attributes={ attributes }
						setAttributes={ setAttributes }
						originalSvg={ originalSvg }
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
						tag={ 'div' }
					/>
				</ResizableBox>
			) : (
				<OHMYSVG
					attributes={ props.attributes }
					borderProps={ borderProps }
					svgRef={ svgRef }
					tag={ 'div' }
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
