const fs = require('fs')

const ReactCompilerConfig = {
  sources: (filename) => {
    const isInNodeModules = filename.includes('node_modules')
    if (
      isInNodeModules ||
      (!filename.endsWith('.tsx') && !filename.endsWith('.jsx') && !filename.endsWith('.js'))
    ) {
      return false
    }

    const file = fs.readFileSync(filename, 'utf8')
    if (file.includes("'use client'")) {
      return true
    }
    console.log('React compiler - skipping file: ' + filename)
    return false
  },
}

module.exports = function (api) {
  api.cache(false)

  return {
    plugins: [
      ['babel-plugin-react-compiler', ReactCompilerConfig], // must run first!
    ],
  }
}
