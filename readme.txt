=== OH MY SVG ===
Contributors:      codekraft
Tags:              svg, block, vector, icon, upload, sanitize, link, image, file, graphic, media, svgo
Requires at least: 5.7
Tested up to:      6.0
Stable tag:        0.1.0
Requires PHP:      7.1
License:           GPLv3 or later
License URI:       http://www.gnu.org/licenses/gpl-3.0.html

Add any svg to your website with the superpowers of the block editor. Out-of-the-box security and speed optimization!

== Description ==

This plugin adds the SVG Block to your Gutenberg editor that could be used with any svg icon or image (or even with an html snippet).
Some key features are provided like automatic markup sanitation, svgo optimization, and small utility to change the color and the markup.
Has the same controls as images but actually the content is xml markup (ps also works with html) this allows the possibility to use css animations or js scripts to animate it.

= Security =

Since this plugin doesn't enable uploads of svg images into media library could be considered safer than all the others that enable the upload.
As if that wasn't enough svg's will be cleaned with DOMpurifier which indeed is a first class js purifier, those used in php try to mimic how it works.
Svgs will be included inside pages as xml fragment, they will not be processed by imagemagick and no one other than the user (with the block editor permission) will have the permission to "upload" (or better include) them.

= Inspirations, links =

[Mario Heiderich the-image-that-called-me](https://www.slideshare.net/x00mario/the-image-that-called-me)
[Fortinet - Anatomy of Scalable Vector Graphics (SVG) Attack Surface on the Web](https://www.fortinet.com/blog/threat-research/scalable-vector-graphics-attack-surface-anatomy)


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

== Changelog ==

= 0.1.0 - 2022-07-25 =
* Initial Release.


= Contribute =
We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

* Reporting a bug
* Discussing the current state, features, improvements
* Submitting a fix 💯 or a new feature 🎉

We use github to host code, to track issues and feature requests, as well as accept pull requests.
By contributing, you agree that your contributions will be licensed under its GPLv3 License.

[GitHub Repository](https://github.com/erikyo/svgb)
