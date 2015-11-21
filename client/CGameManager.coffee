class CGameManager
	constructor: (options) ->
		@GameObject = false
		@ping =
			previousTime: new Date().getMilliseconds()
			currentTime: 0
			value: 0



	getCharacter: ->
		if @GameObject
			for character in @GameObject.characterArray
				if character.ClientID is @Client.ClientManager.ClientObject.id
					return character
		else
			return false



	loadGame: ->
		@Client.UI.showLoadWindow()

		data = ''
		
		for character, i in @GameObject.characterArray
			data += '<div class="mainMenu_loadWindow_charactersItem" style="top: '+10 * i+'%">'
			data += '<div class="mainMenu_loadWindow_charactersItemLabel">'+character.ClientID+'</div>'
			data += '<div class="mainMenu_loadWindow_charactersItemProgressWrapper">'
			data += '<div class="mainMenu_loadWindow_charactersItemProgressBar"></div>'
			data += '</div>'
			data += '</div>'

		$('#mainMenu_loadWindow_characters').html data

		$('.mainMenu_loadWindow_charactersItemProgressBar').each ->
			$(@).animate
				width: '100%'
			, 2000 * ( Math.random()*0.5 + 0.5 )

		setTimeout =>
			@Client.ClientManager.setReadyGame()
		, 2000



	startGame: ->
		@GameBool = true
		@Client.GraphicEngine.start()
		@Client.InputController.enable()
		@Client.UI.hideLoadWindow()
		@Client.UI.gotoGameMenu()
		console.log 'start game'



	stopGame: ->
		@GameBool = false
		@Client.GraphicEngine.stop()
		@Client.InputController.disable()
		console.log 'stop game'



	roundPrepair: ->
		console.log 'roundPrepair'
		@Client.UI.abilitiesMenu.activeItem = false
		@Client.UI.abilitiesMenu.selected = false
		@Client.UI.showAbilitiesMenu()
		setTimeout =>
			document.getElementById('soundWrapper_announcer_prepair').play()
			@Client.UI.showAnouncement 'prepair'
		, 500


	roundPrepairEnd: ->
		if not @Client.UI.abilitiesMenu.selected
			if @Client.UI.abilitiesMenu.activeItem
				defaultAbilityID = @Client.UI.abilitiesMenu.activeItem
			else
				defaultAbilityID = $('.gameMenu_abilitiesMenu_item')[0].attributes.ability.value
			@Client.InputController.send
				type: 'selectAbilityDefault'
				id: defaultAbilityID

	roundFight: ->
		console.log 'roundFight'
		document.getElementById('soundWrapper_announcer_fight').play()
		@Client.UI.hideAbilitiesMenu()
		@Client.UI.showAnouncement 'fight'



	roundEnd: ->
		console.log 'roundEnd', @GameObject



	endGame: (message) ->
		@stopGame()
		document.getElementById('soundWrapper_announcer_end').play()
		characterArray = message.GameObject.characterArray.sort (a, b) ->
			if a.points < b.points
				return 1
			else if a.points > b.points
				return -1
			else
				return 0

		@Client.UI.showStatisticMenu characterArray 
	


	update: (GameObject) ->
		@GameObject = GameObject							#updating game data

		if @GameObject.soundArray							#updating sound data
			for sound in @GameObject.soundArray
				@Client.SoundEngine.soundArray.push sound
			@Client.SoundEngine.handle()


		if @GameObject														#status
			document.getElementById('gameStatus').innerHTML = @GameObject.id+" : "+@GameObject.status
		else
			document.getElementById('gameStatus').innerHTML = ''
		@ping.currentTime = new Date().getMilliseconds()					#ping
		@ping.value =  @ping.currentTime - @ping.previousTime
		@ping.previousTime = @ping.currentTime
		document.getElementById('ping').innerHTML = @ping.value
		



window.CGameManager = CGameManager