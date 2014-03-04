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
    shuffled = @cloneReplies()
    rep = @getReply question, shuffled
    return @lastReply

  addToHistory: (reply)->
    if @replyHistory.length == 3 then @replyHistory.pop()
    @replyHistory.push @lastReply

  isInReplyHistory: (reply)->
    for rep in @replyHistory
      if rep is reply then return true
    return false

  getReply: (question, shuffled)->
    @closestDistance = 999
    question = @formatSentence question
    for reply, count in shuffled
      distance = leven.get @formatSentence(reply), question
      if distance > 0 && distance < @closestDistance && !@isInReplyHistory(reply)
        @closestDistance = distance
        @lastReply = reply
    @addToHistory(@lastReply)
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
