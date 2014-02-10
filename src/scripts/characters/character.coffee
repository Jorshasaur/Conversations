leven = require 'fast-levenshtein'

class Character
  constructor: (@name, @image)->
    @replies = []
    @buildReplies()
    @lastReply = ""

  buildReplies: ->
    @replies.push "I have no idea."
    @replies.push "You should think more on that."
    @replies.push "That doesn't make any sense, please elaborate."
    @replies.push "Really?  That doesn't sound right."

  ask: (question)->
    @closestDistance = 999
    question = @formatSentence question
    shuffled = shuffle @replies.slice(0)
    for reply, count in shuffled
      distance = leven.get @formatSentence(reply), question
      if distance is 0
        @lastReply = @getRandomReplyWithExclusion count
        @oldestReply = @lastReply
        return @lastReply
      if distance < @closestDistance
        @closestDistance = distance
        @lastReply = reply
    return @lastReply

  getRandomReplyWithExclusion: (index)->
    clone = @cloneReplies()
    clone.splice index, 1
    return @getRandomReply clone

  getRandomReply: (array)->
    rand = Math.round(Math.random() * (array.length-1))
    return array[rand]

  random: ->
    @lastReply = @getRandomReply @replies
    return @lastReply

  formatSentence: (sentence)->
    sentence = @stripCharacters sentence
    return sentence.toLowerCase()

  stripCharacters: (sentence)->
    return sentence.replace /[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""

  cloneReplies: ->
    return @replies.slice(0)

  shuffle = (arr, required=arr.length) ->
      randInt = (n) -> Math.floor n * Math.random()
      required = arr.length if required > arr.length
      return arr[randInt(arr.length)] if required <= 1

      for i in [arr.length - 1 .. arr.length - required]
        index = randInt(i+1)
        [arr[index], arr[i]] = [arr[i], arr[index]]

      arr[arr.length - required ..]

module.exports = Character
