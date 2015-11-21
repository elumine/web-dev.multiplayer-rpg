common =
	math:
		radToDeg: (x) ->
			return x*180/Math.PI

		degToRad: (x) ->
			return x*Math.PI/180

		vector_angle: (A, B) ->
			angle_cos = A[0]*B[0]+A[1]*B[1]
			angle_rad = Math.acos angle_cos
			return common.math.radToDeg angle_rad

		vector_length: (v) ->
			return Math.pow(Math.pow(v[0], 2)+Math.pow(v[1], 2), 0.5)
			
		vector_normalize: (v) ->
			return [ v[0]/Math.pow(Math.pow(v[0], 2)+Math.pow(v[1], 2), 0.5), v[1]/Math.pow(Math.pow(v[0], 2)+Math.pow(v[1], 2), 0.5) ]

		vector_projection: (A, B) ->
			return A[0]*B[0]+A[1]*B[1]

		vector_rotation: (v, A) ->
			sinA = Math.sin(common.math.degToRad(A))
			cosA = Math.cos(common.math.degToRad(A))
			x_ = v[0] * cosA - v[1] * sinA
			y_ = v[0] * sinA + v[1] * cosA

			return [x_, y_]  
			
	handle:
		character:
			effect: (character, effect) ->
				common.array_add_chain character.effects, effect, effect.data.duration

		model:
			move: (model, vd, value) ->
				model.x += value*vd[0]
				model.y += value*vd[1]

		ability:
			damage: (options) ->
				#console.log '+++ handle damage' 
				switch options.effect.data.type
					when 'magic'
						resistK = (100 - options.target.resist.magic)/100
					when 'pure'
						resistK = 1
					
				value = options.effect.data.value*resistK

				if options.target.immunity[options.effect.data.type]
					value = 0
				else
					if options.target.absorb[options.effect.data.type] >= value
						options.target.absorb[options.effect.data.type] -= value
						value = 0
					else if options.target.absorb[options.effect.data.type] > 0 and options.target.absorb[options.effect.data.type] < value
						options.target.absorb[options.effect.data.type] = 0
						value -= options.target.absorb[options.effect.data.type]

				options.target.hp.current -= value

			heal: (options) ->
				common.deal_heal options.target, options.effect.data.value

			DOT: (options) ->
				#console.log '+++ handle DOT'
				switch options.effect.data.type
					when 'magic'
						resistK = (100 - options.target.resist.magic)/100
					when 'pure'
						resistK = 1

				step = 0
				steps = options.effect.data.duration/options.effect.data.delay
				DOT_interval = setInterval =>
					value = options.effect.data.value*resistK/steps
					if options.target.immunity[options.effect.data.type]
						value = 0
					else
						if options.target.absorb[options.effect.data.type] >= value
							options.target.absorb[options.effect.data.type] -= value
							value = 0
						else if options.target.absorb[options.effect.data.type] > 0 and options.target.absorb[options.effect.data.type] < value
							options.target.absorb[options.effect.data.type] = 0
							value -= options.target.absorb[options.effect.data.type]

					options.target.hp.current -= value
					step++
					if step >= steps
						clearInterval DOT_interval
				, options.effect.data.delay

				common.handle.character.effect options.target, options.effect

			HOT: (options) ->
				#console.log '+++ handle HOT'

				step = 0
				steps = options.effect.data.duration/options.effect.data.delay
				DOT_interval = setInterval =>
					common.deal_heal options.target, options.effect.data.value/steps
					step++
					if step >= steps
						clearInterval DOT_interval
				, options.effect.data.delay

				common.handle.character.effect options.target, options.effect

			buff: (options) ->
				#console.log '+++ handle buff'
				
				for k, v of options.effect.value
					options.target[k] += v
					setTimeout =>
						options.target[k] -= v
					, options.effect.data.duration

				common.handle.character.effect options.target, options.effect

			debuff: (options) ->
				#console.log '+++ handle debuff' 
				
				for k, v of options.effect.value
					options.target[k] -= v
					setTimeout =>
						options.target[k] += v
					, options.effect.data.duration

				common.handle.character.effect options.target, options.effect

			effect: (options) ->
				#console.log '+++ handle effect', options.effect.data.value
				
				options.target[options.effect.data.value] = true
				setTimeout =>
					options.target[options.effect.data.value] = false					
				, options.effect.data.duration

				common.handle.character.effect options.target, options.effect

			graphicEffect: (options) ->
				#console.log '+++ handle graphicEffect', options.effect.data.id
				common.array_add_chain options.target.graphicEffects, {id: options.effect.data.id, type: options.effect.data.type, model: options.effect.data.model}, options.effect.data.duration


			knockback: (options) ->
				if options.ability.type is 'meele'
					vd = options.caster.direction.vector
				else if options.ability.type is 'range'
					vd = common.math.vector_normalize [options.target.model.x - options.ability.model.x, options.target.model.y - options.ability.model.y]

				step = 0
				steps = options.effect.data.duration/20
				#console.log '+++ handle knockback', options.ability.type, 'vd:', vd, 'value: ', options.effect.data.value, 'steps: ', steps

				knockback_interval = setInterval =>
					options.target.model.x += parseInt(vd[0]*options.effect.data.value/steps)
					options.target.model.y += parseInt(vd[1]*options.effect.data.value/steps)
					#common.handle.model.move options.target.model, vd, options.effect.data.value/steps
					step++
					if step >= steps
						clearInterval knockback_interval
				, 20

				common.handle.character.effect options.target, options.effect

			absorb: (options) ->
				options.target.absorb[options.effect.data.type] += options.effect.data.value
				setTimeout =>
					if options.target.absorb[options.effect.data.type] >= options.effect.data.value
						options.target.absorb[options.effect.data.type] -= options.effect.data.value
					else if options.target.absorb[options.effect.data.type] > 0 and options.target.absorb[options.effect.data.type] < options.effect.data.value
						options.target.absorb[options.effect.data.type] = 0
				, options.effect.data.duration

				common.handle.character.effect options.target, options.effect

			immunity: (options) ->
				options.target.immunity[options.effect.data.type] = true
				setTimeout =>
					options.target.immunity[options.effect.data.type] = false
				, options.effect.data.duration

				common.handle.character.effect options.target, options.effect
			
			shield: (options) ->
				options.target.shield = true
				setTimeout =>
					options.target.shield = false
				, options.effect.data.duration

				common.handle.character.effect options.target, options.effect

			rebound: (ability, target) ->
				collisionPoint = [ability.model.x + ability.model.radius * ability.direction.vector[0], ability.model.y + ability.model.radius * ability.direction.vector[1]]
				normal_vector = [ability.model.x - target.model.x, ability.model.y - target.model.y]
				fall_vector = [ability.castPoint[0] - ability.model.x, ability.castPoint[1] - ability.model.y]
				normal_vector = common.math.vector_normalize normal_vector
				fall_vector = common.math.vector_normalize fall_vector
				fall_angle = common.math.vector_angle fall_vector, normal_vector

				if normal_vector[1] >= 0
					if normal_vector[0] >= 0																					#II
						if ability.castPoint[0] <= collisionPoint[0]																#left
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'II, left, top, -1'
								fall_angle *= -1
							else																										#bottom
								console.log 'II, left, bottom, -1'
								fall_angle *= -1
						else																										#right
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'II, right, top, 1'
								fall_angle *= 1
							else																									#bottom
								console.log 'II, right, bottom, 1'
								fall_angle *= 1
					else 																										#III
						if ability.castPoint[0] <= collisionPoint[0]																#left
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'III, left, top, -1'
								fall_angle *= -1
							else																										#bottom
								console.log 'III, left, bottom, -1'
								fall_angle *= -1
						else																										#right
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'III, right, top, 1'
								fall_angle *= -1
							else																										#bottom
								console.log 'III, right, bottom, 1'
								fall_angle *= 1
				else
					if normal_vector[0] >= 0																					#I
						if ability.castPoint[0] <= collisionPoint[0]																#left
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'I, left, top, 1'
								fall_angle *= 1
							else																										#bottom
								console.log 'I, left, bottom, 1'
								fall_angle *= 1
						else																										#right
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'I, right, top, -1'
								fall_angle *= -1
							else																										#bottom
								console.log 'I, right, bottom, -1'
								fall_angle *= -1
					else 																										#IV
						if ability.castPoint[0] <= collisionPoint[0]																#left
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'IV, left, top, 1'
								fall_angle *= 1
							else																										#bottom
								console.log 'IV, left, bottom, 1'
								fall_angle *= 1
						else																										#right
							if ability.castPoint[1] <= collisionPoint[1]																#top
								console.log 'IV, right, top, -1'
								fall_angle *= -1
							else																										#bottom
								console.log 'IV, right, bottom, -1'
								fall_angle *= -1

				rebound_vector = common.math.vector_rotation fall_vector, 2* fall_angle
				ability.direction.vector = rebound_vector
				
				newAngle = common.math.vector_angle ability.direction.vector, [1, 0]
				if ability.direction.vector[1] < 0
					newAngle = 360 - newAngle
				console.log ability.direction.angle, newAngle
				ability.direction.angle = newAngle

				ability.caster = target
				ability.castPoint = collisionPoint

	array_add_chain: (array, element, time) ->
		array.push element
		setTimeout ->
			common.array_remove(array, element)
		, time

	array_remove: (array, element) ->
		if array.indexOf(element) >= 0
			array.splice array.indexOf(element), 1


	collision_detect_safeZone: (character, level) ->
		#

	collision_detect_walkZone: (character, level) ->
		x1 = character.model.x + character.velocity * character.direction.vector[0]
		y1 = character.model.y + character.velocity * character.direction.vector[1]

		if x1 < level.walkZone[0][0] or x1 > level.walkZone[1][0] or y1 < level.walkZone[0][1] or y1 > level.walkZone[1][1]
			return true
		else
			return false
			
	collision_detect_ability: (a, b) ->
		x1 = a.model.x + a.velocity * a.direction.vector[0]
		y1 = a.model.y + a.velocity * a.direction.vector[1]
		x2 = b.model.x
		y2 = b.model.y
		length = common.math.vector_length [x2 - x1, y2 - y1]
		return length < (a.model.radius + b.model.radius)

	collision_detect_character: (a, b) ->
		x1 = a.model.x + a.velocity * a.direction.vector[0]
		y1 = a.model.y + a.velocity * a.direction.vector[1]
		k = 0
		if b.model.state.id is 'move'
			k = 1
		x2 = b.model.x + a.velocity * a.direction.vector[0] * k
		y2 = b.model.y + a.velocity * a.direction.vector[0] * k
		length = common.math.vector_length [x2 - x1, y2 - y1]
		return length < (a.model.radius + b.model.radius)
		
	get_distance_between_objects: (a, b) ->
		AB = [a.model.x-b.model.x, a.model.y-b.model.y]
		return common.math.vector_length(AB)

	deal_heal: (target, value) ->
		hp_difference = target.hp.max - target.hp.current
		if value >= hp_difference
			target.hp.current = target.hp.max
		else
			target.hp.current += value

module.exports = common