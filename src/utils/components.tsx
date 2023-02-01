import SVG from '../Svg';
import { svgIcon } from './icons';
import { humanFileSize } from './common';

export const SvgoStats = ( {
	original = '',
	compressed = '',
}: {
	original: string | undefined;
	compressed: string;
} ): JSX.Element | null => {
	if ( ! original ) return null;
	const sizeOriginal = original?.length || 1;
	const sizeCompressed = compressed?.length || 1;

	// get the percentage of file size
	const percentOriginal =
		( ( sizeOriginal - sizeCompressed ) / sizeOriginal ) * -100;

	if ( ! original ) return null;

	return (
		<i
			style={ {
				color: 'var(--wp--preset--color--cyan-bluish-gray)',
			} }
		>
			({ humanFileSize( sizeCompressed ) }/
			{ humanFileSize( sizeOriginal ) } { percentOriginal.toFixed( 2 ) }%)
		</i>
	);
};

export const mediaPreview = () => svgIcon;
