http = require 'http'
Static = require 'node-static'

class CWebServer
	constructor: (options) ->
		@fileServer = new Static.Server('.')

		@httpServer = http.createServer (req, res) =>
			@fileServer.serve req, res

		@httpServer.listen 3000

		console.log "WebServer.httpServer runnig at "+3000



module.exports = CWebServer