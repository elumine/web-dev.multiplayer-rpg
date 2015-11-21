class CClientManager
	constructor: (options) ->
		@ClientObject = false
		@modelID = 'modelA'

	update: (ClientObject) ->
		@ClientObject = ClientObject


	authentification: (data) ->
		temp = true
		if not data.id or not data.password
			temp = false
		return temp



	setRegistration: (data) ->
		if @authentification(data)
			@Client.IO.send
				header: 'setRegistration'
				id: data.id
				password: data.password
		else
			@Client.UI.showInfoWindow 'registration', false
				
	getRegistration: (message) ->
		if message.result
			@Client.UI.showInfoWindow 'registration', true
			setTimeout =>
				@Client.ClientManager.setOnline 
					id: message.ClientObject.id
					password: message.ClientObject.password
			, 500
		else
			@Client.UI.showInfoWindow 'registration', false

			document.getElementById('clientStatus').innerHTML = 'Registration ok'



	setOnline: (data) ->
		if @authentification(data)
			@Client.IO.send
				header: 'setOnline'
				id: data.id
				password: data.password
		else
			@Client.UI.showInfoWindow 'login', false

	getOnline: (message) ->
		@Client.UI.gotoMainMenu 'getOnline'
		if message.result
			@Client.ClientManager.update message.ClientObject
			$('#clientStatus').html('<span>'+@ClientObject.id+'</span>&nbsp;<span style="color:#0f0;">'+@ClientObject.status+'</span>')
		else
			@Client.UI.showInfoWindow 'login', false



	setOffline: () ->
		@Client.IO.send
			header: 'setOffline'

	getOffline: (message) ->
		@Client.UI.gotoAuthMenu()
		if message.result
			document.getElementById('clientStatus').innerHTML = ''



	setJoinGame: (data) ->
		@Client.IO.send
			header: 'setJoinGame'
			modelID: @modelID

	getJoinGame: (message) ->
		if message.result
			@Client.ClientManager.update message.ClientObject			
			@Client.ClientManager.setLoadGame()

			document.getElementById('clientStatus').innerHTML = @ClientObject.id+' '+@ClientObject.status+' '+@Client.GameManager.GameObject.id



	setLoadGame: () ->
		@Client.GameManager.loadGame()
		@Client.IO.send
			header: 'setLoadGame'

	getLoadGame: (message) ->
		if message.result
			@Client.ClientManager.update message.ClientObject

			document.getElementById('clientStatus').innerHTML = @ClientObject.id+' '+@ClientObject.status+' '+@Client.GameManager.GameObject.id



	setReadyGame: () ->
		@Client.IO.send
			header: 'setReadyGame'

	getReadyGame: (message) ->
		if message.result
			@Client.ClientManager.update message.ClientObject
			document.getElementById('clientStatus').innerHTML = @ClientObject.id+' '+@ClientObject.status+' '+@Client.GameManager.GameObject.id



	setLeaveGame: () ->
		@Client.IO.send
			header: 'setLeaveGame'
			
	getLeaveGame: (message) ->
		@Client.UI.gotoMainMenu 'getLeaveGame'
		if message.result
			if @Client.GameManager.GameBool
				@Client.GameManager.stopGame()
			@Client.ClientManager.update message.ClientObject

			document.getElementById('clientStatus').innerHTML = @ClientObject.id+' '+@ClientObject.status



window.CClientManager = CClientManager