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
  let paragraph

  let isPost = false
  let postHasTitle = false
  let ignoreEmpty = false
  let endTag = null
  let post = null

  for (let i = 0; (paragraph = paragraphs[i]); i++) {
    console.log(require('util').inspect(paragraph, {colors: true, depth: null}))

    if (!paragraph.elements) {
      continue
    }

    const pText = paragraph.elements.reduce((element, result) => result + element.textRun.content, '').trim().replace(/ /g, '').toLowerCase()

    if (ignoreEmpty) {
      if (pText) {
        ignoreEmpty = false
      } else {
        continue
      }
    }

    if (!isPost) {
      if (pText.startsWith('//cut')) {
        isPost = true
        postHasTitle = false
        endTag = '//cut'
        post = {}
      }
    } else if (isPost) {
      if (!postHasTitle) {
        if (!pText) {
          continue
        }

        let [_, year, month, day, name] = pText.match(/^(20[0-9]{2})([0-9]{2})([0-9]{2})_(.+)/)

        name = name.toLowerCase()
      }

    } 
  }
}

async function main() {
  const auth = await Auth.getAuth(require('./credentials.json'))

  await printDocTitle(auth)
}

main().then(console.log, console.error)