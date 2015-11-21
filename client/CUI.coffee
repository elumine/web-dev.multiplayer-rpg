class CUI
	constructor: (options) ->
		@abilitiesMenu =
			selected: false
			activeItem: false
		@gameMenu =
			UserBar:
				abilities:
					mainAbility: 1
		@language = 'en'



		@scaleWrapper()
		$(window).bind 'resize', =>
			@scaleWrapper()


		setTimeout =>
			$('#preloader').fadeOut 1000
			setTimeout =>
				$('#authMenu, #infoBar, #localizationMenu').fadeIn 1000
			, 1250
		, 3000


		@ui_localization @language


		#window.oncontextmenu = ->
		#	return false


		$('#authMenu_buttonTrailer, #mainMenu_buttonTrailer').bind 'click', =>
			$('#poster').animate(
				left:'35%', top:'25%', width:'30%', height:'50%', opacity: 0
			, 0).show().animate(
				left:'25%', top:'15%', width:'50%', height:'70%', opacity: 1
			, 500)
			$('#globalShader').fadeIn 250
			setTimeout =>
				$('#poster').animate(
					left:'35%', top:'25%', width:'30%', height:'50%', opacity: 0
				, 500)
				$('#globalShader').fadeOut 500
			, 1500

		$('#localizationMenu').bind 'mouseover', =>
			$('.localizationMenuWrapperPassive').show()

		$('#localizationMenu').bind 'mouseout', =>
			$('.localizationMenuWrapperPassive').hide()

		$('.localizationMenuWrapper > .localizationMenu_item').bind 'click', (e) =>
			$('.localizationMenuWrapperActive').each ->
				$(@).removeClass('localizationMenuWrapperActive').addClass('localizationMenuWrapperPassive')
			$(e.target).parent().removeClass('localizationMenuWrapperPassive').addClass('localizationMenuWrapperActive')
			@ui_localization $(e.target).attr('value')



		$('#authMenu_buttonRegister').bind 'click', =>
			@Client.ClientManager.setRegistration
				id: $('#authMenu_textareaLogin').val()
				password: $('#authMenu_textareaPassword').val()
			
		$('#authMenu_buttonLogin').bind 'click', =>
			@Client.ClientManager.setOnline
				id: $('#authMenu_textareaLogin').val()
				password: $('#authMenu_textareaPassword').val()
			
		$('#mainMenu_buttonLogout').bind 'click', =>
			@Client.ClientManager.setOffline()

		$('#mainMenu_buttonJoinGame').bind 'click', =>
			@Client.ClientManager.setJoinGame()

		$('#mainMenu_buttonLeaveGame').bind 'click', =>
			@Client.ClientManager.setLeaveGame()

		$('#mainMenu_buttonGameMenu').bind 'click', =>
			@gotoGameMenu()

		$('#gameMenu_buttonMainMenu').bind 'click', =>
			@gotoMainMenu 'gameMenu_buttonMainMenu'

		$('#gameMenu_abilitiesMenu_button > .text').bind 'click', =>
			if @abilitiesMenu.activeItem
				@abilitiesMenu.selected = true
				@Client.InputController.selectAbility @abilitiesMenu.activeItem
				@hideAbilitiesMenu()

		$('#gameMenu_statisticMenu_button > .text').bind 'click', =>
			@Client.ClientManager.setLeaveGame()
			@hideStatisticMenu()

		$('.gameMenu_userBar_abilities_item_bg').bind 'click', (e) =>
			@Client.InputController.fireAbility $(e.target.parentNode).attr('abilityIndex')

		$('.gameMenu_userBar_abilities_item_bg').bind 'mousemove', (e) =>
			$('#gameMenu_userBar_abilities_item_label').show().animate({top: e.clientY-50, left: e.clientX+10}, 0).html localization.abilities_description[e.target.parentNode.attributes.label.value][@language]

		$('.gameMenu_userBar_abilities_item_bg').bind 'mouseout', (e) =>
			$('#gameMenu_userBar_abilities_item_label').hide()

		$('.gameMenu_abilitiesMenu_item').bind 'mousemove', (e) =>
			$('#gameMenu_userBar_abilities_item_label').show().animate({top: e.clientY-50, left: e.clientX+10}, 0).html localization.abilities_description[e.target.attributes.ability.value][@language]

		$('.gameMenu_abilitiesMenu_item').bind 'mouseout', (e) =>
			$('#gameMenu_userBar_abilities_item_label').hide()
		

		$('.modelSetItem').bind 'click', (e) =>
			if not $(e.target).hasClass 'modelSetItemSelected'
				$('.modelSetItem').each ->
					$(@).removeClass 'modelSetItemSelected'
				$(e.target).addClass 'modelSetItemSelected'
				@Client.ClientManager.modelID = $(e.target).attr 'value'
				$('#mainMenu_characterModel').fadeOut 500
				setTimeout =>
					@stopMainMenuModelAnimation()
					@startMainMenuModelAnimation()
					$('#mainMenu_characterModel').fadeIn 500
				, 500

		$('.ui_button1, .ui_button2, .ui_button3').bind 'click', =>
			document.getElementById('soundWrapper_ui_button-click').play()


	scaleWrapper: ->
		dh = $(document).height()
		dw = $(document).width()
		w = dw
		h = w/2

		if h <= dh
			l = 0
			t = ((dh-h)/2)
			$('#wrapper').css('width', w).css('height', h).css('top', t).css('left', l)
		else
			h = dh
			w = h*2
			t = 0
			l = (dw - w)/2
			$('#wrapper').css('width', w).css('height', h).css('top', t).css('left', l)



	gotoAuthMenu: ->
		$('#mainMenu, #gameMenu, .localizationMenu_bg').hide()
		$('#authMenu').show()
		@stopMainMenuModelAnimation()
		document.getElementById('soundWrapper_music_auth').play()
		document.getElementById('soundWrapper_music_main').pause()
		document.getElementById('soundWrapper_music_game').pause()

	gotoMainMenu: (sender)->
		$('#authMenu, #gameMenu').hide()
		$('#mainMenu, .localizationMenu_bg').show()
		if sender is 'gameMenu_buttonMainMenu'
			$('#mainMenu_buttonJoinGame').hide()
			$('#mainMenu_buttonGameMenu, #mainMenu_buttonLeaveGame').show()
		else if sender is 'getOnline' or sender is 'getLeaveGame'
			@hideStatisticMenu()
			$('#mainMenu_buttonGameMenu, #mainMenu_buttonLeaveGame').hide()
			$('#mainMenu_buttonJoinGame').show()
		@stopMainMenuModelAnimation()
		@startMainMenuModelAnimation()
		document.getElementById('soundWrapper_music_auth').pause()
		document.getElementById('soundWrapper_music_main').play()
		document.getElementById('soundWrapper_music_game').pause()

	gotoGameMenu: ->
		$('#authMenu, #mainMenu').hide()
		$('#gameMenu, #gameMenu_buttonMainMenu').show()
		@stopMainMenuModelAnimation()
		document.getElementById('soundWrapper_music_auth').pause()
		document.getElementById('soundWrapper_music_main').pause()
		document.getElementById('soundWrapper_music_game').play()




	showInfoWindow: (target, flag) ->
		$('#infoWindow').hide().fadeIn 500
		$('.infoWindowLabel').hide()
		switch target
			when 'registration'
				switch flag
					when true
						$('#infoWindowRegistrationTrue').show()
					when false
						$('#infoWindowRegistrationFalse').show()
			when 'login'
				switch flag
					when false
						$('#infoWindowLoginFalse').show()

		setTimeout =>
			$('#infoWindow').fadeOut 500
		, 1500


	showLoadWindow: ->
		$('#mainMenu_loadWindow').show()

	hideLoadWindow: ->
		$('#mainMenu_loadWindow').hide()



	startMainMenuModelAnimation: ->
		canvas = document.getElementById 'mainMenu_characterModel_canvas'
		canvas.width = $(canvas).width()
		canvas.height = $(canvas).height()
		ctx = canvas.getContext '2d'
		sprite = @Client.AssetManager.SpriteArray[@Client.ClientManager.modelID+'_preview']
		frameX = 0

		@mainMenuModelAnimationInterval = setInterval =>
			if sprite.width*frameX >= sprite.image.width or frameX >= 24
				frameX = 0
			ctx.clearRect 0,0, canvas.width, canvas.height
			ctx.drawImage sprite.image, sprite.width * frameX, 0, sprite.width, sprite.height, 0, 0, canvas.width, canvas.height
			frameX++
		, 80


	stopMainMenuModelAnimation: ->
		clearInterval @mainMenuModelAnimationInterval



	showAbilitiesMenu: ->
		$('#gameMenu_abilitiesMenu').show()
		abilitiesArray = []
		for abilityID in @Client.AssetManager.AbilitiesArray
			abilitiesArray.push abilityID
		
		for abilityID in abilitiesArray
			for learnedAbilityID in @Client.GameManager.getCharacter().abilities
				if abilityID is learnedAbilityID
					abilitiesArray.splice(abilitiesArray.indexOf(abilityID), 1)

		for item in $('.gameMenu_abilitiesMenu_item')
			$(item).hide().attr('ability', 'none')

		counter = 1
		for abilityID in abilitiesArray
			selector = "#gameMenu_abilitiesMenu_item"+counter
			if counter is 1
				$(selector).addClass('gameMenu_abilitiesMenu_item-active')
			counter++
			$(selector).show().attr('src', 'assets/ui/'+abilityID+'-icon.png').attr('ability', abilityID)

		
		$('.gameMenu_abilitiesMenu_item').bind 'click', (e) =>
			for item in $('.gameMenu_abilitiesMenu_item')
				$(item).removeClass('gameMenu_abilitiesMenu_item-active')
			$(e.target).addClass('gameMenu_abilitiesMenu_item-active')
			@abilitiesMenu.activeItem = e.target.attributes.ability.value




	hideAbilitiesMenu: ->
		$('#gameMenu_abilitiesMenu').hide()




	showStatisticMenu: (characterArray) ->
		$('#gameMenu_statisticMenu').show()
		value = ''
		for character in characterArray
			value += 'Character '+character.ClientID+' '+character.points+' points<br>'
		
		$('#gameMenu_statisticMenu_wrapper').html('').html(value)

	hideStatisticMenu: ->
		$('#gameMenu_statisticMenu').hide()




	showAnouncement: (value) ->
		$('#anouncement_'+value).show()
		setTimeout =>
			$('#anouncement_'+value).hide()
		, 1500




	ui_localization: (language) ->
		@language = language
		$('.ui_localization-wrapper').each ->
			$(@).html(localization[$(@).attr('id')][language])


window.CUI = CUI