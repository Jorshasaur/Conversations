leven = require 'fast-levenshtein'

class Character
	constructor: ->
		@replies = []
		@buildReplies()

	buildReplies: ->
		@replies.push "I have no idea."
		@replies.push "You should think more on that."
		@replies.push "That doesn't make any sense, please elaborate."
		@replies.push "Really?  That doesn't sound right."

	ask: (question)->
		closestReply = ""
		@closestDistance = 999
		question = @formatSentence question
		for reply, count in @replies
			distance = leven.get @formatSentence(reply), question
			if distance is 0 then return @getRandomReplyWithExclusion count
			if distance < @closestDistance
				@closestDistance = distance
				closestReply = reply
		return closestReply

	getRandomReplyWithExclusion: (index)->
		clone = @cloneReplies()
		clone.splice index, 1
		return @getRandomReply clone

	getRandomReply: (array)->
		rand = Math.round(Math.random() * (array.length-1))
		return array[rand]

	random: ->
		@getRandomReply @replies

	formatSentence: (sentence)->
		sentence = @stripCharacters sentence
		return sentence.toLowerCase()

	stripCharacters: (sentence)->
		return sentence.replace /[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""

	cloneReplies: ->
		return @replies.slice(0)

module.exports = Character
