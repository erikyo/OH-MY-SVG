=== OH MY SVG ===
Contributors:      codekraft
Tags:              svg, blocks, vector, icon, performance
Requires at least: 5.7
Tested up to:      6.9
Stable tag:        1.5.0
Requires PHP:      7.1
License:           GPLv3 or later
License URI:       http://www.gnu.org/licenses/gpl-3.0.html

Unlock the magic of your website with the SVG block. Out-of-the-box security, dual storage modes, and turbocharged speed optimization!

== Description ==

Enhance your WordPress website with the power of SVG images using the **OH MY SVG** plugin. Easily add, manipulate, and optimize SVG images directly within the Gutenberg block editor.

Unlike traditional image blocks, this plugin provides an intuitive interface that allows you to incorporate SVG icons, illustrations, or HTML snippets effortlessly. Experience the convenience of automatic markup sanitation, SVGO optimization, and a range of built-in utilities like color customization, stroke adjustments, and element stripping.

### 🌟 Smart Dual Storage Modes (New!)

One of the biggest issues with using SVGs in WordPress is database bloat. If you paste a heavy SVG directly into the editor, its entire XML markup gets saved into every single post revision, quickly cluttering your database. **OH MY SVG solves this by offering two distinct storage modes:**

1. **Inline Mode (Best for tiny icons):** The SVG markup is embedded directly within the page's HTML. This drastically reduces page load time by eliminating server requests and conserving bandwidth. Ideal for small, lightweight vectors.
2. **Media Library Mode (Best for heavy illustrations):** To prevent database bloat, this mode saves the SVG behind the scenes as a custom post meta attached to the WordPress Media Library. The plugin automatically generates a lightweight PNG proxy image so you can see it in your media grid. On the front end, it renders cleanly using a data URI, keeping your post content light, your database clean, and your page performance high.

Unleash your creativity with endless possibilities—animate SVGs using CSS or JavaScript, modify inner colors, and scale infinitely without losing sharpness.

== Svg are awesome because: ==

* ✌️ **Pixel Perfect:** SVGs render sharply on any screen and resolution.
* 🗄️ **Zero Database Bloat:** Choose to link heavy SVGs to the Media Library, keeping your post content and revisions lightweight.
* 🎨 **In-Editor Editing:** Customize colors, add strokes, and remove fills to create variations directly in Gutenberg.
* ⚡ **Performance Boost:** Use inline SVGs to save dozens of HTTP requests and reduce server download bandwidth.
* 🛠️ **Built-in Optimizer:** Automatically compress and optimize markup using the integrated SVGO tool.
* 🎉 **Developer Friendly:** Easy to animate with CSS and JavaScript since they render as DOM elements or standard image tags.

= 🔒 Security First =

The OH MY SVG plugin prioritizes your website's security. By default, WordPress blocks raw SVG file uploads due to severe XML/XSS vulnerabilities. **This plugin keeps that protection intact.** Instead of allowing dangerous direct `.svg` uploads, our plugin safely processes the SVG markup within the editor using a robust JavaScript purifier (DOMPurify). When saving to the Media Library, it creates a harmless PNG proxy file and securely stores the sanitized SVG string as an attachment metadata field. SVGs cannot be maliciously uploaded from the website "side" (e.g., frontend forms); only trusted users with editor permissions can include them.

= Inspirations, links =

* [Mario Heiderich - the-image-that-called-me](https://www.slideshare.net/x00mario/the-image-that-called-me)
* [Fortinet - Anatomy of Scalable Vector Graphics (Svg) Attack Surface on the Web](https://www.fortinet.com/blog/threat-research/scalable-vector-graphics-attack-surface-anatomy)

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
4. Click the **Choose File** button, select the zip file you downloaded, then click the **Install Now** button.
5. Click the **Activate Plugin** button.

== Frequently Asked Questions ==

= Can I use SVGs for buttons, icons, and other elements? =
Absolutely! The Svg Block allows you to use SVGs for various elements on your website. You can even create a Reusable Block to conveniently manage the same SVG across multiple locations.

= When should I use "Inline" vs "Save to Library"? =
Use **Inline** for very small, simple SVGs (like UI icons or small logos) where saving an HTTP request is beneficial. Use **Save to Library** for complex, path-heavy illustrations. This prevents the massive SVG text string from being duplicated in your database every time WordPress autosaves a post revision.

= Can I animate SVGs with CSS or JavaScript? =
Yes, you can easily animate them. If you use the Inline mode, the SVG nodes are injected directly into the DOM, making them fully targetable via CSS and JS scripts.

== Changelog ==

= 1.5.0 =
* **Major Feature:** Introduced Dual Storage Mode! You can now link SVGs to the Media Library.
* **Database Optimization:** Linking SVGs to the Media Library prevents huge XML strings from cluttering post revisions, massively improving database health.
* **Auto-Proxy Generation:** Automatically generates a PNG proxy image when saving SVGs to the Media Library for native grid-view compatibility.
* **Editor Tools:** Added new editor tools to instantly "Remove Fill" or "Add Stroke" directly from the block sidebar.
* **SVGO Integration:** See real-time compression stats and click "Optimize" to drastically reduce your SVG markup size.
* Improved frontend rendering using Base64 Data URIs for media-linked SVGs.

= 0.1.4 =
* Added the Duotone filter for SVG images.
* Fixed alignment issues with SVGs.
* Improved handling of SVG size and scaling.
* Updated plugin dependencies for enhanced compatibility.
* Fixed package configuration for smoother installation process.

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

