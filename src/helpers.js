'use strict'

const fs = require('fs-extra')
module.exports = {
  readFile,
  writeFile,
  removeFile,
}
/* ================================================
 * Global Helpers
 * ===============================================*/
function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf-8')
  } catch (err) {
    console.error(config.appName, 'is not able to read file: ', filepath, '\n', err)
  }
}

function writeFile(filepath, content) {
  try {
    return fs.outputFileSync(filepath, content)
  } catch (err) {
    console.error(config.appName, 'is not able to write file: ', filepath, '\n', err)
  }
}

function removeFile(filepath) {
  try {
    return fs.removeSync(filepath)
  } catch (err) {
    console.error(config.appName, 'is not able to delete file: ', filepath, '\n', err)
  }
}
