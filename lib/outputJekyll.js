'use strict'

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
