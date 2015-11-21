class CGraphicEngine
	constructor: (options) ->
		{@canvas} = options
		@ctx = @canvas.getContext '2d'
		@fps = 
			previous: 0
			current: 0
			value: 0
		@mode =
			basic: false

		@canvas.width = $(@canvas.parentNode).width()
		@canvas.height = $(@canvas.parentNode).height()

		$(window).bind 'resize', =>
			@canvas.width = $(@canvas.parentNode).width()
			@canvas.height = $(@canvas.parentNode).height()

		@fullscreen = false
		@camera =
			x: 0
			y: 0
			width: 1000
			height: 500

		


	start: ->
		@renderInterval = requestAnimationFrame @render.bind @
		@enableGameMenuUserBarHpAnimation()



	stop: ->
		cancelAnimationFrame @renderInterval
		clearInterval @animationInterval



	render: ->
		@GameObject = @Client.GameManager.GameObject
		if @GameObject
			#camera
			@camera.scale = @canvas.width/@camera.width
			for character in @GameObject.characterArray
				if character.ClientID is @Client.ClientManager.ClientObject.id
					@camera.x = gameToScreen(character.model.x - @camera.width/2)
					@camera.y = gameToScreen(character.model.y - @camera.height/2)
			
			#fps		
			@fps.current = new Date().getMilliseconds()
			@fps.value = (1000/(@fps.current-@fps.previous)).toFixed 0
			@fps.previous = @fps.current
			document.getElementById('fps').innerHTML = @fps.value

			#z-sort models
			items = []
			for character in @GameObject.characterArray
				if not character.dead
					items.push character
			for ability in @GameObject.abilitiesArray
				items.push ability

			items.sort (a, b) ->
				if a.model.y < b.model.y
					return -1
				else if a.model.y > b.model.y
					return 1
				else
					return 0

			#clear
			@ctx.clearRect 0,0, @canvas.width, @canvas.height
			
			#water
			#@drawWater @GameObject.level

			@ctx.fillStyle = '#ff0'
			@ctx.rect(0,0,@canvas.width,@canvas.height)
			@ctx.fill()

			#level
			#@drawGound @GameObject.level
			
			#items
			for item in items
				@drawItem item
			
			#character ui
			for character, i in @GameObject.characterArray
				@drawCharactersUI character
				if character.ClientID is @Client.ClientManager.ClientObject.id
					@drawCharacterUI character
			
			#ui
			@drawStatisticTable @GameObject.characterArray
			if @GameObject.data.round.array[@GameObject.data.round.current]
				$('#gameMenu_timeBar').html( ( (@GameObject.data.round.array[@GameObject.data.round.current].time)/1000 ).toFixed(0) )

			#recall
			@renderInterval = requestAnimationFrame @render.bind @




	enableGameMenuUserBarHpAnimation: ->
		canvas = document.getElementById 'gameMenu_userBar_hp_canvas'
		canvas.width = $(canvas).width()
		canvas.height = $(canvas).height()
		ctx = canvas.getContext '2d'
		sprite = @Client.AssetManager.SpriteArray.hpAnimation
		frameX = 0

		@animationInterval = setInterval =>
			if sprite.width*frameX >= sprite.image.width or frameX > 109
				frameX = 0
			ctx.clearRect 0,0, canvas.width, canvas.height
			ctx.drawImage sprite.image, sprite.width * frameX, 0, sprite.width, sprite.height, 0, 0, canvas.width, canvas.height
			frameX++
		, 24



	drawWater: (level) ->
		sprite = @Client.AssetManager.SpriteArray[level.id+'_water']
		frameX = parseInt(level.water.state.time/(level.water.state.duration/sprite.frames)).toFixed 0
		width1 = sprite.width
		height1 = sprite.height
		x_length = (level.width/width1).toFixed 0
		y_length = (level.height/height1).toFixed 0
		width2 = level.width/x_length
		height2 = level.height/y_length
		
		for i in [0...x_length] by 1
			if i%2 isnt 0
				x_reflection = -1
			else
				x_reflection = 1
			for j in [0...y_length] by 1
				if j%2 isnt 0
					y_reflection = -1
				else
					y_reflection = 1

				@ctx.save()
				@ctx.translate gameToScreen(width2 * i + width2/2) - @camera.x, gameToScreen(height2 * j + height2/2) - @camera.y
				@ctx.scale x_reflection, y_reflection
				@drawSprite sprite, frameX, 0, gameToScreen(-width2/2), gameToScreen(-height2/2), gameToScreen(width2), gameToScreen(height2)
				@ctx.restore()


	drawGound: (level) ->
		sprite = @Client.AssetManager.SpriteArray[level.id+'_ground']
		frameX = 0
		@drawSprite sprite, frameX, 0, gameToScreen(level.safeZone.cx - level.safeZone.rx) - @camera.x, gameToScreen(level.safeZone.cy - level.safeZone.ry) - @camera.y, gameToScreen(level.safeZone.rx*2), gameToScreen(level.safeZone.ry*2)
		


	drawItem: (item) ->
		drawGraphicEffectDoubleFrontPart = false
		if item.ClientID
			for graphicEffect in item.graphicEffects
				if graphicEffect.type is 'back'
					@ctx.beginPath()
					@ctx.fillStyle = '#0f0'
					@ctx.lineWidth = 1
					@ctx.arc(gameToScreen(item.model.x) - @camera.x, gameToScreen(item.model.y) - @camera.y, gameToScreen(graphicEffect.model.radius), 0, 2 * Math.PI, false)
					@ctx.fill()
					@ctx.stroke()
					@ctx.closePath()
				else if graphicEffect.type is 'double'
					drawGraphicEffectDoubleFrontPart = true
					@ctx.beginPath()
					@ctx.fillStyle = '#3f3'
					@ctx.lineWidth = 1
					@ctx.arc(gameToScreen(item.model.x) - @camera.x, gameToScreen(item.model.y) - @camera.y, gameToScreen(graphicEffect.model.radius), Math.PI, 0, false)
					@ctx.fill()
					@ctx.stroke()
					@ctx.closePath()

		if @mode.basic
			@ctx.beginPath()
			@ctx.fillStyle = '#00f'
			@ctx.lineWidth = 1
			@ctx.arc(gameToScreen(item.model.x) - @camera.x, gameToScreen(item.model.y) - @camera.y, gameToScreen(item.model.radius), 0, 2 * Math.PI, false)
			@ctx.fill()
			@ctx.stroke()
			@ctx.closePath()
			@ctx.fillStyle = '#0f0'
			@ctx.fillRect(gameToScreen(item.model.x) - @camera.x - 1, gameToScreen(item.model.y) - @camera.y - 1, 2, 2)
		else
			#get sprite
			sprite = @Client.AssetManager.SpriteArray[item.model.id]
			#set direction
			direction = 0
			directions = (sprite.directions-1)*2
			step = (360/(directions*2))
			
			if item.direction.angle >= 270 and item.direction.angle <= 360
				a = 360 + step
				for i in [((sprite.directions - 1)/2)+1..sprite.directions] by 1
					b = a - step*2
					if item.direction.angle <= a and item.direction.angle >= b
						direction = i - 1
						#console.log 'for', i, 'angle', item.direction.angle, 'a', a, 'b', b, 'direction', direction
					a = b

			if item.direction.angle <= 90 and item.direction.angle >= 0
				a = 90 + step
				for i in [1..((sprite.directions - 1)/2)+1] by 1
					b = a - step*2
					if item.direction.angle <= a and item.direction.angle >= b
						direction = i - 1
						#console.log 'for', i, 'angle', item.direction.angle, 'a', a, 'b', b, 'direction', direction
					a = b

			if item.direction.angle <= 180 and item.direction.angle >= 90
				a = 90 - step
				for i in [1..((sprite.directions - 1)/2)+1] by 1
					b = a + step*2
					if item.direction.angle >= a and item.direction.angle <= b
						direction = -(i - 1)
						#console.log 'for', i, 'angle', item.direction.angle, 'a', a, 'b', b, 'direction', direction
					a = b

			if item.direction.angle <= 270 and item.direction.angle >= 180
				a = 180 - step
				for i in [((sprite.directions - 1)/2)+1..sprite.directions] by 1
					b = a + step*2
					if item.direction.angle >= a and item.direction.angle <= b
						direction = -(i - 1)
						#console.log 'for', i, 'angle', item.direction.angle, 'a', a, 'b', b, 'direction', direction
					a = b

			#create frames, fix directions and draw
			frameX = parseInt(item.model.state.time/(item.model.state.duration/sprite.frames)).toFixed 0

			if direction < 0
				direction = -1 * direction
				frameY = item.model.state.index * sprite.directions + direction
				if item.model.state.flat
					frameY = item.model.state.index*sprite.directions
				@ctx.save()
				@ctx.translate(gameToScreen(item.model.x) - @camera.x , gameToScreen(item.model.y) - @camera.y)
				@ctx.scale -1, 1
				
				if item.invisibility
					if item.ClientID is @Client.ClientManager.ClientObject.id
						@ctx.globalAlpha = 0.5
					else
						@ctx.globalAlpha = 0
				@drawSprite sprite, frameX, frameY, gameToScreen(-item.model.radius), gameToScreen(-item.model.radius), gameToScreen(item.model.radius) * 2, gameToScreen(item.model.radius) * 2
				@ctx.restore()

			else
				frameY = item.model.state.index*sprite.directions+direction
				if item.model.state.flat
					frameY = item.model.state.index*sprite.directions
				
				@ctx.save()
				if item.invisibility
					if item.ClientID is @Client.ClientManager.ClientObject.id
						@ctx.globalAlpha = 0.5
					else
						@ctx.globalAlpha = 0
				@drawSprite sprite, frameX, frameY, gameToScreen(item.model.x - item.model.radius) - @camera.x, gameToScreen(item.model.y - item.model.radius) - @camera.y, gameToScreen(item.model.radius) * 2, gameToScreen(item.model.radius) * 2
				@ctx.restore()


		if drawGraphicEffectDoubleFrontPart
			@ctx.beginPath()
			@ctx.fillStyle = '#2f2'
			@ctx.lineWidth = 1
			@ctx.arc(gameToScreen(item.model.x) - @camera.x, gameToScreen(item.model.y) - @camera.y, gameToScreen(graphicEffect.model.radius), 0, Math.PI, false)
			@ctx.fill()
			@ctx.stroke()
			@ctx.closePath()

		if item.ClientID
			for graphicEffect in item.graphicEffects
				if graphicEffect.type is 'front'
					console.log 'graphicEffect', graphicEffect
					#get sprite
					sprite = @Client.AssetManager.SpriteArray[graphicEffect.model.id]
					#create frames
					frameX = parseInt(graphicEffect.model.state.time/(graphicEffect.model.state.duration/sprite.frames)).toFixed 0
					frameY = 0
					@drawSprite sprite, frameX, frameY, gameToScreen(item.model.x - graphicEffect.model.radius) - @camera.x, gameToScreen(item.model.y - graphicEffect.model.radius) - @camera.y, gameToScreen(graphicEffect.model.radius) * 2, gameToScreen(graphicEffect.model.radius) * 2
			if item.onwater.flag
				#get sprite
				sprite = @Client.AssetManager.SpriteArray.water_GraphicEffect
				#create frames
				frameX = parseInt(item.onwater.model.state.time/(item.onwater.model.state.duration/sprite.frames)).toFixed 0
				frameY = 0
				@drawSprite sprite, frameX, frameY, gameToScreen(item.model.x - item.onwater.model.radius) - @camera.x, gameToScreen(item.model.y - item.onwater.model.radius) - @camera.y, gameToScreen(item.onwater.model.radius) * 2, gameToScreen(item.onwater.model.radius) * 2


	drawCharacterUI: (character) ->
		#effects
		for item in $('.gameMenu_userBar_effects_item')
			$(item).hide()

		counter = 1
		for effect, i in character.effects
			effectItemSelector = "#gameMenu_userBar_effects_item"+counter
			counter++
			if effect.type isnt 'effect'
				$(effectItemSelector).show().attr('src', 'assets/ui/'+effect.abilityID+'-'+effect.type+'-icon.png')
			else
				$(effectItemSelector).show().attr('src', 'assets/ui/'+effect.abilityID+'-'+effect.data.value+'-icon.png')
			
		#abilities
		for item in $('.gameMenu_userBar_abilities_item')
			$(item).hide()

		counter = 1
		
		for ability, i in character.abilities
			if i + 1 isnt @Client.UI.gameMenu.UserBar.abilities.mainAbility
				abilityItemSelector = "#gameMenu_userBar_abilities_item"+counter
				counter++
			else if i + 1 is @Client.UI.gameMenu.UserBar.abilities.mainAbility
				abilityItemSelector = "#gameMenu_userBar_abilities_item5"
			
			abilityItem = $(abilityItemSelector)
			abilityItem_shader = $(abilityItemSelector + ' > .gameMenu_userBar_abilities_item_shader')
			abilityItem_bg = $(abilityItemSelector + ' > .gameMenu_userBar_abilities_item_bg')
			abilityItem_bg.attr('src', 'assets/ui/'+ability+'-icon.png')

			abilityItem.show().attr('abilityIndex', i).attr('label', ability)

			cooldown_animation_k = 0
			if character.cooldowns[i]
				cooldown_animation_k = 100 * character.cooldowns[i].value / character.cooldowns[i].time
			abilityItem_shader.css('height', cooldown_animation_k+'%')

		#hp bar
		transition_k = 100 - (100 * character.hp.current / character.hp.max)
		$('#gameMenu_userBar_hp_canvas').css('top', transition_k + '%')




	drawCharactersUI: (character) ->
		#character name
		@ctx.fillStyle = "#fff"
		@ctx.font = "italic "+gameToScreen(10)+"px Arial"
		@ctx.fillText character.ClientID, gameToScreen(character.model.x+(-character.ClientID.length*10)/2) - @camera.x, gameToScreen(character.model.y-75) - @camera.y

		#hp bar
		if character.ClientID is @Client.ClientManager.ClientObject.id
			fill1 = '#0f0'
			fill2 = '#5a5'
			@ctx.font = "italic "+gameToScreen(8)+"px Arial"
			@ctx.fillStyle = fill1
			@ctx.fillText character.hp.current+'/'+character.hp.max, gameToScreen(character.model.x + character.model.radius) - @camera.x, gameToScreen(character.model.y-75) - @camera.y
		else
			fill1 = '#f00'
			fill2 = '#a55'

		bar_left_up = [gameToScreen(character.model.x - character.model.radius) - @camera.x, gameToScreen(character.model.y - character.model.radius - 15) - @camera.y]
		bar_right_up2 = [gameToScreen(character.model.x + character.model.radius) - @camera.x, gameToScreen(character.model.y - character.model.radius - 15) - @camera.y]
		bar_right_bottom2 = [gameToScreen(character.model.x + character.model.radius) - @camera.x, gameToScreen(character.model.y - character.model.radius - 10) - @camera.y]
		bar_left_bottom = [gameToScreen(character.model.x - character.model.radius) - @camera.x, gameToScreen(character.model.y - character.model.radius - 10) - @camera.y]
		bar_right_up1 = [gameToScreen(character.model.x - character.model.radius + 2*character.model.radius*(character.hp.current/character.hp.max)  )- @camera.x, gameToScreen(character.model.y - character.model.radius - 15) - @camera.y]
		bar_right_bottom1 = [gameToScreen(character.model.x - character.model.radius + 2*character.model.radius*(character.hp.current/character.hp.max) ) - @camera.x, gameToScreen(character.model.y - character.model.radius - 10) - @camera.y]
		
		@ctx.beginPath()
		@ctx.moveTo bar_left_up[0], bar_left_up[1]
		@ctx.lineTo bar_right_up2[0], bar_right_up2[1]
		@ctx.lineTo bar_right_bottom2[0], bar_right_bottom2[1]
		@ctx.lineTo bar_left_bottom[0], bar_left_bottom[1]
		@ctx.lineTo bar_left_up[0], bar_left_up[1]
		@ctx.closePath()
		@ctx.fillStyle = fill2
		@ctx.fill()

		@ctx.beginPath()
		@ctx.moveTo bar_left_up[0], bar_left_up[1]
		@ctx.lineTo bar_right_up1[0], bar_right_up1[1]
		@ctx.lineTo bar_right_bottom1[0], bar_right_bottom1[1]
		@ctx.lineTo bar_left_bottom[0], bar_left_bottom[1]
		@ctx.lineTo bar_left_up[0], bar_left_up[1]
		@ctx.closePath()
		@ctx.fillStyle = fill1
		@ctx.fill()



	drawStatisticTable: (characterArray) ->
		data = ''
		for character, i in characterArray
			data += '<div id="gameMenu_statisticTableItem'+i+'" class="gameMenu_statisticTableItem"><div class="gameMenu_statisticTableItemLeft">'+character.ClientID+'</div><div class="gameMenu_statisticTableItemRight">'+character.points+'</div></div>'
		
		$('#gameMenu_statisticTable').html data



	drawSprite: (SpriteObject, frameX, frameY, x, y, width, height) ->
		if SpriteObject.width*frameX >= SpriteObject.image.width
			frameX = 0
		@ctx.drawImage SpriteObject.image, SpriteObject.width*frameX, SpriteObject.height*frameY, SpriteObject.width, SpriteObject.height, x, y, width, height



window.CGraphicEngine = CGraphicEngine