/**
 * MEOW
 */
'use strict'

const fs = require('fs-extra')
module.exports = {
  readFile,
  writeFile,
  removeFile,
  showInfo,
  showError,
  singular,
  getFileStats,
}

/* ================================================
 * Global Helpers
 * ===============================================*/
function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf-8')
  } catch (err) {
    console.error(config.appName, 'is not able to read file: ', filepath, '\n', err)
    return ''
  }
}

function writeFile(filepath, content) {
  try {
    fs.outputFileSync(filepath, content)
    return true
  } catch (err) {
    showError('cannot write to file: ' + filepath + '\n' + err)
    return false
    // throw err
  }
}

function removeFile(filepath) {
  try {
    return fs.removeSync(filepath)
  } catch (err) {
    console.error(config.appName, 'is not able to delete file: ', filepath, '\n', err)
  }
}

function getFileStats(filepath) {
  return fs.statSync(filepath).size
}

function showInfo(message) {
  return console.info(global.config.appName, message)
}

function showError(message) {
  // global.spinner.fail()
  return global.spinner.fail(global.config.appName + ' ' + message)
  return console.error(global.config.appName, message)
}

function singular(word) {
  // helpers => helper
  return word.substring(0, word.length - 1)
}
