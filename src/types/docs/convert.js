'use strict'

const {
  El,
  styleToStr,
  replaceNewLineChars
} = require('../../utils')

const escapeHTML = (d) => d // TODO: add

function docs2html (paragraphs, { escape = true, applyFont = true } = {}) {
  const t = El('div')

  t.concat(paragraphs.map(m => {
    const t = El('span')

    if (m.sectionBreak) {
      /*
          "sectionBreak": {
            "sectionStyle": {
              "columnSeparatorStyle": "NONE",
              "contentDirection": "LEFT_TO_RIGHT",
              "sectionType": "CONTINUOUS"
            }
      }	*/
    }

    if (m.paragraph) {
      if (m.paragraph.elements) {
        t.concat(m.paragraph.elements.map(el => {
          let t

          if (el.textRun) {
            t = El('span')

            if (el.textRun.content) {
              t.push(replaceNewLineChars(escape ? escapeHTML(el.textRun.content) : el.textRun.content, '<br>'))
            }

            const styles = {}
            const style = el.textRun.textStyle || {}

            if (style.weightedFontFamily && applyFont) {
              styles['font-family'] = style.weightedFontFamily.fontFamily
              styles['font-weight'] = style.weightedFontFamily.weight
            }

            if (style.fontSize && applyFont) {
              styles['font-size'] = `${style.fontSize.magnitude}${style.fontSize.unit.toLowerCase()}`
            }

            if (style.bold) {
              styles['font-weight'] = 'bold' // TODO: does this break the weight set by docs?
            }

            if (style.link) {
              t._el.tag = 'a'
              t.attr('href', style.link.url)
            }

            t.attr('style', styleToStr(styles))
          }

          return t
        }).filter(Boolean))
      }

      if (m.paragraph.paragraphStyle) {
        const pStyles = {}
        const pStyle = m.paragraph.paragraphStyle

        if (pStyle.namedStyleType) {

        }

        if (pStyle.alignment) {

        }

        if (pStyle.direction) {

        }

        t.attr('style', styleToStr(pStyles))
      }
    }

    return t
  }))

  return String(t)
}

module.exports = {
  docs2html
}
