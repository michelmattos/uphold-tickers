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
				tickers = JSON.parse(body)
			}	
		})	
	},
	1000
)

app.get('/ticker/:pair/latest', (req, res) => {
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

app.listen(3000, () => console.log('Server iniciado...'))
