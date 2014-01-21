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
	$("#swanson").text "Ron Swanson, \"" + random + "\""
	$("#palmer").text "Veronica Palmer, \"" + ranVeronica + "\""
	$("#spock").text "Spock, \"" +@spock.ask(random) + "\""
