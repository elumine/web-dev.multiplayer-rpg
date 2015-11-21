fs = require 'fs'

class CModel
	constructor: (options) ->
		# ...

	setClient: (ClientObject) ->
		fs.writeFile "model/client/"+ClientObject.id, JSON.stringify ClientObject
		
	getClient: (ClientFileName) ->
		if JSON.parse fs.readFileSync "model/client/"+ClientFileName
			return JSON.parse fs.readFileSync "model/client/"+ClientFileName

	getClientList: () ->
		return fs.readdirSync 'model/client'



module.exports = CModel