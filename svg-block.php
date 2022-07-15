<?php

/**
 * Plugin Name: SVGB
 */

/**
 * Registers and enqueue the block assets
 */
function svg_plugin_register_block() {
	// Register the block by passing the location of block.json to register_block_type.
	register_block_type( __DIR__ . '/src' );
}
add_action( 'init', 'svg_plugin_register_block' );

/**
 * Registers and enqueue the Editor scripts
 */
function svg_editor_scripts() {
	$asset = include __DIR__ . '/build/index.asset.php';
	wp_enqueue_script( 'ssc-gutenberg', plugin_dir_url( __FILE__ ) . 'build/ssc-editor.js', $asset['dependencies'] );
}

add_action( 'enqueue_block_editor_assets', 'svg_editor_scripts' );
