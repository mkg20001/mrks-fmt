'use strict'

const assert = require('assert').strict

const isBetween = (x, a, b) => x >= a && x <= b

const isOverlappingRange = ({ startIndex, endIndex }, rangeStart, rangeEnd) => {
	return isBetween(startIndex + 1, rangeStart, rangeEnd) || isBetween(endIndex - 1, rangeStart, rangeEnd) || (startIndex < rangeStart && endIndex > rangeEnd)
}

function dimensionalScissors (paragraphs, rangeStart, rangeEnd) {
  const matchingParagraphs = paragraphs.filter(p => isOverlappingRange(p, rangeStart, rangeEnd))
  
  return matchingParagraphs.filter(p => p.paragraph && p.paragraph.elements).map((p) => {
  	let paragraph = p.paragraph = Object.assign({}, p.paragraph)

  	paragraph.elements.filter(el => isOverlappingRange(el, rangeStart, rangeEnd)).map(el => {
  		el = Object.assign({}, el)
  		el.textRun = Object.assign({}, el.textRun)

  		if (!el.textRun || !el.textRun.content) return el
  		if (el.endIndex > rangeEnd) { // end at actual rangeEnd
	  		el.textRun.content = el.textRun.content.substr(0, el.textRun.content.length - (el.endIndex - rangeEnd))
  		}

  		if (el.startIndex < rangeStart) { // start at actual rangeStart
  			el.textRun.content = el.textRun.content.substr(rangeStart - el.startIndex)
  		}

  		return el
  	})

  	return p
  })
}

const t = (startIndex, endIndex, ex) => {
	assert(isOverlappingRange({ startIndex, endIndex }, 60, 70) === ex)
}

t(50, 67, true)
t(67, 80, true)
t(50, 60, false)
t(60, 65, true)
t(65, 70, true)
t(70, 80, false)
t(50, 80, true)
t(60, 80, true)
t(50, 70, true)
t(60, 70, true)

module.exports = dimensionalScissors