'use strict'

const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const dimensionalScissors = require('./scissors')

const { getAuth } = require('./auth')

const { google } = require('googleapis')

module.exports = async ({ credentials }) => {
  const auth = await getAuth(credentials)

	  const docs = google.docs({ version: 'v1', auth })

  return {
    fetch (docId) {
		  	return prom(cb => docs.documents.get({ documentId: docId }, cb))
    },

    utils: require('./utils'),
    convert: require('./convert'),
    slice: {
      dimensionalScissors
    }
  }
}
