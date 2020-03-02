'use strict'

const Auth = require('./auth')
const fs = require('fs')

const { google } = require('googleapis')

const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const MRKS_LOG = "1uo11f5AARy5bIthEGgwIlaVfkB6mSxrlj-S1A9DrHNA"

const dimensionalScissors = require('./scissors')

function getContent (paragraphs) {
  return paragraphs
    .filter(m => m.paragraph && m.paragraph.elements)
    .reduce((res, m) =>
      res + m.paragraph.elements
        .filter(el => el.textRun && el.textRun.content)
        .reduce((res, el) => res + el.textRun.content, '')
    , '')
    .replace(/\u000b/g, '\n')
}

async function printDocTitle(auth) {
  const docs = google.docs({version: 'v1', auth})

  const doc = await prom(cb => docs.documents.get({ documentId: MRKS_LOG }, cb))

  console.log(doc.data.title)

  // console.log(require('util').inspect(doc, {colors: true, depth: null}))

  const paragraphs = doc.data.body.content

  let i = 0
  let paragraphMeta

  let isPost = false
  let postHasMeta = false
  let postHasTitle = false
  let ignoreEmpty = false
  let endTag = null
  let post = null

  let posts = []

  let chars = getContent(paragraphs)

  let curChar = 1

  let content = ''
  let lineStart = 1
  let lineEnd = 0

  let lines = []

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

    console.log(line)

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

        let [_, year, month, day, name] = match

        if (year.length !== 4) year = `20${year}`

        name = name.toLowerCase()

        post.date = { year, month, day }
        post.author = name

        postHasMeta = true
        ignoreEmpty = true

        continue
      }

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
    const rawContent = getContent(post.content)

    let id = 0

    let dateSlug = `${post.date.year}_${post.date.month}_${post.date.day}`

    if (dateSlug === lastDateSlug) {
      id++
    } else {
      id = 0
    }

    post.id = `${dateSlug}_${id}`
  })

  console.log(require('util').inspect(posts, {colors: true, depth: null}))

  fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2))

  posts.forEach(post => {
    fs.writeFileSync(`./posts/${post.id}`, JSON.stringify(post, null, 2))
  })
}

async function main() {
  const auth = await Auth.getAuth(require('./credentials.json'))

  await printDocTitle(auth)
}

main().then(console.log, console.error)