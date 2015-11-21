class CServer
	constructor: (options) ->
		{@WebServer, @ClientManager, @GameManager, @Model, @IO} = options
		@WebServer.Server = @
		@ClientManager.Server = @
		@GameManager.Server = @
		@Model.Server = @
		@IO.Server = @

		@ClientManager.setClientArray()



module.exports = CServer