'use strict'

const types = require('./types')

const fs = require('fs')

const p = (p) => fs.realpathSync(p)

async function main (configPath, srcType, src, parserPath, processorPath) {
	const config = require(p(configPath))

	const type = await types[srcType](config.source)

	const params = {
		type
	}

	const parser = require(p(parserPath))(config.parser, params)
	const processor = require(p(processorPath))(config.processor, params)
	
	const content = await type.fetch(src)

	const parsed = await parser(content)

	await processor(parsed)
}