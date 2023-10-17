=== OH MY SVG ===
Contributors:      codekraft
Tags:              svg, blocks, vector, icon, upload, sanitize
Requires at least: 5.7
Tested up to:      6.3
Stable tag:        0.1.4.3
Requires PHP:      7.1
License:           GPLv3 or later
License URI:       http://www.gnu.org/licenses/gpl-3.0.html

Unlock the magic of your website with the SVG block. Out-of-the-box security and turbocharged speed optimization!

== Description ==

Enhance your WordPress website with the power of SVG images using the Svg Block plugin. Easily add and manipulate SVG images with the block editor. This plugin provides an intuitive Svg Block that allows you to incorporate SVG icons, images, or HTML snippets effortlessly. Experience the convenience of automatic markup sanitation, optimization (svgo), and a range of useful utilities, such as color customization and markup modification for creating image variations.

The Svg Block offers the same controls as regular images, but with the flexibility of XML markup editing. Unleash your creativity with endless possibilities—animate SVGs using CSS animations or JavaScript, modify inner text, and create unique variations of the same SVG. Unlike traditional image formats, SVGs always render sharply and are incredibly lightweight, eliminating the need for multiple resized images for different screen sizes and resolutions.

Boost your website's performance with inline SVGs, which drastically reduce page load time by minimizing server requests and conserving bandwidth. Enjoy seamless integration and customization options that embedded SVGs offer, making your website visually stunning.

== Svg are awesome because: ==

- ✌️ SVGs render sharply and are lightweight, improving page performance.
- 🦄 Add any SVG icon, image, or HTML snippet effortlessly.
- 🪶 Incredibly lightweight compared to traditional images formats.
- 🎨 Customize colors and modify markup for creating image variations.
- ⚡ Increased page performance! Using inline SVGs saves can save dozens of requests and save server download bandwidth.
- 🎉 Easy animation with CSS and JavaScript.

= 🔒 Security =

The Svg Block plugin prioritizes security by not allowing uploads of SVG images into the media library, making it a safer option compared to other plugins that enable such uploads. SVGs used with this plugin are cleaned with DOMPurify, a robust JavaScript purifier, ensuring that only safe and validated SVGs are rendered. Unlike SVGs processed by external tools like ImageMagick, the SVGs included within your pages as XML fragments cannot be uploaded by unauthorized users from the website side. Only those with appropriate permissions to use the block editor can include SVGs.

Svg will be included within the pages as xml fragments, so they will not be processed by imagemagick and cannot be uploaded by anyone from website "side". Only those with permissions to use the editor will be allowed to 'upload' (or rather include) them.

= Inspirations, links =

[Mario Heiderich the-image-that-called-me](https://www.slideshare.net/x00mario/the-image-that-called-me)

[Fortinet - Anatomy of Scalable Vector Graphics (Svg) Attack Surface on the Web](https://www.fortinet.com/blog/threat-research/scalable-vector-graphics-attack-surface-anatomy)

== Installation ==

This plugin can be installed directly from your WordPress site.

1. Log in to your WordPress site and navigate to **Plugins &rarr; Add New**.
2. Type "OH MY SVG" into the Search box.
3. Locate the OH MY SVG plugin in the list of search results and click **Install Now**.
4. Once installed, click the Activate button.

It can also be installed manually using a zip file.

1. Download the OH MY SVG plugin from WordPress.org.
2. Log in to your WordPress site and navigate to **Plugins &rarr; Add New**.
3. Click the **Upload Plugin** button.
4. Click the **Choose File** button, select the zip file you downloaded in step 1, then click the **Install Now** button.
5. Click the **Activate Plugin** button.

== Frequently Asked Questions ==

= Can I use SVGs for buttons, icons, and other elements? =

Absolutely! The Svg Block allows you to use SVGs for various elements on your website, such as buttons, icons, and more. Simply create a reusable block to conveniently use the same SVG across multiple locations.

= Can I animate SVGs with CSS or JavaScript? =

Yes, you can easily animate SVGs using CSS or JavaScript. The Svg Block provides the flexibility to add CSS animations or implement JavaScript scripts to bring your SVGs to life.

== Changelog ==

= 0.1.4 - 2023-05-18 =

* Added the Duotone filter for SVG images.
* Fixed alignment issues with SVGs.
* Improved handling of SVG size and scaling.
* Updated plugin dependencies for enhanced compatibility.
* Fixed package configuration for smoother installation process.

= 0.1.3 - 2023-02-02 =

* Updated editor controls
* Adds border control
* Fixes some issues with svg alignment (thanks to @vralle)
* Link control update

= 0.1.2 - 2022-10-22 =

* Fixes an issue with selection container in WordPress 6.0.3
* Updated dependencies

= 0.1.1 - 2022-08-03 =

* Provides some additional control (like rotation)
* Enhanced color gathering
* A better original svg image handling (the image is stored each time it is loaded or replaced)
* Adds developer docs

= 0.1.0 - 2022-07-25 =

* Initial release of the Svg Block plugin.
* Introduced the Svg Block for seamless integration with the block editor.
* Enabled adding and manipulating SVG icons, images, and HTML snippets.
* Provided automatic markup sanitation and optimization features.
* Offered utilities for color customization and markup modification.
* Supported CSS animations and JavaScript scripts for SVG animations.

== Resources ==

* dompurify © 2015 Mario Heiderich, [Apache License Version 2.0](https://raw.githubusercontent.com/cure53/DOMPurify/main/LICENSE)
* svgo © 2021 Kir Belevich, [MIT License](https://raw.githubusercontent.com/svg/svgo/main/LICENSE)

= Contribute =

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

* Reporting a bug
* Discussing the current state, features, improvements
* Submitting a fix 💯 or a new feature 🎉

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.
By contributing, you agree that your contributions will be licensed under its GPLv3 License.

== Screenshots ==

1. Svg edit capabilities
2. Svg as icon (link, alignment)

= Downloads =

[GitHub Repository](https://github.com/erikyo/svgb)
[Developer resources](https://erikyo.github.io/OH-MY-SVG/)
[WordPress directory](https://wordpress.org/plugins/oh-my-svg/)

