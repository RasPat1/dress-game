Dress Up Game
-------------
Game that allows users to categorize products.  This is the front end of the game hosted at http://www.dress.shoptiques.net.  API is hosted with main grails app at http://www.shoptiques.com


This is an internal project we're making to categorize dress features. A dress and a feature is shown.  A user decides can vote up or vote down the product, feature combination.

The game is built usign React, Material-UI, HTML5 Boilerplate and Webpack

TODO
====
 * Experiment with different ways to show the data.  Currently user sees 2 unrelated feautres and one product.  The response to 70% of the combinations shown is neither
 * The build process is a little sloppy.  Uses Webpack for js and Gulp for css.  Use one.
 * No basic frontend perf optimizations implemented.  No need really... but might as well when cleaning up the build process (concatenate, minify).

Backend (grails API)
====================
 * There is no batching operation as of yet to associate the user interactions with tagged products.
 * The product features don't all apply to each product category.  IMO there should be a many-to-many relationship between productCategory and ProductFeature
