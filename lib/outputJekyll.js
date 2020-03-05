'use strict'

const yaml = require('js-yaml')
const rimraf = require('rimraf').sync
const mkdirp = require('mkdirp').sync

module.exports = (config, params) => {
  return (posts) => {
	  rimraf(OUT)
	  mkdirp(OUT)

	  posts.forEach(post => {
	    const out = [
	      '---',
	      yaml.safeDump(post.jekyllMeta),
	      '---',
	      post.html,
	      ''
	    ]

	    fs.writeFileSync(path.join(OUT, `${post.id}.html`), out.join('\n'))
	  })
  }
}
