module.exports = {
  entry: {
    helpers: 'src/client/templates/helpers',
    partials: 'src/client/templates/partials',
    templates: 'src/client/templates/templates',
  },
  output: {
    path: 'static/bundles',
    filename: 'templates.js',
    minify: true,
  },
}
