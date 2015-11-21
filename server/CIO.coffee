WebSocketServer = new require 'ws'

class CIO
	constructor: (options) ->
		@ClientArray = []
		@socketServer = new WebSocketServer.Server
			port: 5000

		console.log "IO.socketServer runnig at "+5000

		@socketServer.on 'connection', (socket) =>
			ClientSocketID = @ClientArray.length
			@ClientArray[ClientSocketID] = socket
			console.log 'Client connection', ClientSocketID

			socket.on 'message', (message) =>
				@recive ClientSocketID, JSON.parse message
				
			socket.on 'close', =>
				ClientObject = @Server.ClientManager.getClientObjectBySocketID ClientSocketID
				console.log 'Client disconnection', ClientSocketID
				#if logged client - offlane
				if ClientObject
					@Server.ClientManager.setOffline ClientSocketID,
						ClientObject: ClientObject
				#if not logged client
				else
					delete @ClientArray[ClientSocketID]

	send: (ClientSocketID, message) ->
		if @ClientArray[ClientSocketID].readyState is 1
			@ClientArray[ClientSocketID].send JSON.stringify message

	recive: (ClientSocketID, message) ->
		#console.log 'Client ', ClientSocketID, 'message', message
		switch message.header
			when 'setRegistration'
				@Server.ClientManager.setRegistration ClientSocketID, message
			when 'setOnline'
				@Server.ClientManager.setOnline ClientSocketID, message
			when 'setOffline'
				@Server.ClientManager.setOffline ClientSocketID, message
			when 'setJoinGame'
				@Server.ClientManager.setJoinGame ClientSocketID, message
			when 'setLoadGame'
				@Server.ClientManager.setLoadGame ClientSocketID, message
			when 'setReadyGame'
				@Server.ClientManager.setReadyGame ClientSocketID, message
			when 'setStartGame'
				@Server.ClientManager.setStartGame ClientSocketID, message
			when 'setLeaveGame'
				@Server.ClientManager.setLeaveGame ClientSocketID, message
			when 'InputController'
				@Server.GameManager.inputController ClientSocketID, message



module.exports = CIO