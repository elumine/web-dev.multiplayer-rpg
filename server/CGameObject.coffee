CCharacter = require './CCharacter'
Assets = require './Assets'
common = require './common'

class CGameObject
	constructor: (options) ->
		{@id, @GameManager} = options
		@maxCharacters = 3
		@status = 'empty'
		@characterArray = []
		@abilitiesArray = []
		@soundArray = []
		@data =
			interval:
				delay:
					load: 100
					game: 20
			round:
				current: 0
				max: 3
				array: []
			statistic: {}
		@temp =
			uniqeAbilityIDCounter: 0

		console.log 'startGame', @id



	addCharacter: (ClientID, modelID) ->
		character = new CCharacter
			ClientID: ClientID
			model: Assets[modelID]()

		@characterArray.push character
		@GameLogic_handleEmpty()



	clientEventHandler: (ClientObject, event) ->
		character = @getCharacterByClientID ClientObject.id
		switch event.type
			when 'direction'
				if @data.round.array[@data.round.current].status isnt 'prepair'
					character.direction.vector = event.direction.vector
					character.direction.angle = event.direction.angle

			when 'stand'
				if @data.round.array[@data.round.current].status isnt 'prepair'
					character.model.state = character.model.states.stand

			when 'move'
				if @data.round.array[@data.round.current].status isnt 'prepair'
					if not character.stun and not character.root
						character.model.state = character.model.states.move

			when 'ability'
				if @data.round.array[@data.round.current].status isnt 'prepair'
					if not character.stun and not character.silence
						if character.abilities[event.id]
							character.model.state = character.model.states.ability
							character.abilityID = character.abilities[event.id]
							character.cooldownID = event.id
							setTimeout =>
								character.model.state = character.model.states.stand
							, character.model.state.duration

							for effect in character.effects
								if effect.data.value is 'invisibility'
									character.effects.splice(character.effects.indexOf(effect), 1)
							

			when 'selectAbility'
				if @data.round.array[@data.round.current].status is 'prepair'
					character.abilities.push event.id

			when 'selectAbilityDefault'
				console.log 'selectAbilityDefault'
				character.abilities.push event.id



	clientLeaveGame: (ClientObject) ->
		characterIndex = 0
		for character, i in @characterArray
			if character.ClientID is ClientObject.id
				characterIndex = i
		@characterArray.splice characterIndex, 1
		
		if @characterArray.length is 0 and @status isnt 'end'
			@GameLogic_handleEnd()



	dropClientsFromGame: ->
		if @characterArray.length isnt 0
			character = @characterArray[0]
			console.log 'dropClientsFromGame', character.ClientID
			ClientSocketID = @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID
			@GameManager.Server.ClientManager.setLeaveGame ClientSocketID

			if @characterArray.length isnt 0
				@dropClientsFromGame()



	getCharacterByClientID: (ClientID) ->
		for character in @characterArray
			if character.ClientID is ClientID
				return character



	getGameObject: ->
		return {
			id: @id
			status: @status
			level: @level
			characterArray: @characterArray
			abilitiesArray: @abilitiesArray
			soundArray: @soundArray
			data: @data}



	GameLogic_handleEmpty: ->
		console.log 'GameLogic_handleEmpty'
		if @characterArray.length is @maxCharacters
			@GameLogic_handleLoad()

		@massDelivery()




	handleRoundTimeStart: ->
		console.log 'handleRoundTimeStart'
		@GameLoopTimeInterval = setInterval =>
			if @data.round.array[@data.round.current].time
				@data.round.array[@data.round.current].time -= 1000
		, 1000



	handleRoundTimeStop: ->
		console.log 'handleRoundTimeStop'
		@data.round.array[@data.round.current].time = 0
		clearInterval @GameLoopTimeInterval



	GameLogic_handleLoad: ->
		console.log 'GameLogic_handleLoad'
		@status = 'load'
		@level = Assets.level0()
		@LoadLoopInterval = setInterval =>
			console.log 'GameLogic_handleLoad - check'
			temp = true
			for character in @characterArray
				if @GameManager.Server.ClientManager.ClientArray[character.ClientID].status isnt 'readyGame'
					temp = false
			if temp
				clearInterval @LoadLoopInterval
				@GameLogic_handleStart()

			@massDelivery()
		, @data.interval.delay.load



	GameLogic_handleStart: ->
		console.log 'GameLogic_handleStart'
		@status = 'start'
		@GameLogic_handleRound()
		@GameLoopInterval = setInterval =>
			@handleLevel @data.interval.delay.game
			@handleCharacters @data.interval.delay.game
			@handleAbilities @data.interval.delay.game
			@massDelivery()
		, @data.interval.delay.game

		for character in @characterArray
			@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
				header: 'startGame'
		


	GameLogic_handleRound: ->
		console.log 'GameLogic_handleRound'
		if @data.round.current < @data.round.max
			@data.round.array[@data.round.current] = new CRound
				number: @data.round.current

			@GameLogic_handleRoundPrepair()
		else
			@GameLogic_handleEnd()



	GameLogic_handleRoundPrepair: ->
		console.log 'GameLogic_handleRoundPrepair'
		@handleRoundTimeStop()
		@handleRoundTimeStart()
		@handleCharacters_spawn()
		@abilitiesArray = []
		@temp.uniqeAbilityIDCounter = 0
		@data.round.array[@data.round.current].time = @data.round.array[@data.round.current].duration.prepair
		@temp.roundPrepairTimeout = setTimeout =>
			@GameLogic_handleRoundFight()
			for character in @characterArray
				@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
					header: 'roundPrepairEnd'
		, @data.round.array[@data.round.current].duration.prepair

		for character in @characterArray
			@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
				header: 'roundPrepair'



	GameLogic_handleRoundFight: ->
		console.log 'GameLogic_handleRoundFight'
		@handleRoundTimeStop()
		@handleRoundTimeStart()
		@handleCharacters_spawn()
		@data.round.array[@data.round.current].status = 'fight'
		@data.round.array[@data.round.current].time = @data.round.array[@data.round.current].duration.fight
		@temp.roundFightTimeout = setTimeout =>
			@handleRoundTimeStop()
			if @data.round.array[@data.round.current].status is 'fight'
				aliveArray = []
				for character in @characterArray
					alive = true
					for deadCharacter in @data.round.array[@data.round.current].deadArray
						if deadCharacter.ClientID is character.ClientID
							alive = false
					if alive
						aliveArray.push character					
				
				@GameLogic_handleRoundEnd aliveArray
		, @data.round.array[@data.round.current].duration.fight

		for character in @characterArray
			@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
				header: 'roundFight'



	GameLogic_handleRoundEnd: (winnerArray) ->
		console.log 'GameLogic_handleRoundEnd'
		for character in winnerArray
			value = @data.round.array[@data.round.current].deadArray.length
			if value is 0
				value = 1
			character.points += value
		for ClientID, i in @data.round.array[@data.round.current].deadArray
			character = @getCharacterByClientID ClientID
			character.points += i

		@data.round.array[@data.round.current].status = 'end'
		for character in @characterArray
			@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
				header: 'roundEnd'
		@data.round.current++
		@GameLogic_handleRound()



	GameLogic_handleEnd: ->
		console.log 'stopGame', @id
		@status = 'end'
		for character in @characterArray
			@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
				header: 'endGame'
				GameObject: @getGameObject()
		clearInterval @GameLoopInterval
		clearInterval @GameLoopTimeInterval
		clearTimeout @temp.roundPrepairTimeout
		clearTimeout @temp.roundFightTimeout
		@GameManager.removeGame @



	checkEnd: ->
		console.log 'checkEnd'
		winner = false
		end = true
		for character in @characterArray
			if not character.dead
				if not winner
					winner = character
				else
					end = false
		if end
			@GameLogic_handleRoundEnd [winner]



	handleAbilities: (x) ->
		for ability, i in @abilitiesArray
			ability.model.state.time += x
			if ability.model.state.time > ability.model.state.duration
				ability.model.state.time = 0

			switch ability.model.state.id
				when 'move'
					@handleAbility_move ability, x

					fired = false
					for character in @characterArray
						if character.ClientID isnt ability.caster.ClientID
							if common.collision_detect_ability ability, character
								if character.shield
									common.handle.ability.rebound ability, character
								else
									ability.model.state = ability.model.states.fire
									fired = true
					if not fired
						for abilityB in @abilitiesArray
							if abilityB.uniqeID isnt ability.uniqeID
								if common.collision_detect_ability ability, abilityB
									ability.model.state = ability.model.states.fire
				when 'fire'
					@handleAbility_fire ability



	handleAbility_move: (ability, x) ->
		common.handle.model.move ability.model, ability.direction.vector, ability.velocity
		if not ability.moveTimeout
			ability.moveTimeout = true
			setTimeout =>
				if ability.model.state.id isnt 'fire'
					ability.model.state = ability.model.states.fire
			, ability.duration.move



	handleAbility_fire: (ability) ->
		if not ability.fireTimeout
			ability.fireTimeout = true
			ability.handler @
			if ability.model.state.sound
				@soundArray.push ability.model.state.sound
				
			setTimeout =>
				common.array_remove @abilitiesArray, ability
			, ability.duration.fire



	handleCharacters: (x) ->
		for character in @characterArray
			if character
				character.model.state.time += x
				if character.model.state.time > character.model.state.duration
					character.model.state.time = 0

				for cooldown in character.cooldowns
					if cooldown
						if cooldown.value
							if cooldown.value > 0
								cooldown.value -= x
							if cooldown.value < 0
								cooldown.value = 0

				for graphicEffect in character.graphicEffects
					graphicEffect.model.state.time += x
					if graphicEffect.model.state.time > graphicEffect.model.state.duration
						graphicEffect.model.state.time = 0

				character.onwater.model.state.time += x
				if character.onwater.model.state.time > character.onwater.model.state.duration
					character.onwater.model.state.time = 0

				switch character.model.state.id
					when 'move'
						move = true
						if common.collision_detect_walkZone character, @level
							move = false
						else
							for characterB in @characterArray
								if characterB.ClientID isnt character.ClientID
									if common.collision_detect_character character, characterB
										move = false
						if move
							common.handle.model.move character.model, character.direction.vector, character.velocity
					
					when 'ability'
						if character.abilityID
							ability = Assets[character.abilityID]()
							ability.uniqeID = @temp.uniqeAbilityIDCounter
							@temp.uniqeAbilityIDCounter++
							ability.caster = character
							character.cooldowns[character.cooldownID] =
								value: ability.cooldown
								time: ability.cooldown
							if ability.type isnt 'effect'
								ability.castPoint = [ability.model.x, ability.model.y]
								ability.direction = 
									angle: character.direction.angle
									vector: [character.direction.vector[0], character.direction.vector[1]]
								
								ability.model.x = character.model.x
								ability.model.y = character.model.y
								common.handle.model.move ability.model, ability.direction.vector, character.model.radius
								@abilitiesArray.push ability

								if ability.model.state.sound
									@soundArray.push ability.model.state.sound
							else
								ability.handler @
								if ability.sound
									@soundArray.push ability.sound

							character.abilityID = false

				if character.hp.current <= 0
					character.dead = true
					@data.round.array[@data.round.current].deadArray.push character.ClientID
					@checkEnd()


	handleCharacters_spawn: ->
		for character, i in @characterArray
			character.model.state = character.model.states.stand
			character.hp.current = character.hp.max
			character.dead = false
			character.model.x = @level.spawnLocations[i].x
			character.model.y = @level.spawnLocations[i].y
		


	handleLevel: (x) ->
		@level.ground.state.time += x
		if @level.ground.state.time > @level.ground.state.duration
			@level.ground.state.time = 0

		@level.water.state.time += x
		if @level.water.state.time > @level.water.state.duration
			@level.water.state.time = 0

		#dmg
		for character in @characterArray
			if not (Math.pow(character.model.x - @level.safeZone.cx, 2) / Math.pow(@level.safeZone.rx, 2) + Math.pow(character.model.y+character.model.radius - @level.safeZone.cy, 2) / Math.pow(@level.safeZone.ry, 2) <= 1)
				character.onwater.flag = true
				character.hp.current = character.hp.current - 25*x/1000
			else
				character.onwater.flag = false
		


	massDelivery: ->
		for character in @characterArray
			@GameManager.Server.IO.send @GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID,
				header: 'massDelivery'
				GameObject: @getGameObject()
					

		@soundArray = []
			


class CRound
	constructor: (options) ->
		{@number} = options
		@status = 'prepair'
		@deadArray = []
		@time = 0
		@statistic = {}
		@duration =
			prepair: 10000
			fight: 30000



module.exports = CGameObject