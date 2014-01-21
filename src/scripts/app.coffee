$ = require '../../dist/vendor/jquery/jquery.js'
Spock = require './characters/spock.coffee'
Veronica = require './characters/veronica.coffee'

$(document).ready ->
	@spock = new Spock()
	@veronica = new Veronica()
	random = @spock.random()
	console.log random
	console.log @veronica.ask random
