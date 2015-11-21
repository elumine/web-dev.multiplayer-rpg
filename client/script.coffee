$(window).load ->

	window.Client = new CClient
		ClientManager: new CClientManager()
		GameManager: new CGameManager()
		InputController: new CInputController()
		UI: new CUI()
		GraphicEngine: new CGraphicEngine
			canvas: $('#canvas')[0]
		IO: new CIO()

	$('#scaleRange').bind 'input', ->
		Client.GraphicEngine.camera.width = $('#scaleRange').val()
		Client.GraphicEngine.camera.height = $('#scaleRange').val()/2