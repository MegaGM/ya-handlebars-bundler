module.exports = {
  entry: {
    helpers: 'templates/helpers',
    partials: 'templates/partials',
    templates: 'templates/templates',
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
