'use strict'

const path = require('path')

module.exports = {
  source: {
    credentials: require('./credentials.json')
  },
  parser: {

  },
  processor: {
    output: path.join(__dirname, 'blog')
  }
}
