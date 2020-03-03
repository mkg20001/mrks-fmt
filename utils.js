'use strict'

const replaceNewLineChars = (someString, replacementString = '') => { // defaults to just removing
  const LF = '\u{000a}' // Line Feed (\n)
  const VT = '\u{000b}' // Vertical Tab
  const FF = '\u{000c}' // Form Feed
  const CR = '\u{000d}' // Carriage Return (\r)
  const CRLF = `${CR}${LF}` // (\r\n)
  const NEL = '\u{0085}' // Next Line
  const LS = '\u{2028}' // Line Separator
  const PS = '\u{2029}' // Paragraph Separator
  const lineTerminators = [LF, VT, FF, CR, CRLF, NEL, LS, PS] // all Unicode `lineTerminators`
  let finalString = someString.normalize('NFD') // better safe than sorry? Or is it?
  for (const lineTerminator of lineTerminators) {
    if (finalString.includes(lineTerminator)) { // check if the string contains the current `lineTerminator`
      const regex = new RegExp(lineTerminator.normalize('NFD'), 'gu') // create the `regex` for the current `lineTerminator`
      finalString = finalString.replace(regex, replacementString) // perform the replacement
    }
  }
  return finalString.normalize('NFC') // return the `finalString` (without any Unicode `lineTerminators`)
}

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

// TODO: escaping

function El (tag) {
  let content = []

  const self = {
    tag,
    attrs: {},
    content
  }

  return {
    el (tag) {
      const el = El(tag)
      content.push(el)

      return el
    },
    attr (k, v) {
      self.attrs[k] = v
    },
    push: content.push.bind(content),
    concat (...a) {
      self.content = content = content.concat(...a)
    },
    toString () {
      // TODO: escape attrs
      const attrs = Object.keys(self.attrs).map(attr => `${attr}="${attrs[attr]}"`).join(' ')
      const rawContent = self.content.map(String)
      const out = `<${self.tag} ${attrs}>${rawContent}</${self.tag}>`

      return out
    },
    self
  }
}

function styleToStr (style) {
  return Object.keys(style).filter(key => `${key}: ${style[key]};`).join(' ')
}

function docs2html (paragraphs, { escapeHTML = true, applyFont = true } = {}) {
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

            t.push(replaceNewLineChars(escapeHTML ? escape(el.textRun.content) : el.textRun.content, '<br>'))

            const styles = {}
            const style = el.textRun.textStyle

            if (style.weightedFontFamily && applyFont) {
              styles['font-family'] = style.weightedFontFamily.fontFamily
              styles['font-weight'] = style.weightedFontFamily.weight
            }

            if (style.bold) {
              styles['font-weight'] = 'bold' // TODO: does this break the weight set by docs?
            }

            t.attrs('css', styleToStr(styles))
          }

          return t
        })).filter(Boolean)
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

        t.attrs('css', styleToStr(pStyles))
      }
    }
  }))

  return String(t)
}

module.exports = {
  getContent,
  docs2html
}
