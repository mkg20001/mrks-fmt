'use strict'

const n = Buffer.from('00', 'hex').toString('utf8')

function IDXM () { // InDeX correction Machine
  let cur = 0

  return {
    start: i => {
      const out = n.repeat(i - cur)
      cur = i
      return out
    },
    end: i => {
      if (i < cur) throw new Error('IDXM: backwards')
      cur = i
    }
  }
}

function readStructuralElements (elements, idx) {
  let text = ''

  elements.forEach(element => {
    if (element.paragraph) {
      element.paragraph.elements.forEach(el => {
        if (el.textRun) {
          text += idx.start(el.startIndex)
          text += el.textRun.content
          idx.end(el.endIndex)
        }
      })
    } else if (element.table) {
      element.table.tableRows.forEach(row => {
        row.tableCells.forEach(cell => {
          text += readStructuralElements(cell.content, idx)
        })
      })
    } else if (element.tableOfContents) {
      text += readStructuralElements(element.tableOfContents.content, idx)
    }
  })

  return text
}

function getContent (el) {
  return readStructuralElements(el, IDXM())
    .replace(/\u0000/gmi, '\n')
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
