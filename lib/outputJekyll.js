'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')
const rimraf = require('rimraf').sync
const mkdirp = require('mkdirp').sync

module.exports = ({ output }, params) => {
  return (posts) => {
	  rimraf(output)
	  mkdirp(output)

	  posts.forEach(post => {
	    const out = [
	      '---',
	      yaml.safeDump(post.jekyllMeta),
	      '---',
	      post.html,
	      ''
	    ]

	    fs.writeFileSync(path.join(output, `${post.id}.html`), out.join('\n'))
	  })
  }
}
