common = require './common'

class CLevel
	constructor: (options) ->
		{@id, @width, @height, @safeZone, @walkZone, @spawnLocations} = options
		@ground =
			state:
				time: 0
				duration: 1000
		@water =
			state:
				time: 0
				duration: 1000

class CModel
	constructor: (options) ->
		{@id, @state, @states, @radius} = options
		@x = 0 
		@y = 0
		@state = @states[@state]

class CState
	constructor: (options) ->
		{@id, @duration, @index, @state, @sound, @flat} = options
		@time = 0

class CAbility
	constructor: (options) ->
		{@id, @cooldown, @duration, @delay, @range, @velocity, @radius, @model, @effects, @handler} = options
		if @duration
			if @duration.move
				@type = 'range'
			else
				@type = 'meele'
		else
			@type = 'effect'
			@sound = options.sound

class CEffect
	constructor: (options) ->
		{@type, @target, @data} = options

class CSound
	constructor: (options) ->
		{@id} = options
	


#----------------------------------------------

Assets =
	level0: ->
		return new CLevel
			id: 'level0'
			width:  3000
			height: 3000
			walkZone: [ [500, 500], [2500, 2500] ]
			safeZone:
				cx: 1500
				cy: 1500
				rx: 600
				ry: 300
			spawnLocations: [ { x: 1400, y: 1400 } , { x: 1500, y: 1600 } , { x: 1600, y: 1400 } ]

	water_GraphicEffect: ->
		return new CModel
			id: 'water_GraphicEffect'
			radius: 50
			state: 'state1'
			states:
				state1: new CState
					id: 'state1'
					index: 0
					duration: 1000

	modelA: ->
		return new CModel
			id: 'modelA'
			radius: 50
			state: 'stand'
			states:
				stand: new CState
					id: 'stand'
					index: 0
					duration: 1000
				move: new CState
					id: 'move'
					index: 1
					duration: 500
				ability: new CState
					id: 'ability'
					index: 2
					duration: 500

	modelB: ->
		return new CModel
			id: 'modelB'
			radius: 50
			state: 'stand'
			states:
				stand: new CState
					id: 'stand'
					index: 0
					duration: 1000
				move: new CState
					id: 'move'
					index: 1
					duration: 500
				ability: new CState
					id: 'ability'
					index: 2
					duration: 500


	twirl: ->
		return new CAbility
			id: 'twirl'
			delay: 0
			cooldown: 2000
			duration: 
				fire: 500
			range: 150
			radius: 75
			model: new CModel
				id: 'twirl'
				radius: 75
				flat: true
				state: 'fire'
				states:
					fire: new CState
						id: 'fire'
						index: 0
						duration: 1000
						sound: new CSound
							id: 'ability_twirl_fire'
			effects: [
				new CEffect
					type: 'HOT'
					target: 'caster'
					data:
						value: 5
						delay: 50
						duration: 1000
				new CEffect
					type: 'damage'
					target: 'target'
					data:
						type: 'pure'
						value: 25
				new CEffect
					type: 'knockback'
					target: 'target'
					data:
						value: 50
						duration: 250
				]
			handler: (GameObject) ->
				console.log 'twirl handler'
				for effect in @effects
					effect.abilityID = @id
					if effect.target is 'caster'			#for caster
						common.handle.ability[effect.type]
							abilityID: @id
							caster: @caster
							target: @caster
							effect: effect

				for target in GameObject.characterArray
					if @caster.ClientID isnt target.ClientID
						angle = common.math.vector_angle common.math.vector_normalize([target.model.x-@model.x, target.model.y-@model.y]), @direction.vector
						distance = common.get_distance_between_objects(@, target)
						if distance <= @range and angle <= @radius
							for effect in @effects
								effect.abilityID = @id
								if effect.target is 'target'
									common.handle.ability[effect.type]
										ability: @
										caster: @caster
										target: target
										effect: effect
	firebolt: ->
		return new CAbility
			id: 'firebolt'
			delay: 0
			cooldown: 1000
			duration: 
				move: 1500
				fire: 500
			velocity: 5
			range: 125
			model: new CModel
				id: 'firebolt'
				radius: 50
				state: 'move'
				states:
					move: new CState
						id: 'move'
						index: 0
						duration: 500
						sound: new CSound
							id: 'ability_firebolt_move'
					fire: new CState
						id: 'fire'
						flat: true
						index: 1
						duration: 500
						sound: new CSound
							id: 'ability_firebolt_fire'
			effects: [
				new CEffect
					type: 'damage'
					target: 'target'
					data:
						type: 'magic'
						value: 10
				new CEffect
					type: 'DOT'
					target: 'target'
					data:
						type: 'magic'
						value: 10
						delay: 100
						duration: 1000
				new CEffect
					type: 'knockback'
					target: 'target'
					data:
						value: 50
						duration: 250
				new CEffect
					type: 'graphicEffect'
					target: 'target'
					data:
						id: 'firebolt_GraphicEffect'
						type: 'front'
						model: new CModel
							id: 'firebolt_GraphicEffect'
							radius: 50
							state: 'state1'
							states:
								state1: new CState
									id: 'state1'
									index: 0
									duration: 250
						duration: 1000
				]
			handler: (GameObject) ->
				console.log 'firebolt handler'
				for effect in @effects
					effect.abilityID = @id
					if effect.target is 'caster'			#for caster
						common.handle.ability[effect.type]
							abilityID: @id
							caster: @caster
							target: @caster
							effect: effect

				for target in GameObject.characterArray
					if @caster.ClientID isnt target.ClientID
						angle = common.math.vector_angle common.math.vector_normalize([target.model.x-@model.x, target.model.y-@model.y]), @direction.vector
						distance = common.get_distance_between_objects(@, target)
						if distance <= @range
							for effect in @effects
								effect.abilityID = @id
								if effect.target is 'target'
									common.handle.ability[effect.type]
										ability: @
										caster: @caster
										target: target
										effect: effect

	fadebolt: ->
		return new CAbility
			id: 'fadebolt'
			delay: 0
			cooldown: 1000
			duration: 
				move: 1500
				fire: 500
			velocity: 5
			range: 125
			model: new CModel
				id: 'fadebolt'
				radius: 50
				state: 'move'
				states:
					move: new CState
						id: 'move'
						index: 0
						duration: 500
						sound: new CSound
							id: 'ability_fadebolt_move'
					fire: new CState
						id: 'fire'
						flat: true
						index: 1
						duration: 500
						sound: new CSound
							id: 'ability_fadebolt_fire'
			effects: [
				new CEffect
					type: 'damage'
					target: 'target'
					data:
						type: 'magic'
						value: 15
				new CEffect
					type: 'knockback'
					target: 'target'
					data:
						value: 50
						duration: 250
				]
			handler: (GameObject) ->
				console.log 'fadebolt handler'
				for effect in @effects
					effect.abilityID = @id
					if effect.target is 'caster'			#for caster
						common.handle.ability[effect.type]
							abilityID: @id
							caster: @caster
							target: @caster
							effect: effect

				for target in GameObject.characterArray
					if @caster.ClientID isnt target.ClientID
						angle = common.math.vector_angle common.math.vector_normalize([target.model.x-@model.x, target.model.y-@model.y]), @direction.vector
						distance = common.get_distance_between_objects(@, target)
						if distance <= @range
							for effect in @effects
								effect.abilityID = @id
								if effect.target is 'target'
									common.handle.ability[effect.type]
										ability: @
										caster: @caster
										target: target
										effect: effect


	shield: ->
		return new CAbility
			id: 'shield'
			delay: 0
			cooldown: 10000
			sound: new CSound
				id: 'ability_shield'
			effects: [
				new CEffect
					type: 'shield'
					target: 'caster'
					data:
						duration: 5000
				new CEffect
					type: 'graphicEffect'
					target: 'caster'
					data:
						id: 'shield_GraphicEffect'
						type: 'front'
						model: new CModel
							id: 'shield_GraphicEffect'
							radius: 50
							state: 'state1'
							states:
								state1: new CState
									id: 'state1'
									index: 0
									duration: 1000
						duration: 5000
				]
			handler: (GameObject) ->
				console.log 'shield handler'
				for effect in @effects
					effect.abilityID = @id
					if effect.target is 'caster'			#for caster
						common.handle.ability[effect.type]
							abilityID: @id
							caster: @caster
							target: @caster
							effect: effect


	shadows: ->
		return new CAbility
			id: 'shadows'
			delay: 0
			cooldown: 10000
			sound: new CSound
				id: 'ability_shadows'
			effects: [
				new CEffect
					type: 'effect'
					target: 'caster'
					data:
						value: 'invisibility'
						duration: 5000
				]
			handler: (GameObject) ->
				console.log 'shadows handler'
				for effect in @effects
					effect.abilityID = @id
					if effect.target is 'caster'			#for caster
						common.handle.ability[effect.type]
							abilityID: @id
							caster: @caster
							target: @caster
							effect: effect


