#!/usr/bin/env node

const program = require('commander')
const pkg = require('./package.json')
const markdownMagic = require('./index')
const findUp = require('find-up')
const defaultFileName = 'README.md'
const defaultConfigPath = './markdown.config.js'
const loadConfig = require('./cli-utils').loadConfig

var filePaths = defaultFileName
var callbackFunction = defaultCallback // eslint-disable-line
var ignorePath // eslint-disable-line

console.log(JSON.stringify(process.argv))

// start commander.js
program
  .version(pkg.version)
  .option('-p, --path [path]', `Define path to markdown (single path or glob). Default ${defaultFileName}`, parsePaths, defaultFileName)
  .option('-i, --ignore [path]', '(Optional) Define path to ignore', parseIgnorePaths, defaultConfigPath)
  .option('-c, --config [path]', '(Optional) Define config file path. If you have custom transforms or a callback you will want to specify this option', null, defaultConfigPath)
  // .option('-cb, --callback [path]', 'Define path', parsePaths, defaultFileName)
  .parse(process.argv)

console.log(`program.config: ${program.config}`)
console.log(`program.ignore: ${program.ignore}`)
const configFile = getConfigFilepath()
console.log(`configFile: ${configFile}`)
const foundConfig = (configFile) ? loadConfig(configFile) : false

if (foundConfig && foundConfig.callback) {
  callbackFunction = foundConfig.callback
}
if (!foundConfig) {
  // console.log('No markdown magic config set using {empty object}')
}
const configuration = foundConfig || {}

function parsePaths(path, defaultValue) {
  if (path) {
    filePaths = path
  }
}

function parseIgnorePaths(path, defaultValue) {
  if (path) {
    ignorePath = path.split(',').map((p) => {
      const fp = p.trim()
      if (fp.match(/\bnode_modules\b/)) {
        // exact node_module match. Ignore entire DIR
        return '!**/node_modules/**'
      }
      if (!fp.match(/^!/)) {
        return `!${fp}`
      }
      return fp
    })
  }
}

// process default
if (program.path) {
  filePaths = program.path
}

if (ignorePath) {
  // console.log('ignore path', ignorePath)
  filePaths = [filePaths].concat(ignorePath)
}

// console.log('filePaths', filePaths)
// console.log('configuration', configuration)
// console.log('callbackFunction', callbackFunction)
console.log('Starting markdown-magic', filePaths)
console.log(`config`, configuration)
markdownMagic(filePaths, configuration, callbackFunction)

function defaultCallback(err, msg) {
  if (err) {
    console.log('Error:', err)
  }
  if (msg) {
    console.log('Files processed. markdown-magic Finished! ⊂◉‿◉つ')
  }
}

function getConfigFilepath() {
  return program.config || findUp.sync(defaultConfigPath) || findUp.sync('md-magic.config.js')
}
