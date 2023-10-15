import { useEffect, useRef, useState } from '@wordpress/element';
import { ResizableBox } from '@wordpress/components';
import {
	__experimentalUseBorderProps as useBorderProps,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useSetting,
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';
import SvgEl from './components/SvgEl';
import {
	collectColors,
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
	const ref = useRef( null );

	const [ maxWidth, setMaxWidth ] = useState( undefined );

	let [ colors, setColors ] = useState< [] | SvgColorDef[] >( [] );
	const [ originalSize, setOriginalSize ] = useState< SvgSizeDef >( {
		width: 0,
		height: 0,
	} );

	/* the block editor sizes */
	const defaultLayout = useSetting( 'layout' ) || {};
	let contentWidth;

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
			if ( ! isSelected ) return;
			// if the element has a width and height set the new width
			if ( ! height && ! width ) getSvgBoundingBox( ref.current );
			// set the max width
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

	/**
	 * Get the bounding box of an SVG element.
	 *
	 * @param {HTMLElement} el - The SVG element.
	 */
	const getSvgBoundingBox = ( el: HTMLElement ) => {
		const rect = el.getBoundingClientRect();
		setAttributes( {
			width: rect.width,
			height: rect.height,
		} );
	};

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
	function readAndUpdateSvg( newFile: File | undefined, updateSvgCallback ) {
		if ( ! newFile ) return;
		readSvg( newFile ).then( ( newSvg ) => {
			if ( newSvg !== null ) {
				updateSvgCallback( newSvg, newFile );
			}
		} );
	}

	/**
	 * Calculates the size of the SVG image after resizing.
	 *
	 * @param {string} newSvg   - The SVG image to be resized.
	 * @param {number} viewSize - The desired size of the SVG image.
	 * @return {Object} An object containing the width and height of the resized SVG image.
	 */
	function calcSvgResize( newSvg, viewSize ) {
		return {
			width: Number( viewSize ),
			height: scaleProportionally( width, height, Number( viewSize ) ),
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
				? calcSvgResize( newSvg, defaultLayout.contentSize )
				: newSvgSize;

		setAttributes( {
			originalSvg: newSvg.svg,
			...newSvg,
			...size,
		} );
	}

	const borderProps = useBorderProps( attributes );
	const blockProps = useBlockProps( {
		className: borderProps.className,
		style: {
			width: hasAlign( align, [ 'full', 'wide' ] ) ? '100%' : width,
			height: hasAlign( align, [ 'full', 'wide' ] ) ? 'auto' : height,
		},
		ref,
	} );

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
				SvgRef={ ref }
			/>

			{ svg && isSelected ? (
				<ResizableBox
					size={ {
						width,
						height,
					} }
					showHandle={ isSelected && align !== 'full' }
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
					<div
						dangerouslySetInnerHTML={ SvgEl( props.attributes ) }
					/>
				</ResizableBox>
			) : (
				<div dangerouslySetInnerHTML={ SvgEl( props.attributes ) } />
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
