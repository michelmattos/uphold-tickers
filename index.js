'use strict';
const express = require('express')
const request = require('request')
const storage = require('./storage')

const app = express()
app.use('/', express.static('public'))

var tickers = []
const timer = setInterval(
	() => {
		let time = Date.now()
		request('https://api.uphold.com/v0/ticker/USD', (err, res, body) => {
			if (!err && res.statusCode == 200) {
				let requestTime = Date.now()
				tickers = JSON.parse(body)
				for (let ticker of tickers)
					storage
						.getPair(ticker.pair)
						.push(storage.parseTicker(ticker, time))
				
				let entries = storage.getPair('USDBRL').size()
				console.log(`Performance: (USDBRL entries = ${entries}) (request = ${(requestTime - time) / 1000} secs) (disk = ${(Date.now() - requestTime)/1000} secs)`)
			}
			else if (err)
				console.log(err)
		})	
	},
	1000
)

app.get('/ticker/:pair/stream', (req, res) => {
	const pair = req.params.pair.toUpperCase()
	const id = Date.now();
	
	res.set({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	})
	
	setInterval(
		() => {
			let ticker = tickers
				.find(t => t.pair === pair)
			let price = ticker ? ticker.ask : 'no data'
			res.write('id: ' + id + '\n')
			res.write('data: ' + price + '\n\n')
		},
		1000
	)
})

app.get('/ticker/:pair/latest', (req, res) => {
	const pair = req.params.pair.toUpperCase()
	let ticker = storage.getPair(pair)
	res.json(ticker.last())
})

app.get('/ticker/:pair/count', (req, res) => {
	const pair = req.params.pair.toUpperCase()
	let ticker = storage.getPair(pair)
	res.json(ticker.size())
	//res.end(Object.getOwnPropertyNames(ticker).sort().join('\n'))
})

app.get('/ticker/:pair', (req, res) => {
	const pair = req.params.pair.toUpperCase()
	let ticker = storage.getPair(pair)
	res.json(ticker)
})

app.listen(3000, () => console.log('Server iniciado...'))
