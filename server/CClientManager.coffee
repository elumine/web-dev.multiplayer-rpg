CClientObject = require './CClientObject'

class CClientManager
	constructor: (options) ->
		@ClientArray = []

	setClientArray: ->
		temp = @Server.Model.getClientList()
		for ClientFileName in temp
			@ClientArray[ClientFileName] = @Server.Model.getClient ClientFileName
			@ClientArray[ClientFileName].status = 'offlane'
			if @ClientArray[ClientFileName].ClientSocketID
				delete @ClientArray[ClientFileName].ClientSocketID
			if @ClientArray[ClientFileName].GameID
				delete @ClientArray[ClientFileName].GameID
			@updateModel @ClientArray[ClientFileName]
	
	getClientObjectBySocketID: (ClientSocketID) ->
		for key, value of @ClientArray
			if value.ClientSocketID is ClientSocketID
				return value

	updateModel: (ClientObject) ->
		@Server.Model.setClient ClientObject

	setRegistration: (ClientSocketID, message) ->
		if not @ClientArray[message.id]
			@ClientArray[message.id] = new CClientObject
				id: message.id
				password: message.password

			@updateModel @ClientArray[message.id]
			@Server.IO.send ClientSocketID, 
					header: 'setRegistration'
					result: true
					ClientObject: @ClientArray[message.id]
		else
			@Server.IO.send ClientSocketID, 
					header: 'setRegistration'
					result: false
					error: 'Client Exists'
		
			
	setOnline: (ClientSocketID, message) ->
		if @ClientArray[message.id]
			if @ClientArray[message.id].password is message.password
				@ClientArray[message.id].status = 'online'
				@ClientArray[message.id].ClientSocketID = ClientSocketID

				@updateModel @ClientArray[message.id]
				@Server.IO.send ClientSocketID, 
					header: 'setOnline'
					result: true
					ClientObject: @ClientArray[message.id]
			else
				@Server.IO.send ClientSocketID, 
					header: 'setOnline'
					result: false
					error: 'Password not match' 
		else
			@Server.IO.send ClientSocketID, 
				header: 'setOnline'
				result: false
				error: 'Client '+message.id+' is undefined'
			
	setOffline: (ClientSocketID) ->
		ClientObject = @getClientObjectBySocketID ClientSocketID
		if ClientObject.status is 'loadGame' or ClientObject.status is 'readyGame' or ClientObject.status is 'startGame'
			@Server.ClientManager.setLeaveGame ClientSocketID,
				ClientObject: ClientObject
			setTimeout =>
				@ClientArray[ClientObject.id].status = 'offlane'
				delete @ClientArray[ClientObject.id].ClientSocketID

				@updateModel @ClientArray[ClientObject.id]
				@Server.IO.send ClientSocketID, 
					header: 'setOffline'
					result: true
			, 100
		else
			@ClientArray[ClientObject.id].status = 'offlane'
			delete @ClientArray[ClientObject.id].ClientSocketID

			@updateModel @ClientArray[ClientObject.id]
			@Server.IO.send ClientSocketID, 
				header: 'setOffline'
				result: true

	setJoinGame: (ClientSocketID, message) ->
		ClientObject = @getClientObjectBySocketID ClientSocketID
		if @Server.GameManager.GameArray.length is 0
			@Server.GameManager.setGame()
			@setJoinGame ClientSocketID, message
		else
			for Game, i in @Server.GameManager.GameArray
				if Game.status is 'empty'
					@Server.GameManager.GameArray[Game.id].addCharacter ClientObject.id, message.modelID

					@ClientArray[ClientObject.id].status = 'joinGame'
					@ClientArray[ClientObject.id].GameID = Game.id

					@updateModel @ClientArray[ClientObject.id]

					@Server.IO.send ClientSocketID,
						header: 'setJoinGame'
						result: true
						GameObject:
							id: Game.id
						ClientObject: @ClientArray[ClientObject.id]
				else
					if i is @Server.GameManager.GameArray.length-1
						@Server.GameManager.setGame()
						@setJoinGame ClientSocketID, message
		
	setLoadGame: (ClientSocketID) ->
		ClientObject = @getClientObjectBySocketID ClientSocketID
		@ClientArray[ClientObject.id].status = 'loadGame'

		@updateModel @ClientArray[ClientObject.id]
		@Server.IO.send ClientSocketID,
			header: 'setLoadGame'
			result: true
			ClientObject: @ClientArray[ClientObject.id]

	setReadyGame: (ClientSocketID) ->
		ClientObject = @getClientObjectBySocketID ClientSocketID
		@ClientArray[ClientObject.id].status = 'readyGame'

		@updateModel @ClientArray[ClientObject.id]
		@Server.IO.send ClientSocketID,
			header: 'setReadyGame'
			result: true
			ClientObject: @ClientArray[ClientObject.id]

	setLeaveGame: (ClientSocketID) ->
		ClientObject = @getClientObjectBySocketID ClientSocketID
		if @Server.GameManager.GameArray[@ClientArray[ClientObject.id].GameID]
			@Server.GameManager.GameArray[@ClientArray[ClientObject.id].GameID].clientLeaveGame ClientObject
		delete @ClientArray[ClientObject.id].GameID

		@ClientArray[ClientObject.id].status = 'online'

		@updateModel @ClientArray[ClientObject.id]
		@Server.IO.send ClientSocketID,
			header: 'setLeaveGame'
			result: true
			ClientObject: @ClientArray[ClientObject.id]



module.exports = CClientManager