=== OH MY Svg ===
Contributors:      codekraft
Tags:              svg, blocks, vector, icon, upload, sanitize
Requires at least: 5.7
Tested up to:      6.0
Stable tag:        0.1.3
Requires PHP:      7.1
License:           GPLv3 or later
License URI:       http://www.gnu.org/licenses/gpl-3.0.html

Add any svg to your website with the superpowers of the block editor. Out-of-the-box security and speed optimization!

== Description ==

This plugin provides a Svg Block to your block editor, this can be used with any svg icon or image (or even a html snippet). Some key features are provided like automatic markup sanitation, optimization (svgo), and small utility to change the color and the markup that will be very useful for you to create variations of your image.

This block has the same controls as the images, but actually the content is xml markup, and you can change it as you like! This allows thousands of possibilities... You will be able to use css animations or js scripts to animate it, change the inner text of the svg, create variations of the same svg.
However, this has the disadvantage that the svg will not be copied into the media library, so if you plan to use the same svg several times (buttons, icons, etc.) you are better off creating a reusable block

From a performance point of view, be aware that the image will not be included as an external resource, but will instead be within the markup of the page, thus making svg even faster than it already is.

== Svg are awesome because: ==

- ✌️ Are always super sharp!
- 🪶 Incredibly lightweight and doesn't require any additional resize image (you only need one source for all screen sizes and resolutions)
- ⚡ Increased page performance! Using inline SVGs saves can save dozens of requests and save server download bandwith.
- 🎉 highly customisable and animatable! Embedded svgs are easy to be animated, just use css!

= Security =

Since this plugin doesn't enable uploads of svg images into media library could be considered safer than all the others that enable the upload.
As if that wasn't enough Svg's will be cleaned with DOM purify which indeed is a first class js purifier, those used in php try to mimic how it works.

Svg will be included within the pages as xml fragments, so they will not be processed by imagemagick and cannot be uploaded by anyone from website "side". Only those with permissions to use the editor will be allowed to 'upload' (or rather include) them.

= Inspirations, links =

[Mario Heiderich the-image-that-called-me](https://www.slideshare.net/x00mario/the-image-that-called-me)

[Fortinet - Anatomy of Scalable Vector Graphics (Svg) Attack Surface on the Web](https://www.fortinet.com/blog/threat-research/scalable-vector-graphics-attack-surface-anatomy)

== Installation ==

This plugin can be installed directly from your WordPress site.

1. Log in to your WordPress site and navigate to **Plugins &rarr; Add New**.
2. Type "OH MY Svg" into the Search box.
3. Locate the OH MY Svg plugin in the list of search results and click **Install Now**.
4. Once installed, click the Activate button.

It can also be installed manually using a zip file.

1. Download the OH MY Svg plugin from WordPress.org.
2. Log in to your WordPress site and navigate to **Plugins &rarr; Add New**.
3. Click the **Upload Plugin** button.
4. Click the **Choose File** button, select the zip file you downloaded in step 1, then click the **Install Now** button.
5. Click the **Activate Plugin** button.

== Changelog ==

= 0.1.3 - 2023-02-02 =

* Updated editor controls
* Adds border control
* Fixes some problems with svg alignment
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

* Initial Release.

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
[Developer resources](https://erikyo.github.io/OH-MY-Svg/)
[WordPress directory](https://wordpress.org/plugins/oh-my-svg/)

