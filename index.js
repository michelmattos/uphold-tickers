'use strict';
const express = require('express')
const low = require('lowdb')
const storage = require('lowdb/file-async')
const request = require('request')

const app = express()
const db = low('db.json', { storage })
const tickers = db('tickers')

function findPair(pair, tickers) {
	return tickers.find(t => t.pair === pair)
}

function parseTicker(ticker, time) {
	return {
		pair: ticker.pair,
		price: ticker.ask,
		time: time
	}
}

const timer = setInterval(
	() => {
		let time = Date.now()
		request('https://api.uphold.com/v0/ticker/USD', (err, res, body) => {
			if (!err && res.statusCode == 200) {
				let t = JSON.parse(body)
				let USDBRL = findPair('USDBRL', t)
				let BTCUSD = findPair('BTCUSD', t)
				let NZDUSD = findPair('NZDUSD', t)
				tickers.push(parseTicker(USDBRL, time))
				tickers.push(parseTicker(BTCUSD, time))
				tickers.push(parseTicker(NZDUSD, time))
			}	
		})	
	},
	1000
)

app.get('/', (req, res) => {
	res.json(
		tickers
			.chain()
			.filter({ pair: 'USDBRL' })
			.sortBy('time')
			.value()
	)
})

app.listen(3000, () => console.log('Server iniciado...'))
