leven = require 'fast-levenshtein'

class Character
  constructor: (@name, @image)->
    @replies = []
    @buildReplies()
    @lastReply = ""
    @replyHistory = []

  buildReplies: ->
    @replies.push "I have no idea."
    @replies.push "You should think more on that."
    @replies.push "That doesn't make any sense, please elaborate."
    @replies.push "Really?  That doesn't sound right."

  ask: (question)->
    question = @formatSentence(question)
    rep = @getReply question
    return @lastReply

  addToHistory: (reply, count)->
    @replies.splice count,1
    if @replyHistory.length == 3
      toAddBack = @replyHistory.pop()
      @replies.push toAddBack
    @replyHistory.unshift reply

  getReply: (question)->
    @closestDistance = 9999
    questionLocation = 0
    question = @formatSentence question
    for reply, count in @replies
      distance = leven.get @formatSentence(reply), question
      if distance == 0
        @addToHistory(reply, count)
        return @getReply(question)
      else if distance < @closestDistance
        @closestDistance = distance
        @lastReply = reply
        questionLocation = count
    @addToHistory(@lastReply, questionLocation)
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

  shuffle: (arr, required=arr.length)->
      randInt = (n) -> Math.floor n * Math.random()
      required = arr.length if required > arr.length
      return arr[randInt(arr.length)] if required <= 1

      for i in [arr.length - 1 .. arr.length - required]
        index = randInt(i+1)
        [arr[index], arr[i]] = [arr[i], arr[index]]

      arr[arr.length - required ..]

module.exports = Character
