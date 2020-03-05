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

// TODO: escaping

function El (tag) {
  const _el = {
    tag,
    attrs: {},
    content: []
  }

  return {
    el (tag) {
      const el = El(tag)
      _el.content.push(el)

      return el
    },
    attr (k, v) {
      _el.attrs[k] = v
    },
    push (...a)  {
      _el.content.push(...a)
    },
    concat (...a) {
      _el.content = _el.content.concat(...a)
    },
    toString () {
      // TODO: escape attrs
      const attrs = Object.keys(_el.attrs).map(attr => `${attr}="${_el.attrs[attr]}"`).join(' ')
      const rawContent = _el.content.map(String).join('')
      const out = `<${_el.tag} ${attrs}>${rawContent}</${_el.tag}>`

      return out
    },
    _el
  }
}

function styleToStr (style) {
  return Object.keys(style).filter(key => `${key}: ${style[key]};`).join(' ')
}

module.exports = {
	replaceNewLineChars,
  El,
  styleToStr
}