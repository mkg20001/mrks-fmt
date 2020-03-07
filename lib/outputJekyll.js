'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')
const rimraf = require('rimraf').sync
const mkdirp = require('mkdirp').sync

const prepare = (folder) => {
  rimraf(folder)
  mkdirp(folder)
}

module.exports = ({ output }, params) => {
  return ({ posts, pages, files }) => {
  	  const outPosts = path.join(output, '_posts')

  	  prepare(outPosts)

	  posts.forEach(post => {
	    const out = [
	      '---',
	      yaml.safeDump(post.jekyllMeta),
	      '---',
	      post.html,
	      ''
	    ]

	    fs.writeFileSync(path.join(outPosts, `${post.id}.html`), out.join('\n'))
	  })

	  // TODO: support multiple formats for pages

	  pages.forEach(page => {
	    const out = [
	      '---',
	      yaml.safeDump(page.jekyllMeta),
	      '---',
	      page.html,
	      ''
	    ]

	    // TODO: add
	    // fs.writeFileSync(path.join(output, `${page.id}.html`), out.join('\n'))
	  })

	  fs.writeFileSync(path.join(output, 'posts.json'), JSON.stringify(posts, null, 2))
  }
}
