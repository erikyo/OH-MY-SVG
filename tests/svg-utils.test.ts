import { humanFileSize } from "../src/utils/common";

describe( 'svgTools', () => {
	// HEX
	it( 'return the right size of the file converted into a readable filesize', () => {
		expect( humanFileSize( 213213131321 ) ).toBe( '198.57GB' );
		expect( humanFileSize( 1000 ) ).toBe( '1000.00B' );
		expect( humanFileSize( 1024 ) ).toBe( '1.00kB' );
	} );
} );
