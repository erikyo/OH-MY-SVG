interface htmlProperty {
    prop: any;
    value: any;
}
/**
 * It takes an SVG string and an array of html properties and returns an SVG string with the properties
 *
 * @param {string}         svg   - the svg string
 * @param {htmlProperty[]} props - an array of objects with two properties:
 * @return A string
 */
export declare function updateHtmlProp(svg: string, props: htmlProperty[]): string;
/**
 * Sanitizes the svg string
 *
 * @param  svg
 * @description It takes the SVG string, sanitizes it, and returns it as html
 *
 * @return {string} The sanitized SVG markup
 */
export declare function cleanMarkup(svg: string): {
    __html: string;
};
/**
 * Convert byte to human-readable format
 *
 * @param {number} bytes - the number of char of the string
 */
export declare function humanFileSize(bytes: number): string;
export {};
//# sourceMappingURL=common.d.ts.map