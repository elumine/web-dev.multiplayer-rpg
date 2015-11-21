require = (url) ->
		script = document.createElement 'script'
		script.type = 'text/javascript'
		script.src = 'client/'+url+'.js'
		document.getElementsByTagName('head')[0].appendChild script 

require 'CClient'
require 'CClientManager'
require 'CGameManager'
require 'CInputController'
require 'CGraphicEngine'
require 'CSprite'
require 'CUI'
require 'CIO'
require 'common'
require 'localization'