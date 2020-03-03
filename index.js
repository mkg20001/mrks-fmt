'use strict'

const Auth = require('./auth')
const fs = require('fs')

const { google } = require('googleapis')

const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const MRKS_LOG = '1uo11f5AARy5bIthEGgwIlaVfkB6mSxrlj-S1A9DrHNA'

const dimensionalScissors = require('./scissors')
const { getContent } = require('./utils')

async function processDoc (auth) {
  const docs = google.docs({ version: 'v1', auth })

  const doc = await prom(cb => docs.documents.get({ documentId: MRKS_LOG }, cb))

  console.log(doc.data.title)

  console.log(require('util').inspect(doc, {colors: true, depth: null}))
  fs.writeFileSync('./docs.json', JSON.stringify(doc))  

  const paragraphs = doc.data.body.content

  const i = 0
  let paragraphMeta

  let isPost = false
  let postHasMeta = false
  let postHasTitle = false
  let ignoreEmpty = false
  let endTag = null
  let post = null

  const posts = []

  const chars = getContent(paragraphs)

  let curChar = 1

  let content = ''
  let lineStart = 1
  let lineEnd = 0

  const lines = []

  let char

  for (let i = 0; (char = chars[i]); i++) {
    curChar++

    if (char === '\n') {
      lineEnd = curChar
      lines.push({ content, start: lineStart, end: lineEnd })

      content = ''
      lineStart = curChar
    } else {
      content += char
    }
  }

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
      post.content.push(dimensionalScissors(paragraphs, line.start, line.end))
      continue
    } else {
      continue
    }

    throw new Error('Not defined')
  }

  let lastDateSlug = null
  let lastId = 0

  posts.reverse().forEach(post => {
    // generate html



    // ...

    const rawContent = getContent(post.content)

    // id

    const dateSlug = `${post.date.year}_${post.date.month}_${post.date.day}`

    if (dateSlug === lastDateSlug) {
      lastId++
    } else {
      lastId = 0
      lastDateSlug = dateSlug
    }

    post.id = `${dateSlug}_${lastId}`
  })

  // console.log(require('util').inspect(posts, { colors: true, depth: null }))

  fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2))

  posts.forEach(post => {
    fs.writeFileSync(`./posts/${post.id}`, JSON.stringify(post, null, 2))
  })

  // console.log(lines)
}

async function main () {
  const auth = await Auth.getAuth(require('./credentials.json'))

  await processDoc(auth)
}

main().then(console.log, console.error)
