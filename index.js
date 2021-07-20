const globby = require('globby')
const processFile = require('./lib/processFile')
/**
 * ### API
 * ```js
 * markdownMagic(filePath, config, callback)
 * ```
 * - `filePaths` - *String or Array* - Path or glob pattern. Uses [globby patterns](https://github.com/sindresorhus/multimatch/blob/master/test.js)
 * - `config` - See configuration options below
 * - `callback` - callback to run after markdown updates
 *
 * @param  {string} filePath - Path to markdown file
 * @param  {object} [config] - configuration object
 * @param  {Function} [callback] - callback function with updated contents
 */
module.exports = async function markdownMagic(filePaths, config, callback) {
  const configuration = config || {}
  let globbyOptions = {}
  if(config && config.globbyOptions) {
    globbyOptions = Object.assign({}, config.globbyOptions);
  }
  const files = globby.sync(filePaths, globbyOptions);
  if (!callback && typeof configuration === 'function') {
    callback = configuration // eslint-disable-line
  } else if (typeof config === 'object' && config.callback) {
    // set callback in config for CLI usage
    callback = config.callback // eslint-disable-line
  }
  if (!files.length) {
    callback && callback('No files matched')
    console.log('No files matched pattern', filePaths)
    return false
  }
  configuration.originalFilePaths = files

  const data = files.map(async (file) => {
    const x = await processFile(file, configuration)
    return x
  })

  const values = await Promise.all(data)

  if (callback) {
    callback(null, values)
  }
  return values
}

// expose globby for use in plugins
module.exports.globby = globby
