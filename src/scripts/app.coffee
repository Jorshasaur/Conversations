$ = require '../../dist/vendor/jquery/jquery.js'
Spock = require './characters/spock.coffee'
Veronica = require './characters/veronica.coffee'
Swanson = require './characters/swanson.coffee'

$(document).ready ->
	@spock = new Spock()
	@veronica = new Veronica()
	@swanson = new Swanson()
	random = @swanson.random()
	ranVeronica = @veronica.ask random
	console.log "Ron Swanson::", random
	console.log "Veronica Palmer::", ranVeronica
	console.log "Spock::", @spock.ask random