module.exports = Assets



'''


skill1: ->
		return new CAbility
			id: 'skill1'
			delay: 0
			cooldown: 2
			duration: 
				fire: 500
			range: 150
			radius: 45
			model: new CModel
				id: 'skill1'
				radius: 50
				flat: true
				state: 'fire'
				states:
					fire: new CState
						id: 'fire'
						index: 0
						duration: 1000
						sound: new CSound
							id: 'skill1_fire'
			effects: [
				new CEffect
					type: 'damage'
					target: 'caster'
					data:
						type: 'pure'
						value: 50
				new CEffect
					type: 'heal'
					target: 'caster'
					data:
						value: 50
				new CEffect
					type: 'damage'
					target: 'target'
					data:
						type: 'pure'
						value: 50
				new CEffect
					type: 'heal'
					target: 'target'
					data:
						value: 50
				new CEffect
					type: 'DOT'
					target: 'caster'
					data:
						type: 'magic'
						value: 50
						delay: 100
						duration: 1000
				new CEffect
					type: 'HOT'
					target: 'caster'
					data:
						value: 37.5
						delay: 50
						duration: 1000
				new CEffect
					type: 'DOT'
					target: 'target'
					data:
						type: 'magic'
						value: 50
						delay: 100
						duration: 1000
				new CEffect
					type: 'HOT'
					target: 'target'
					data:
						value: 37.5
						delay: 50
						duration: 1000
				new CEffect
					type: 'buff'
					target: 'caster'
					data:
						value:
							hp: 100
						duration: 1000
				new CEffect
					type: 'buff'
					target: 'target'
					data:
						value:
							hp: 100
						duration: 1000
				new CEffect
					type: 'debuff'
					target: 'caster'
					data:
						value:
							hp: 100
						duration: 1000
				new CEffect
					type: 'debuff'
					target: 'target'
					data:
						value:
							hp: 100
						duration: 1000
				new CEffect
					type: 'effect'
					target: 'caster'
					data:
						value: 'stun'
						duration: 1000
				new CEffect
					type: 'effect'
					target: 'target'
					data:
						value: 'silence'
						duration: 1000
				new CEffect
					type: 'effect'
					target: 'caster'
					data:
						value: 'root'
						duration: 2000
				new CEffect
					type: 'absorb'
					target: 'caster'
					data:
						type: 'magic'
						value: 50
						duration: 3000
				new CEffect
					type: 'immunity'
					target: 'caster'
					data:
						type: 'magic'
						duration: 1500
				new CEffect
					type: 'shield'
					target: 'caster'
					data:
						duration: 10000
				new CEffect
					type: 'effect'
					target: 'caster'
					data:
						value: 'invisibility'
						duration: 5000
				new CEffect
					type: 'graphicEffect'
					target: 'caster'
					data:
						id: 'skill1GraphicEffect'
						type: 'front'
						model: new CModel
							id: 'front'
							radius: 75
							state: 'fire'
							states:
								fire: new CState
									id: 'fire'
									index: 0
									duration: 500
						duration: 1000
				new CEffect
					type: 'graphicEffect'
					target: 'caster'
					data:
						type: 'double'
						model: new CModel
							id: 'front'
							radius: 100
							state: 'fire'
							states:
								fire: new CState
									id: 'fire'
									index: 0
									duration: 500
						duration: 2000
				new CEffect
					type: 'knockback'
					target: 'target'
					data:
						value: 50
						duration: 500
				]
			handler: (GameObject) ->
				console.log 'skill1 handler'
				for effect in @effects
					if effect.target is 'caster'			#for caster
						common.handle.ability[effect.type]
							abilityID: @id
							caster: @caster
							target: @caster
							effect: effect

				for target in GameObject.characterArray
					if @caster.ClientID isnt target.ClientID
						angle = common.math.vector_angle common.math.vector_normalize([target.model.x-@model.x, target.model.y-@model.y]), @direction.vector
						distance = common.get_distance_between_objects(@, target)
						if distance <= @range and angle <= @radius
							for effect in @effects
								if effect.target is 'target'
									common.handle.ability[effect.type]
										ability: @
										caster: @caster
										target: target
										effect: effect


'''