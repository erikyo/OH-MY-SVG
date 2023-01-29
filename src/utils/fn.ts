/**
 * Check if the current align is the one specified
 *
 * @param {string}          currentAlign   - the current align
 * @param {string|string[]} alignmentCheck
 * @return {boolean} true if the alignment check contains the current alignment
 */
export function hasAlign(
	currentAlign: string = '',
	alignmentCheck: string | string[]
): boolean {
	if ( typeof alignmentCheck === 'object' ) {
		return alignmentCheck.includes( currentAlign );
	}
	return currentAlign === alignmentCheck;
}

/**
 * if the limit is bigger than the original values returns the proportionally scaled second value
 * this is useful to resize an image because given the container size the image width will be of the size of the limit and the height will be proportionally scaled
 *
 * @param {number} first
 * @param {number} second
 * @param {number} limit
 * @return {number} the second value (the height of the image, the width is the limit size)
 */
export function scaleProportionally(
	first: number | string,
	second: number | string,
	limit: number | string
): number {
	return ( Number( limit ) / Number( first ) ) * Number( second );
}

export const onSvgReadError = ( err: string ): Error => {
	throw new Error( 'Failed to read the given file' + err );
};