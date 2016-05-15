const request = require('request')
const EventEmitter = require('events')

function start (url, milliseconds) {
    let emitter = new EventEmitter()
    _initTimer(url, emitter, milliseconds)
    return emitter
}

function _initTimer (url, emitter, milliseconds) {
    return setInterval(
        () => _requestUphold(url, emitter),
        milliseconds
    )
}

function _requestUphold (url, emitter) {
    let startTime = Date.now()
    
    request(
        {
            url: 'https://api.uphold.com/v0/ticker/USD',
            json: true
        },
        (error, response, body) => {
            let timeLapsed = Date.now() - startTime
            
            if (error)
                emitter.emit('error', error)
            else if (response.statusCode !== 200)
                emitter.emit('fail', `Request failed with HTTP Status ${response.statusCode}.`, timeLapsed)
            else if (response.statusCode == 200)
                emitter.emit('success', body, timeLapsed)
        }
    )
}

module.exports = { start }