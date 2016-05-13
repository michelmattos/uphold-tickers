'use strict'
const Datastore = require('nedb')
const tickers = new Datastore({
	filename: 'tickers.db',
	autoload: true
})

function find(query) {
	return new Promise((resolve, reject) => {
		tickers.find(query, (err, docs) => {
			if (err) reject(err)
			resolve(docs)
		})
	})
}

function findByPair(pair) {
	return find({ pair: pair.toUpperCase() })
}

function parseTicker(upholdTicker, time) {
	return {
		time,
		price: upholdTicker.ask
	}
}

function save(ticker) {
	return new Promise((resolve, reject) => {
		tickers.insert(ticker, (err) => {
			if (err) reject(err)
			resolve()
		})
	})
}

function length() {
	return new Promise((resolve, reject) => {
		tickers.count({}, (err, count) => {
			if (err) reject(err)
			resolve(count)
		})
	})
}

module.exports = { find, findByPair, parseTicker, save, length }
