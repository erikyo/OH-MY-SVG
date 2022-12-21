export const SvgoStats = ( { original, compressed } ) => {
	const sizeOriginal = original.length;
	const sizeCompressed = compressed.length;

	// get the percentage of file size
	const percentOriginal =
		( ( sizeOriginal - sizeCompressed ) / sizeOriginal ) * -100;

	return (
		<i
			style={ {
				color: 'var(--wp--preset--color--cyan-bluish-gray)',
			} }
		>
			({ sizeCompressed.humanFileSize() }/
			{ sizeOriginal.humanFileSize() }{ ' ' }
			{ percentOriginal.toFixed( 2 ) }%)
		</i>
	);
};
