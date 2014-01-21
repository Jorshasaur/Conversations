leven = require 'fast-levenshtein'

class Character
	constructor: ->
		@buildReplies()

	buildReplies: ->
		@replies = []
		@replies.push "I have no idea."
		@replies.push "You should think more on that."
		@replies.push "That doesn't make any sense, please elaborate."
		@replies.push "Really?  That doesn't sound right."

	ask: (question)->
		closestReply = ""
		@closestDistance = 999
		question = @formatSentence question
		for reply in @replies
			distance = leven.get @formatSentence(reply), question
			if distance < @closestDistance
				@closestDistance = distance
				closestReply = reply
		return closestReply

	formatSentence: (sentence)->
		sentence = @stripCharacters sentence
		return sentence.toLowerCase()

	stripCharacters: (sentence)->
		return sentence.replace /[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""

module.exports = Character
