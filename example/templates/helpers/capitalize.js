Handlebars.registerHelper('capitalize', (context, options) => {
  // context === message
  let myProp = options.hash.myProp
  return `Message from helper.`
  //  You can declare multiple helpers per file, it's freaky though, don't do that :)
})
// usage: {{#capitalize message myProp="true"}}{{/capitalize}}
