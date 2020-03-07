'use strict'

const lib = {
  parseKVMeta: (line, obj) => {
    const match = line.content.match(/^ *%([a-z0-9]+): *(.+)$/)

    if (!match) {
      throw new Error('Invalid meta sequence at ' + line.start)
    }

    const [_, key, value] = match
    obj.metaKV[key] = value
  },
  normalize: (str) => str.trim().replace(/ /g, '').toLowerCase()
}

module.exports = (config, { type: { utils: { getContent, getLines }, convert: { docs2html }, slice: { dimensionalScissors } } }) => {
  return (doc) => {
    const paragraphs = doc.data.body.content

    const lines = getLines(paragraphs)

    const posts = []
    let post = null
    let isPost = false
    let postHasMeta = false

    const pages = []
    let page = null
    let isPage = false

    const files = []
    let file = null
    let isFile = false

    let ignoreEmpty = false

    const endTag = () => {
      if (isPost) {
        isPost = false
        posts.push(post)
        post = null
      }

      if (isPage) {
        isPage = false
        pages.push(page)
        page = null
      }

      if (isFile) {
        isFile = false
        files.push(file)
        file = null
      }
    }

    let line
    for (let i = 0; (line = lines[i]); i++) {
      const text = lib.normalize(line.content)

      console.log(line.content)

      if (ignoreEmpty) {
        if (text) {
          ignoreEmpty = false
        } else {
          continue
        }
      }

      if (text.startsWith('//cut')) {
        endTag()

        continue
      }

      if (text.startsWith('//post')) {
        endTag()

        isPost = true

        postHasMeta = false

        ignoreEmpty = true

        post = {
          id: null,
          date: null,
          author: null,
          title: null,
          content: [],
          metaKV: {}
        }

        continue
      }

      if (text.startsWith('//page')) {
        endTag()

        const match = text.match(/^ *\/ *\/ *p *a *g *e *: *(.+)$/)

        if (!match) {
          throw new Error('Invalid page header at ' + line.start)
        }

        const [_, id] = match

        isPage = true

        ignoreEmpty = true

        page = {
          id,
          content: [],
          metaKV: {}
        }

        continue
      }

      if (text.startsWith('//file')) {
        endTag()

        const match = text.match(/^ *\/ *\/ *f *i *l *e *: *(.+)$/)

        if (!match) {
          throw new Error('Invalid file header at ' + line.start)
        }

        const [_, path] = match

        isFile = true

        ignoreEmpty = true

        file = {
          path,
          content: []
        }

        continue
      }

      if (isPost) {
        if (!postHasMeta) {
          ignoreEmpty = true // keep flag

          if (text.startsWith('%')) {
            lib.parseKVMeta(line, post)
            continue
          }

          if (text.startsWith('#')) {
            const [_, title] = line.content.match(/ *# *([.+])/)
            post.title = title
            continue
          }

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

          continue
        }

        post.content = post.content.concat(dimensionalScissors(paragraphs, line.start, line.end))
        continue
      } else if (isPage) {
        if (text.startsWith('%')) {
          lib.parseKVMeta(line, page)
          ignoreEmpty = true
          continue
        }

        page.content = page.content.concat(dimensionalScissors(paragraphs, line.start, line.end))
        continue
      } else if (isFile) {
        file.content.push(line.content) // just use raw content
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

      post.id = post.metaKV.id || `${dateSlug}-${lastId}`

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

      // apply jekyll meta

      if (post.author) {
        post.jekyllMeta.author = post.author
      }

      if (post.title) {
        post.jekyllMeta.title = post.title
      }

      // apply custom meta

      for (const key in post.metaKV) { // do this last so user can overwrite everything
        post.jekyllMeta[key] = post.metaKV[key]
      }

      // ...

      const rawContent = getContent(post.content)
    })

    pages.forEach(page => {
      // generate html

      page.html = docs2html(page.content, {
        escape: false,
        applyFont: false
      })

      // generate meta

      page.jekyllMeta = {}

      // apply custom meta

      for (const key in page.metaKV) { // do this last so user can overwrite everything
        page.jekyllMeta[key] = page.metaKV[key]
      }
    })

    return {
      posts,
      pages,
      files
    }
  }
}
