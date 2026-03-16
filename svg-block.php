<?php

/**
 * Plugin Name:       OH MY SVG
 * Description:       A Simple plugin that adds the SVG Block to your Gutenberg block editor.
 * Version:           1.4.0
 * Requires at least: 5.7
 * Tested up to:      6.9
 * Requires PHP:      7.1
 * Author:            codekraft
 * Author URI:        https://codekraft.it
 * License:           GPL v3 or later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       oms
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the block by passing the location of block.json to register_block_type.
 */
add_action( 'init', function() {
	/**
	 * Register block type for rendering SVG from meta
	 *
	 * @since 1.0.0
	 */
	register_block_type( __DIR__ . '/build', [
		'render_callback' => function( $attributes, $content, $block ) {
			$svg_code = '';

			// 1. Handle Media Storage (Swap SRC)
			if ( ! empty( $attributes['storage'] ) && $attributes['storage'] === 'media' && ! empty( $attributes['mediaId'] ) ) {
				$svg_code = get_post_meta( $attributes['mediaId'], '_oh_my_svg_data', true );
				if ( $svg_code ) {
					// Create Data URI
					$base64_svg = base64_encode( $svg_code );
					$data_uri = 'data:image/svg+xml;base64,' . $base64_svg;

					// Check if content has an image tag to replace
					if ( strpos( $content, '<img' ) !== false ) {
						// Find the src attribute in the content and replace it
						// We look for src="..." or src='...'
						$content = preg_replace( '/src=["\']([^"\']+)["\']/', 'src="' . $data_uri . '"', $content, 1 );
					} else {
						// Fallback: Regenerate the IMG tag if it's missing (e.g. legacy/migrated block)
						// This ensures the image shows up even if the user hasn't re-saved the post
						$image_url = wp_get_attachment_url( $attributes['mediaId'] );
						if ( $image_url ) {
							$style = [];
							// Rotation
							if ( ! empty( $attributes['rotation'] ) ) {
								$style[] = 'transform: rotate(' . intval( $attributes['rotation'] ) . 'deg)';
							}
							// Alignment
							$align = isset( $attributes['align'] ) ? $attributes['align'] : '';
							if ( $align === 'center' ) {
								$style[] = 'display: table';
								$style[] = 'width: inherit';
								$style[] = 'margin: auto';
							} elseif ( $align === 'wide' || $align === 'full' ) {
								$style[] = 'display: flex';
								$style[] = 'max-width: inherit';
								$style[] = 'width: 100%';
							} else {
								$style[] = 'display: flex';
							}

							$style_attr = ! empty( $style ) ? ' style="' . esc_attr( implode( '; ', $style ) ) . '"' : '';
							$width_attr = ! empty( $attributes['width'] ) ? ' width="' . esc_attr( $attributes['width'] ) . '"' : '';
							$height_attr = ! empty( $attributes['height'] ) ? ' height="' . esc_attr( $attributes['height'] ) . '"' : '';

							// Use Data URI directly
							$img_tag = sprintf(
								'<img src="%s"%s%s%s alt="" />',
								$data_uri,
								$style_attr,
								$width_attr,
								$height_attr
							);

							// Wrapper
							$wrapper_attributes = get_block_wrapper_attributes();

							// Link
							if ( ! empty( $attributes['href'] ) ) {
								$target = ! empty( $attributes['linkTarget'] ) ? ' target="' . esc_attr( $attributes['linkTarget'] ) . '"' : '';
								$rel    = ! empty( $attributes['rel'] ) ? ' rel="' . esc_attr( $attributes['rel'] ) . '"' : '';
								$title  = ! empty( $attributes['title'] ) ? ' title="' . esc_attr( $attributes['title'] ) . '"' : '';
								$content = sprintf( '<a href="%s"%s%s%s>%s</a>', esc_url( $attributes['href'] ), $target, $rel, $title, $img_tag );
							} else {
								$content = $img_tag;
							}

							return sprintf( '<div %s>%s</div>', $wrapper_attributes, $content );
						}
					}

					return $content;
				}
			}

			// 2. Default/Inline Behavior
			return $content;
		}
	]);
} );

/**
 * Register post meta for storing SVG data
 *
 * @since 1.0.0
 */
register_post_meta( 'post', '_oh_my_svg_data', [
	'show_in_rest' => [
		'schema' => [
			'type' => 'object',
			'additionalProperties' => true, // Allows dynamic keys (your unique IDs)
		]
	],
	'single' => true,
	'type' => 'object',
	'auth_callback' => function() { return current_user_can( 'edit_posts' ); }
]);

/**
 * Register post meta for storing SVG data
 *
 * @since 1.0.0
 */
function register_oh_my_svg_meta() {
    // Register for 'attachment' so the Media Library item holds the data
    register_post_meta( 'attachment', '_oh_my_svg_data', array(
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'string', // We can store just the string now, 1 attachment = 1 SVG
        'auth_callback' => function() { return current_user_can( 'edit_posts' ); }
    ) );
}
add_action( 'init', 'register_oh_my_svg_meta' );
