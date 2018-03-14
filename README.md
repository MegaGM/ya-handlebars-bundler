## YA Handlebars Bundler

Ya, yet another, because why not? ![](https://www.messentools.com/images/emoticones/zorrito/www.MessenTools.com-th_Pyong-1.gif)<br>

**Handlebars Bundler** is made to be a dead simple replacement for Webpack, when it comes to work with Handlebars templates, partials and helpers. It provides you basically the same functionality as if you would use `Webpack + handlebars-loader`. However, it's abit better and completely standalone. I'm proud of it, because it does its job like a charm. +You don't have to setup any Webpack/Gulp/Grunt/etc to use it.

## Menu
* [TLDR](#tldr-it-can)
* [Installation](#installation)
* [Basic usage](#basic-usage)
* [Options](#options)
* [Default config values](#default-config-values)
* [Examples](#examples)

## TLDR it can:
- **watch** over all nested, even **dynamically created**, files/folders
- **cache** all the files in RAM
- **(re)compile** only what has to be (re)compiled
- **minify** and **mangle** output
- **bundle** all the stuff into a single file

Out of the box you'll be able to use the bundle in various environments, like:
- **CommonJS**: Node.js, Browserify, Webpack etc
- **AMD**: RequireJS, Dojo Toolkit, ScriptManJS etc
- **Browsers** without any custom loaders

## Installation

`npm install -g ya-handlebars-bundler`

**NOTICE:** `handlebars` library (or `handlebars/runtime`) MUST be already included somehow in your application. In browsers it should be included before the bundle file.<br>
You can find and download latest Handlebars builds at [cdnjs](https://cdnjs.com/libraries/handlebars.js)

## Basic usage

```sh
mkdir ~/myapp
cd ~/myapp
handlebars-init # easy way to create handlebars.config.js in CWD
# (*) it will be prefilled with the default values
# (*) and some dirs: [helpers, partials, templates]
# (*) will be created and will contain some examples
vim handlebars.config.js # now it's time to edit the config
handlebars-watch # or `watch-handlebars`, it's just an alias.
```
**NOTICE:** It's recommended to run as background task `handlebars-watch &`

## Options

Configuration file MUST be called `handlebars.config.js`.
#### Default config values:

```javascript
module.exports = {
  entry: {
    helpers: 'helpers',
    partials: 'partials',
    templates: 'templates',
  },
  output: {
    path: './', // the CWD
    filename: 'handlebars.bundle.js',
    minify: false, // if true, .js will be replaced with .min.js
    // (*) as well as output will be minified and mangled
  },
  options: {
    verbose: true, // if false, less info in stdout
    // (*) stderr stream is always at its full power
  },
}
```

#### With the default config **the bundler will:**

- **watch** over<br>
  `~/myapp/helpers`<br>
  `~/myapp/partials`<br>
  `~/myapp/templates`<br>

- **compile** and **bundle** all the stuff on the fly into<br>
  `~/myapp/handlebars.bundle.js`

# Examples:

**NOTICE:** Consider, please, that `Handlebars` is Capitalized everywhere.

## Handlebars Template Referencing
```handlebars
{{> nes/ted/kitty }} # nested partials
{{#capitalize message myProp="true"}}{{/capitalize}} # helpers
```


## Handlebars Helper example
```javascript
// usage: {{#capitalize message myProp="true"}}{{/capitalize}}
Handlebars.registerHelper('capitalize', (context, options) => {
  // context === message
  let myProp = options.hash.myProp
  return `you can declare multiple helpers per file, I don't do that though`
})
```

## Node.js
```sh
npm install --save handlebars
```
then in `anyfile.js`

```javascript
const Handlebars = require('handlebars')
require('./handlebars.bundle.js') // That's it!
/**
 * Now you're free to use templates, partials and helpers
 * as you usually do
 */
const html = Handlebars.templates.kittens({})
// or
const html = Handlebars.templates['kittens']({})
// or let's say we have nested file `~/myapp/templates/partials/nes/ted/kitty.hbs`
const html = Handlebars.partials['nes/ted/kitty']({})
```

## RequireJS
```javascript
// Runtime build will be enough, you don't really need the full Handlebars anymore
require(['handlebars.runtime.amd.min.js', './handlebars.bundle.js'], Handlebars => {
  // the same as for Node.js
});
```

## Browsers
```html
<!-- Runtime build will be enough, you don't really need the full Handlebars anymore -->
<script src="handlebars.runtime-v4.0.11.min.js"></script>
<script src="handlebars.bundle.js"></script>
<script>
  // the same as for Node.js
</script>
```
