'use strict'

module.exports = (config, { utils: { getContent, getLines } }) => {
	return (doc) => {
const paragraphs = doc.data.body.content

  const i = 0
  let paragraphMeta

  let isPost = false
  let postHasMeta = false
  let postHasTitle = false
  let ignoreEmpty = false
  let endTag = null
  let post = null

  let line
  for (let i = 0; (line = lines[i]); i++) {
    const text = line.content.trim().replace(/ /g, '').toLowerCase()

    // console.log(line)

    // console.log(require('util').inspect({isPost, postHasMeta, post, endTag, text, line}, {colors: true, depth: null}))

    if (ignoreEmpty) {
      if (text) {
        ignoreEmpty = false
      } else {
        continue
      }
    }

    if (text.startsWith(endTag)) {
      isPost = false
      posts.push(post)
      post = null
    }

    if (text.startsWith('//cut')) {
      isPost = true

      postHasMeta = false
      postHasTitle = false

      ignoreEmpty = true

      endTag = '//cut'

      post = {
        id: null,
        date: null,
        author: null,
        title: null,
        content: []
      }

      continue
    }

    if (isPost) {
      if (!postHasMeta) {
        const match = text.match(/^((20)?[0-9]{2})([0-9]{2})([0-9]{2})_(.+)$/)

        if (!match) {
          throw new Error(`Invalid meta title at ${line.start}`)
        }

        let [_, year, __, month, day, name] = match

        if (year.length !== 4) year = `20${year}`

        name = name.toLowerCase()

        post.date = { year, month, day }
        post.author = name

        postHasMeta = true
        ignoreEmpty = true

        continue
      }

      // TODO: should we split up things so hard?
      post.content = post.content.concat(dimensionalScissors(paragraphs, line.start, line.end))
      continue
    } else {
      continue
    }

    throw new Error('Not defined')
  }

  let lastDateSlug = null
  let lastId = 0

  posts.reverse().forEach(post => {
    // id

    const dateSlug = `${post.date.year}-${post.date.month}-${post.date.day}`

    if (dateSlug === lastDateSlug) {
      lastId++
    } else {
      lastId = 0
      lastDateSlug = dateSlug
    }

    post.id = `${dateSlug}-${lastId}`

    // generate html

    post.html = docs2html(post.content, {
      escape: false,
      applyFont: false
    })

    // generate meta

    if (!post.title) {
      post.title = `Logbuch Nummer ${lastId + 1} vom ${post.date.day}.${post.date.month}.${post.date.year}`
    }

    post.jekyllMeta = {
      layout: 'post'
    }

    if (post.author) {
      post.jekyllMeta.author = post.author
    }

    if (post.title) {
      post.jekyllMeta.title = post.title
    }

    // ...

    const rawContent = getContent(post.content)
  })

}
}