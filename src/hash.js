'use strict'

const
  uglify = require('uglify-js'),
  fs = require('fs-extra'),
  path = require('path'),
  resolve = path.resolve
let
  cwd = process.cwd(),
  Handlebars = null
let {
  readFile,
  writeFile,
  removeFile,
} = require('./helpers')

try {
  Handlebars = require(resolve(cwd, 'node_modules/handlebars'))
} catch (err) {
  if ('MODULE_NOT_FOUND' === err.code)
    Handlebars = require.main.require('handlebars')
  else throw err
}

class Hash {
  constructor() {
    this.helpers = {}
    this.partials = {}
    this.templates = {}
    this.wrappers = {
      helpers: readFile(resolve(__dirname, './wrappers/helpers')),
      partials: readFile(resolve(__dirname, './wrappers/partials')),
      templates: readFile(resolve(__dirname, './wrappers/templates')),
      standalone: readFile(resolve(__dirname, './wrappers/standalone'))
    }
  }

  add(filepath) {
    // check
    let file = this._getFileinfo(filepath)
    if (!file) return false

    // read
    file.content = readFile(filepath)

    // compile
    try {
      file.precompiled = 'helpers' === file.type ?
        file.content : Handlebars.precompile(file.content)
    } catch (err) {
      let message = config.appName + ' Handlebars_Parse_Error in file: ' + file.publicName + file.ext + '\n' + err.message
      console.error(message)
      return false
    }

    file.compiled = this._wrap({
      file: file,
      wrapper: this.wrappers[file.type],
      content: file.precompiled
    })

    // store in Hash
    this[file.type][file.publicName] = file
    return file

    // write standalone
    // TODO: don't write if no special option
    // let output = this._wrap({
    //   file: file,
    //   wrapper: this.wrappers.standalone,
    //   content: file.compiled
    // })
    //
    // try {
    //   output = config.output.minify ? this._compress(output) : output
    // } catch (err) {
    //   let message = config.appName + ' JS_Parse_Error in file: ' + path.join(file.relativeDir, file.base) + '\n' + err.message
    //   console.error(message)
    //   return false
    // }
    //
    // writeFile(file.storepath, output)
    //
    // return file
  }

  update(filepath) {
    return this.add(filepath)
  }

  remove(filepath) {
    let file = this._getFileinfo(filepath)
    if (!file) return false
    delete this[file.type][file.publicName]
    // remove from disk
    // removeFile(file.storepath)
    return file
  }

  updateBundle() {
    let output = this.concat()
    if (!output) return

    output = this._wrap({
      wrapper: this.wrappers.standalone,
      content: output
    })

    try {
      output = config.output.minify ? this._compress(output) : output
    } catch (err) {
      return false
    }

    writeFile(config.output.bundleFile, output)
  }

  _wrap(options) {
    options.file = options.file || {}
    return options.wrapper
      .replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER_FILENAME/i, options.file.publicName || '')
      .replace(/INJECT_HANDLEBARS_INTERNAL_WRAPPER_CONTENT/i, options.content)
  }

  _compress(output) {
    // output = output
    // 	.replace(/'/gi, '\'')
    // 	.replace(/"/gi, '\"')
    try {
      return uglify.minify(output, {
          fromString: true
        })
        .code
        .replace(/(\\t){2,}/gi, '')
    } catch (err) {
      let error = new Error('JS_Parse_Error')
      error.code = 'JS_Parse_Error'
      error.message = err.message
      throw error
    }
  }

  concat() {
    let helpers = Object.keys(this.helpers)
      .map(key => this.helpers[key].compiled)
    let partials = Object.keys(this.partials)
      .map(key => this.partials[key].compiled)
    let templates = Object.keys(this.templates)
      .map(key => this.templates[key].compiled)

    let output = helpers.join('\n') + partials.join('\n') + templates.join('\n')
    return output.length ? output : false
  }

  _getFileinfo(filepath) {
    let file = path.parse(filepath)
    if (!this._filepathCheck(file)) return false

    file.type = this._findFileType(file)
    let relativeDir = file.dir.replace(config.entry[file.type], '')
    if (relativeDir.indexOf('/') === 0)
      relativeDir = relativeDir.substring(1, relativeDir.length)
    file.relativeDir = relativeDir
    file.publicName = path.join(relativeDir, file.name)
    return file
  }

  _filepathCheck(file) {
    // filter .gitignore and non-js files
    if (file.base.match(/\.gitignore/i))
      return false
    if ('.js' === file.ext || '.hbs' === file.ext)
      return true
    return false
  }

  _findFileType(file) {
    if (file.dir.match(config.entry.helpers))
      return 'helpers'
    if (file.dir.match(config.entry.partials))
      return 'partials'
    if (file.dir.match(config.entry.templates))
      return 'templates'
  }
}

module.exports = new Hash()
