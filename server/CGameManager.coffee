CGameObject = require './CGameObject'

class CGameManager
	constructor: (options) ->
		@GameArray = []

	setGame: ->
		@GameArray.push new CGameObject
			id: @GameArray.length
			GameManager: @
	removeGame: (GameObject) ->
		@GameArray[GameObject.id] = false

	inputController: (ClientSocketID, message) ->
		ClientObject = @Server.ClientManager.getClientObjectBySocketID ClientSocketID
		if @GameArray[ClientObject.GameID]
			if @GameArray[ClientObject.GameID].status is 'start'
				@GameArray[ClientObject.GameID].clientEventHandler ClientObject, message.event



module.exports = CGameManager