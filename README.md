# Handlebars bundler
Ya, yet another, because why not?  
Actually I'm not the one who likes to reinvent the wheel, but in this particular case the game worth the candle. I'm using Handlebars a lot in many applications. Despite of existence of numerous packing tools like Gulp, Grunt, Wepback, etc, I always wanted a truly simple yet powerfull tool, that would allow me to include Handlebars in any application, without any changes to the application structure, with just a couple of terminal commands. Just plug Handlebars in, nothing less nothing more. That's why the bundler was created. And I'm proud of it, because it does its job like a charm.

## It can:
- **watch** for various file/folder changes
- **compile** the files to templates, partials and helpers
- **wrap** compiled files into a compatibility wrapper
- **minify** and **mangle** output
- **bundle** all the stuff into a single file

Out of the box you'll be able to use all the produced files (individually or as a bundle) in various environments:
- **CommonJS**: Node.js, Browserify, Webpack etc
- **AMD**: RequireJS
- **Browsers** without any custom loaders

## Installation
`npm install -g ya-handlebars-bundler`  

There is no external dependencies for the bundler itself. However, in order to make the produced files to work, the `Handlebars` library should be included somehow in your application. You already have it, right? If for some reason you still don't have it yet, read [Usage of the output files](#usage-of-the-output-files) below.

## Bundler usage
*Let's assume your application is in: `/www/myapp`*

```sh
cd /www/myapp
touch handlebars.config.js # fill the config with some values, then
watch-handlebars # or `handlebars-watch`, it's just an alias.
```


# Configuration
Configuration file should be called `handlebars.config.js`. Here you can see the default values:

```js
module.exports = {
		// relative or absolute path for a directory with raw templates, partials and helpers
    raw: 'raw',
		// relative or absolute path for a directory for compiled templates, partials and helpers
    compiled: 'compiled',
		// relative or absolute path for a directory where a bundle will be created
		bundle: 'compiled',
		// filename base for the bundle file
		bundleFilename: 'bundle', // => it will resolved to `bundle.js` or `bundle.min.js`
		// should all the output files be mangled and minified?
    minify: true // => `.min` suffix will be added to the files
};
```
You can see more information about configuration options below at [Options](#options)

With this particular config **The bundler will:**
- **watch** over  
`/www/myapp/raw/templates`,  
`/www/myapp/raw/partials` and  
`/www/myapp/raw/helpers`
- **compile**, **wrap**, **mangle** and **minify** individual files into  
`/www/myapp/compiled/templates`,  
`/www/myapp/compiled/partials` and  
`/www/myapp/compiled/helpers`
- **bundle** all the stuff into  
`/www/myapp/compiled/bundle.min.js`

All the output files will be ready to use in the all claimed environments.


## Usage of the output files
1. Include `Handlebars` or `handlebars.runtime` library in your application
2. Include a compiled template, patrial or a helper, or just a single bundle file instead
3. That's it!

You can easily find and download latest Handlebars builds at [cdnjs](https://cdnjs.com/libraries/handlebars.js)
#### Examples:
```js
/* ================================================
 * Of course you can require individual compiled files, but that's tedious.
 * It's much simplier to include the whole bundle.
 * All the templates, partials and helpers will be awailable right away
 * ===============================================*/
```
##### Node.js
`$ npm install --save handlebars`  
then in `anyfile.js`
```js
let Handlebars = require('handlebars');
require('./compiled/bundle.min.js'); // or without .js or without .min.js

/* ================================================
 * Use templates as usual in Handlebars
 * ===============================================*/
let html = Handlebars.templates.kittens({name: 'Meowsie', color: 'white', says: 'meow!'});
// or
let html = Handlebars.templates['kittens']({name: 'Meowsie', color: 'white', says: 'meow!'});
```

##### RequireJS
```js
// Runtime build will be enough, you don't really need the full Handlebars anymore
require(['handlebars.amd.min.js', './compiled/bundle.min'], function (Handlebars) {
	/* ================================================
	 * Use templates as usual in Handlebars
	 * ===============================================*/
	var html = Handlebars.templates.kittens({name: 'Meowsie', color: 'white', says: 'meow!'});
	// or
	var html = Handlebars.templates['kittens']({name: 'Meowsie', color: 'white', says: 'meow!'});
});
```

##### Browsers
```html
<!-- Runtime build will be enough, you don't really need the full Handlebars anymore -->
<script src="handlebars.runtime-v4.0.5.js"></script>
<script src="compiled/bundle.min.js"></script>
<script>
	/* ================================================
	 * Use templates as usual in Handlebars
	 * ===============================================*/
	var html = Handlebars.templates.kittens({name: 'Meowsie', color: 'white', says: 'meow!'});
	// or
	var html = Handlebars.templates['kittens']({name: 'Meowsie', color: 'white', says: 'meow!'});
</script>
```

https://cdnjs.com/libraries/handlebars.js
you can find runtime build in this repo `./lib/handlebars.runtime-v4.0.5.js`


## TODO
- Make ReadMe :D
