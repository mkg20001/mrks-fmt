'use strict'

function getContent (paragraphs) {
  return paragraphs
    .filter(m => m.paragraph && m.paragraph.elements)
    .reduce((res, m) =>
      res + m.paragraph.elements
        .filter(el => el.textRun && el.textRun.content)
        .reduce((res, el) => res + el.textRun.content, '')
    , '')
    .replace(/\u000b/gmi, '\n')
}

function getLines (paragraphs) {
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

  return lines
}

module.exports = {
  getContent,
  getLines
}
