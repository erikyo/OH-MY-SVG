<?php

/**
 * Plugin Name: OH MY SVG
 * Description: A Simple plugin that adds an SVG Block to your Gutenberg block editor. Some basic features are provided like automatic markup sanitation, svgo optimization, color editor. Has the same controls as images but actually the content is xml markup (ps also works with html) this allows the possibility to use css animations or js script to animate it
 * Version: 0.1.0
 * Requires at least: 5.7
 * Requires PHP:      7.1.0
 * Author:            codekraft
 * Author URI:        https://codekraft.it
 * License:           GPL v3 or later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       oms
 */

/**
 * Register the block by passing the location of block.json to register_block_type.
 */
add_action( 'init', function() {
	register_block_type( __DIR__ . '/src' );
} );

/**
 * Registers and enqueue the Editor scripts
 */
add_action( 'enqueue_block_editor_assets', function() {
	$dep = include __DIR__ . '/build/oh-my-svg-editor.asset.php';
	wp_enqueue_script(
		'oh-my-svg-editor',
		plugin_dir_url( __FILE__ ) . 'build/oh-my-svg-editor.js',
		$dep['dependencies']
	);
} );
