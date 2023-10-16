import { BlockIcon, MediaPlaceholder } from '@wordpress/block-editor';
import { svgIcon } from './icons';
import { ALLOWED_MEDIA_TYPES } from '../utils/constants';
import { DropZone, Placeholder, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { onSvgReadError } from '../utils/svgTools';

/**
 * The placeholder component that contains the button and the textarea input
 *
 * @param {Element} content           the svg upload placeholder
 * @param           readAndUpdateSvg  the function to update the svg
 * @param           updateSvgCallback
 */
const placeholder = (
	content: JSX.Element,
	readAndUpdateSvg,
	updateSvgCallback
): JSX.Element => {
	return (
		<Placeholder
			className="block-editor-media-placeholder"
			withIllustration={ false }
			icon={ svgIcon }
			label={ __( 'SVG' ) }
			instructions={ __(
				'Drop here your Svg, select one from your computer or copy and paste the svg markup in the textarea below'
			) }
			onChange={ ( ev ) => {
				if ( ev.target.files?.length )
					readAndUpdateSvg( ev.target.files[ 0 ] );
			} }
		>
			<DropZone
				onFilesDrop={ ( files ) => readAndUpdateSvg( files[ 0 ] ) }
			/>
			<div
				style={ {
					display: 'flex',
					alignItems: 'left',
					gap: '10px',
				} }
			>
				{ content }
			</div>
			<TextControl
				className={ 'components-button' }
				placeholder={ __( 'Paste here your SVG markup' ) }
				value={ undefined }
				onChange={ ( newSvg ) =>
					updateSvgCallback( newSvg, undefined )
				}
			></TextControl>
		</Placeholder>
	);
};

function SvgPlaceholder( { readAndUpdateSvg, updateSvgCallback, href } ) {
	return (
		<MediaPlaceholder
			icon={ <BlockIcon icon={ svgIcon } /> }
			multiple={ false }
			accept={ ALLOWED_MEDIA_TYPES.join() }
			placeholder={ ( content ) =>
				placeholder( content, readAndUpdateSvg, updateSvgCallback )
			}
			onSelect={ () => {} }
			onError={ () => onSvgReadError }
			mediaUploadURL={ href }
		/>
	);
}

export default SvgPlaceholder;
