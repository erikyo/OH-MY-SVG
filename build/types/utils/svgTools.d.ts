import { SvgColorDef, SvgStrokeDef, SvgSizeDef, SvgAttributesEditor } from '../types';
import { BlockAttributes } from '@wordpress/blocks';
/**
 * Triggered when an image is selected with an input of file type
 *
 * Loads the file with FileReader and then passes the result to the function that cleans/parses in its contents
 *
 * @param {Blob} file
 *
 * @return {Promise} the file reader promise
 */
export declare const readSvg: (file: Blob) => Promise<string | null>;
/**
 * This function is launched when an SVG file is read.
 * Sequentially: first cleans up the markup, tries to figure out the size of the image if is possible,
 * and then replaces the current svg
 *
 * @param {SvgAttributesDef} res - The string that was read into the file that is supposed to be a svg
 */
export declare const loadSvg: ({ newSvg, fileData, oldSvg, }: {
    newSvg: string;
    fileData: File | undefined;
    oldSvg: BlockAttributes;
}) => SvgAttributesEditor | null;
/**
 * It takes the SVG string, optimizes it, and then sets the `svg` attribute to the optimized SVG string
 *
 * @param {string} svgString - waits SVGO to optimize the svg then return the markup
 * @return  {string} result
 */
export declare function optimizeSvg(svgString: string): string;
/**
 * It takes an SVG document and returns a string representation of it
 *
 * @param {Document} svgDoc - The SVG document that you want to convert to a string.
 *
 * @return {string} A uncleaned string of the svgDoc.
 *
 */
export declare const getSvgString: (svgDoc: Document) => string;
/**
 * It takes a string of SVG markup and returns a document object
 *
 * @param {string} svgData - The SVG data that you want to convert to a PNG.
 * @return {Document} A DOMParser object.
 */
export declare const getSvgDoc: (svgData: string) => Document;
/**
 * It takes a string of SVG markup and returns a document object
 *
 * @param {string} svgMarkup
 *
 * @return {string} the src url of the given svg markup
 */
export declare function encodeSvg(svgMarkup: string): string;
/**
 * Collect the colors used into the svg. It takes a string of text and returns an array of unique colors found in that string
 *
 * @param  fileContent - The content of the file that you want to extract colors from.
 *
 * @return An array of unique colors.
 */
export declare function collectColors(fileContent: string): SvgColorDef[];
/**
 * Replaces a color used in the svg image with another color
 *
 * @param {string} svgDoc
 * @param {string} newColor
 * @param {string} color
 */
export declare const updateColor: (svgDoc: string, newColor: string, color: string) => string;
/**
 * Parse the svg content to get the size of the svg image look first for viewbox and if not found, the height and width xml properties
 *
 * @param {string} fileContent
 */
export declare function getSvgSize(fileContent: string): SvgSizeDef;
/**
 *  Add a stroke around path, circle, rect this for example is useful if you want to animate the svg line
 *
 * @param {Object} stroke
 * @param {string} stroke.svgMarkup
 * @param {string} stroke.pathStrokeColor
 * @param {number} stroke.pathStrokeWith
 * @param {Array}  stroke.pathStrokeEl
 */
export declare const svgAddPathStroke: ({ svgMarkup, pathStrokeWith, pathStrokeColor, pathStrokeEl, }: SvgStrokeDef) => string;
/**
 * Adds the "fill:transparent" property to the current svg (basically makes it transparent apart from the borders)
 *
 * @param {string} svgMarkup - the svg string
 */
export declare const svgRemoveFill: (svgMarkup: string) => string;
/**
 *	Using a base64 encoded svg image get the svg image and render it as bitmap data
 *
 * @param {Object} bitmap
 * @param {string} bitmap.svgBase64
 * @param {number} bitmap.sizeRatio
 * @param {number} bitmap.width
 * @param {number} bitmap.height
 * @param {string} bitmap.format
 * @param {number} bitmap.quality
 *
 * @return {Promise<string>} the svg as bitmap image
 */
export declare const convertSvgToBitmap: ({ svgBase64, sizeRatio, height, width, format, quality, }: {
    svgBase64?: string | undefined;
    sizeRatio?: number | undefined;
    height?: number | undefined;
    width?: number | undefined;
    format?: string | undefined;
    quality?: number | undefined;
}) => Promise<string>;
//# sourceMappingURL=svgTools.d.ts.map