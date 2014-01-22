class CharacterQueue 

	constructor: ->
		@cache = []

	addCharacter: (character)->
		@cache.push character
		@reset()

	reset: ->
		@characters = @cache.slice(0)

	next: ->
		if @characters.length == 0 then return 0
		ran = @random()
		character = @characters[ran]
		@characters.splice ran, 1
		return character

	random: ->
		ran = Math.round(Math.random() * (@characters.length - 1))
		return ran

module.exports = CharacterQueue		
