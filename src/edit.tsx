import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { ResizableBox } from '@wordpress/components';
import {
	__experimentalGetShadowClassesAndStyles as getShadowClassesAndStyles,
	__experimentalUseBorderProps as useBorderProps,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';
import {
	collectColors,
	contentMaxWidth,
	getSvgBoundingBox,
	getWrapperProps,
	hasAlign,
	loadSvg,
	readSvg,
	scaleProportionally,
	updateSvgMarkup,
} from './utils/svgTools';
import { SvgAttributesEditor, SvgColorDef, SvgSizeDef } from './types';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { type BlockAttributes } from '@wordpress/blocks';
import SvgPanel from './components/SvgPanel';
import SvgControls from './components/SvgControls';
import SvgPlaceholder from './components/SvgPlaceholder';
import OHMYSVG from './components/SVG';

/**
 * The edit function for the block
 * @module Edit
 * @description The edit view
 * @param          props.attributes    The props to build the svg
 * @param          props.setAttributes The function to set the attributes
 * @param          props.isSelected    The boolean value indicating if the svg is selected
 *
 * @param {Object} props               - the edit view stored props
 *
 * @return {JSX.Element} - the Block editor view
 */
export const Edit = ( props: {
	attributes: SvgAttributesEditor;
	setAttributes: ( attributes: any ) => void;
	isSelected: boolean;
} ): JSX.Element => {
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

	const [ currentMaxWidth, setCurrentMaxWidth ] = useState<
		number | string
	>();
	const [ originalSvg, setOriginalSvg ] = useState< string | null >( null );
	const [ colors, setColors ] = useState< [] | SvgColorDef[] >( [] );

	/** The block editor sizes */
	const layoutData: { contentSize: number; wideSize: number } = useSelect(
		( select ) => {
			const settings = (
				select( 'core/block-editor' ) as any
			 ).getSettings();
			return settings.__experimentalFeatures.layout;
		},
		[]
	);

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

		return newSvg?.svg
			? updateSvgData( newSvg )
			: createErrorNotice( __( '😓 cannot update!' ) );
	}

	/**
	 * Reads and updates an SVG file.
	 *
	 * @param {File | undefined} newFile - The new file to be read and updated.
	 * @return {void}
	 */
	function readAndUpdateSvg( newFile: File | undefined ): void {
		if ( ! newFile ) {
			return;
		}
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
	function calcSvgResize( viewSize: number ): SvgSizeDef {
		return {
			width: viewSize,
			height: scaleProportionally( width, height, viewSize ),
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

		setOriginalSvg( attributes.svg );

		// width and height are calculated by the resize function
		const svgSize =
			newSvg.width >= Number( layoutData.contentSize )
				? calcSvgResize( layoutData.contentSize )
				: newSvgSize;

		setAttributes( {
			svg: cleanSvg( newSvg.svg ).__html,
			alt: newSvg.alt,
			title: newSvg.fileData?.name,
			lastModified: newSvg.fileData?.lastModified,
			fileSize: newSvg.fileData?.size,
			...svgSize,
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
		if ( ! isSelected ) {
			return;
		}
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
		const currenContentWidth = contentMaxWidth( align, layoutData );
		if ( currenContentWidth ) {
			setAttributes( calcSvgResize( currenContentWidth ) );
			setCurrentMaxWidth( currenContentWidth );
		} else {
			setAttributes( {
				width: width || svgbbox.width,
				height: height || svgbbox.height,
			} );
			setCurrentMaxWidth( undefined );
		}
	}, [ align ] );

	const cleanSvg = useCallback(
		( svgMarkup = attributes.svg ): { __html: TrustedHTML } => {
			return updateSvgMarkup( attributes, svgMarkup );
		},
		[ svg ]
	);

	/**
	 *  Using the useEffect hook to collect the colors and size from the SVG onload
	 *
	 * @type {useEffect}
	 */
	useEffect( () => {
		// on load collect colors
		if ( svg ) {
			/* Backup the original svg */
			setOriginalSvg( svg );

			/* prepare the color array */
			setColors( collectColors( svg ) );
		}
	}, [] );

	const currentStyle = getWrapperProps( attributes, {
		...useBorderProps( attributes ),
		...getShadowClassesAndStyles( attributes ),
	} );

	return (
		<div { ...useBlockProps() } style={ currentStyle }>
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

			{ svg ? (
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
					maxWidth={ currentMaxWidth }
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
						attributes={ { ...attributes, href: undefined } }
						svgData={ attributes?.svg }
					/>
				</ResizableBox>
			) : (
				<OHMYSVG
					attributes={ { ...attributes, href: undefined } }
					svgRef={ svgRef }
					svgData={ attributes?.svg }
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
