'use strict';
const express = require('express')
const UpholdService = require('./services/UpholdService')
const storage = require('./storage')

const app = express()
app.use('/', express.static('public'))

var tickers = []
UpholdService
	.start('https://api.uphold.com/v0/ticker/USD', 1000)
	.on('success', (data, timeLapsed) => {
		let time = Date.now()
		tickers = data
		tickers.map(t => t.time = time)
		storage
			.save(tickers)
			.then(() => storage.length())
			.then(count => {
				console.log(`Performance: (entries = ${count}) (request = ${timeLapsed/1000} secs) (disk = ${(Date.now() - time)/1000} secs)`)
			})
			.catch(err => console.log(err))
	})
	.on('fail', (error, timeLapsed) => {
		console.log(error)
	})

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
	let ticker = tickers
		.filter(t => t.pair === pair)
		.sort('time')
		.reverse()
	res.json(ticker[0])
})

app.get('/ticker/:pair/count', (req, res) => {
	const pair = req.params.pair.toUpperCase()
	storage
		.length()
		.then(count => res.json(count))
		.catch(err => res.status(500).json(err))
})

app.get('/ticker/:pair', (req, res) => {
	const pair = req.params.pair.toUpperCase()
	storage
		.findByPair('USDBRL')
		.then(tickers => res.json(tickers.sort('time')))
		.catch(err => res.status(500).json(err))
})

app.listen(3000, () => console.log('Server iniciado...'))
