/** The block icon */
export const svgIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
		<path d="M245.2 153.5a36 36 0 0 0-32-60.7 36 36 0 0 0-20.3-65.6 36 36 0 0 0-29.7 15.7 36 36 0 0 0-60.7-32.1 36 36 0 0 0-9.9 32.1 36 36 0 0 0-65.7 20.2 36 36 0 0 0 15.7 29.7 36.5 36.5 0 0 0-6.7-.6 35.7 35.7 0 0 0-35.9 36A35.7 35.7 0 0 0 36 164c2.2 0 4.5-.3 6.6-.7A36 36 0 0 0 63 229.1a36 36 0 0 0 29.7-15.8 36 36 0 0 0 60.7 32.2 36 36 0 0 0 9.9-32.2 36 36 0 0 0 65.6-20.2 36 36 0 0 0-15.7-29.7 36.4 36.4 0 0 0 32.1-9.9" />
		<path
			fill="#FFB13B"
			d="M234.4 113.5c-8-8-21.1-8-29.2 0h-42.1l29.8-29.8a20.6 20.6 0 1 0-20.6-20.6l-29.9 29.8V50.7a20.6 20.6 0 1 0-29.1 0V93L83.5 63.1a20.6 20.6 0 1 0-20.6 20.6l29.8 29.8H50.5a20.6 20.6 0 1 0 0 29.2h42.2l-29.8 29.8a20.6 20.6 0 1 0 20.6 20.6l29.8-29.8v42.2a20.6 20.6 0 1 0 29.1 0v-42.2l29.9 29.8a20.6 20.6 0 1 0 20.6-20.6L163 142.7h42.1a20.6 20.6 0 1 0 29.2-29.2"
		/>
	</svg>
);

/**
 * The error icon displayed when the svg cannot be loaded
 *
 * @param {string} message
 */
export const ErrorSvg = ( message ) => (
	<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<rect
			stroke="#ccc"
			strokeWidth="2px"
			fill="#f3f3f3"
			height="100%"
			width="100%"
		></rect>
		<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
			{ message }
		</text>
	</svg>
);
