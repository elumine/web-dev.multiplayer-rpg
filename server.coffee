CServer = require './server/CServer'
CWebServer = require './server/CWebServer'
CClientManager = require './server/CClientManager'
CModel = require './server/CModel'
CGameManager = require './server/CGameManager'
CIO = require './server/CIO'

Server = new CServer
	WebServer: new CWebServer()
	ClientManager: new CClientManager()
	GameManager: new CGameManager()
	Model: new CModel()
	IO: new CIO()