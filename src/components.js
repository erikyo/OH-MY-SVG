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
			({ sizeCompressed.humanFileSize() }/{ sizeOriginal.humanFileSize() }{ ' ' }
			{ percentOriginal.toFixed( 2 ) }%)
		</i>
	);
};
