'use strict'
const low = require('lowdb')
const storage = require('lowdb/file-async')

const tickersName = 'tickers.'

const db = low('data.json', { storage })

function getPair(pair) {
	return db(tickersName + pair.toUpperCase())
}

function parseTicker(upholdTicker, time) {
	return {
		time,
		price: upholdTicker.ask
	}
}

module.exports = { getPair, parseTicker }
