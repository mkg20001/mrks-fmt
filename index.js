'use strict'

const Auth = require('./auth')

const { google } = require('googleapis')

const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const MRKS_LOG = "1uo11f5AARy5bIthEGgwIlaVfkB6mSxrlj-S1A9DrHNA"

async function printDocTitle(auth) {
  const docs = google.docs({version: 'v1', auth})

  const doc = await prom(cb => docs.documents.get({ documentId: MRKS_LOG }, cb))

  console.log(doc.data.title)

  console.log(require('util').inspect(doc, {colors: true, depth: null}))

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

  for (let i = 0; (paragraphMeta = paragraphs[i]); i++) {
    const paragraph = paragraphMeta.paragraph

    if (!paragraph || !paragraph.elements) {
      continue
    }

    const pText = paragraph.elements.filter(element => element.textRun && element.textRun.content).reduce((result, element) => result + element.textRun.content, '').trim().replace(/ /g, '').toLowerCase()

    console.log(require('util').inspect({isPost, postHasMeta, post, endTag, pText, paragraph}, {colors: true, depth: null}))

    if (ignoreEmpty) {
      if (pText) {
        ignoreEmpty = false
      } else {
        continue
      }
    }

    if (pText.startsWith(endTag)) {
      isPost = false
      posts.push(post)
      post = null
    }

    if (pText.startsWith('//cut')) {
      isPost = true

      postHasMeta = false
      postHasTitle = false

      ignoreEmpty = true

      endTag = '//cut'

      post = {
        date: null,
        author: null,
        title: null,
        content: []
      }

      continue
    }

    if (isPost) {
      if (!postHasMeta) {
        const match = pText.match(/^(20[0-9]{2})([0-9]{2})([0-9]{2})_(.+)$/)

        if (!match) {
          throw new Error(`Invalid meta title at ${paragraph.startIndex}`)
        }

        let [_, year, month, day, name] = match

        name = name.toLowerCase()

        postHasMeta = true
        ignoreEmpty = true

        continue
      }

      post.content.push(paragraphMeta)
      continue

      /* if (!postHasTitle) {


        postHasTitle = true
        ignoreEmpty = true

        continue
      } */
    } else {
      continue
    }

    throw new Error('Not defined')
  }

  console.log(require('util').inspect(posts, {colors: true, depth: null}))

}

async function main() {
  const auth = await Auth.getAuth(require('./credentials.json'))

  await printDocTitle(auth)
}

main().then(console.log, console.error)