/**
 * Check if the current align is the one specified
 *
 * @param {string}          currentAlign   - the current align
 * @param {string|string[]} alignmentCheck
 * @return {boolean} true if the alignment check contains the current alignment
 */
export declare function hasAlign(currentAlign: string | undefined, alignmentCheck: string | string[]): boolean;
/**
 * if the limit is bigger than the original values returns the proportionally scaled second value
 * this is useful to resize an image because given the container size the image width will be of the size of the limit and the height will be proportionally scaled
 *
 * @param {number} first
 * @param {number} second
 * @param {number} limit
 * @return {number} the second value (the height of the image, the width is the limit size)
 */
export declare function scaleProportionally(first: number | string, second: number | string, limit: number | string): number;
/**
 * It throws an error if the file fails to read
 *
 * @param {string} err - string - The error message that was thrown.
 */
export declare const onSvgReadError: (err: string) => Error;
//# sourceMappingURL=fn.d.ts.map