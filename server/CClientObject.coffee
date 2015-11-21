class CClientObject
	constructor: (options) ->
		{@id, @password} = options
		@status = 'offlane'



module.exports = CClientObject