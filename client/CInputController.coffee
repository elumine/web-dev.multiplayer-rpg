class CInputController
	send: (event) ->
		@Client.IO.send
			header: 'InputController'
			event: event

	selectAbility: (id) ->
		@send
			type: 'selectAbility'
			id: id


	fireAbility: (id) ->
		character = @Client.GameManager.getCharacter()
		if not character.cooldowns[id] or character.cooldowns[id] and character.cooldowns[id].value <= 0
			@send
				type: 'ability'
				id: id

	enable: ->
		@inputInterval = setInterval =>
			character = @Client.GameManager.getCharacter()
			if character
				if character.model.state.id is 'stand' or character.model.state.id is 'move'
					@inputBool = true
				else if character.model.state.id is 'ability'
					@inputBool = false			
		, 20

		@Client.GraphicEngine.canvas.addEventListener 'mousedown', @fn_mousedown = (event) =>
			@mousedown = true
			@fn_mousemove event
			if @inputBool
				@send
					type: 'move'

		@Client.GraphicEngine.canvas.addEventListener 'mouseup', @fn_mouseup = (event) =>
			@mousedown = false
			if @inputBool
				@send
					type: 'stand'

		@Client.GraphicEngine.canvas.addEventListener 'mousemove', @fn_mousemove = (event) =>
			if @mousedown
				character = @Client.GameManager.getCharacter()
				x = event.offsetX - @Client.GraphicEngine.canvas.width/2
				y = event.offsetY - @Client.GraphicEngine.canvas.height/2
				vd = [x, y]
				vx = [1, 0]
				vd = Math.normalize vd
				angle_deg = Math.vector_angle vd, vx
				if vd[1] < 0
					angle_deg = 360 - angle_deg
				@send
					type: 'direction'
					direction:
						vector: vd
						angle: angle_deg

		window.addEventListener 'keypress', @fn_keypress = (event) =>
			if @inputBool
				@inputBool = false
				switch event.keyCode
					when 49
						@fireAbility 0
					when 50
						@fireAbility 1
					when 51
						@fireAbility 2
					when 52
						@fireAbility 3
					when 53
						@fireAbility 4

	disable: ->
		clearInterval @inputInterval

		@Client.GraphicEngine.canvas.removeEventListener 'mousedown', @fn_mousedown
		@Client.GraphicEngine.canvas.removeEventListener 'mouseup', @fn_mouseup
		@Client.GraphicEngine.canvas.removeEventListener 'mousemove', @fn_mousemove
		window.removeEventListener 'keypress', @fn_keypress
		

window.CInputController = CInputController