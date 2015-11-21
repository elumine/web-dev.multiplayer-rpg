Assets = require './Assets'

class CCharacter
	constructor: (options) ->
		{@ClientID, @model} = options
		@abilities = []
		@cooldowns = []
		@dead = false
		@velocity = 2
		@points = 0
		@direction =
			vector: [1, 0]
			angle: 0
		@hp =
			current: 100
			max: 100
		@resist =
			magic: 25
		@absorb =
			magic: 0
		@immunity =
			magic: false
		@shield = false
		@onwater =
			flag: false
			model: Assets.water_GraphicEffect()

		@effects = []
		@graphicEffects = []
		@combatText =
			damage: []


module.exports = CCharacter