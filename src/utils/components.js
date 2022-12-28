import SVG from '../Svg';
import { svgIcon } from './icons';
import { humanFileSize } from './common';

export const SvgoStats = ( { original, compressed } ) => {
	if ( ! original ) return null;
	const sizeOriginal = original?.length || 1;
	const sizeCompressed = compressed?.length || 1;

	// get the percentage of file size
	const percentOriginal =
		( ( sizeOriginal - sizeCompressed ) / sizeOriginal ) * -100;

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

export const mediaPreview = () => (
	<SVG markup={ svgIcon } width={ 1000 } height={ 1000 } />
);
