class CIO
	constructor: (options) ->
		@connect()	

	connect: ->
		@socket = new WebSocket("ws://localhost:5000")

		@socket.onopen = (event) =>
			$('#serverStatus').css('color', '#0f0').html 'online'

		@socket.onclose = (event) =>
			setTimeout =>
				@connect()
			, 100
			$('#serverStatus').css('color', '#f00').html 'offline'
			if @Client.GameManager.GameBool
				@Client.GameManager.endGame()
			if @Client.ClientManager.ClientObject
				@Client.ClientManager.getOffline {result: true}

		@socket.onmessage = (event) =>
			@recive JSON.parse event.data

	send: (message) ->
		if @socket.readyState is 1
			@socket.send JSON.stringify message

	recive: (message) ->
		#console.log 'server message', message
		switch message.header
			when 'setRegistration'
				@Client.ClientManager.getRegistration message
			when 'setOnline'
				@Client.ClientManager.getOnline message
			when 'setOffline'
				@Client.ClientManager.getOffline message
			when 'setJoinGame'
				@Client.ClientManager.getJoinGame message
			when 'setLoadGame'
				@Client.ClientManager.getLoadGame message
			when 'setReadyGame'
				@Client.ClientManager.getReadyGame message
			when 'setLeaveGame'
				@Client.ClientManager.getLeaveGame message
			when 'massDelivery'
				@Client.GameManager.update message.GameObject
			when 'startGame'
				@Client.GameManager.startGame()
			when 'roundPrepair'
				@Client.GameManager.roundPrepair()
			when 'roundPrepairEnd'
				@Client.GameManager.roundPrepairEnd()
			when 'roundFight'
				@Client.GameManager.roundFight()
			when 'roundEnd'
				@Client.GameManager.roundEnd()
			when 'endGame'
				@Client.GameManager.endGame message
	


window.CIO = CIO