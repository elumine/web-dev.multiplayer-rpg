class CSprite
	constructor: (options) ->
		{@id, @src, @frames, @rows, @states, @directions} = options
		@image = document.createElement('img')
		@image.src = @src
		@image.onload = (event) =>
			@height = @image.height/@rows
			@width = @image.width/@frames

window.CSprite = CSprite