'use strict'

const path = require('path')

module.exports = {
  source: {
    credentials: require('./credentials.json')
  },
  parser: {

  },
  processor: {
    outputPosts: path.join(__dirname, 'blog', '_posts')
  }
}
