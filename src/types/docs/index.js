'use strict'

const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const dimensionalScissors = require('./scissors')

const {
	docs2md,
	docs2html
} = require('./convert')

const { getAuth } = require('./auth')

const { google } = require('googleapis')

module.exports = async ({ credentials }) => {
	const auth = await getAuth (credentials)

	  const docs = google.docs({ version: 'v1', auth })

	return {
		async fetch (docId) {
		  	return await prom(cb => docs.documents.get({ documentId: MRKS_LOG }, cb))
		},

		utils: require('./utils'),
		convert: require('./convert'),
		slice: {
			dimensionalScissors
		}
	}
}