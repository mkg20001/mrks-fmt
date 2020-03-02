'use strict'

const assert = require('assert').strict

const isBetween = (x, a, b) => x >= a && x <= b

const isOverlappingRange = ({ startIndex, endIndex }, rangeStart, rangeEnd) => {
	return isBetween(startIndex + 1, rangeStart, rangeEnd) || isBetween(endIndex - 1, rangeStart, rangeEnd) || (startIndex < rangeStart && endIndex > rangeEnd)
}

function dimensionalScissors (paragraphs, rangeStart, rangeEnd) {
  const matchingParagraphs = paragraphs.filter(p => {
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