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
    shuffled = shuffle @replies.slice(0)
    rep = @getReply question, shuffled
    if @isInReplyHistory(rep.reply)
      shuffled.splice(rep.count, 1)
      @lastReply = @getRandomReply shuffled
    else
      @lastReply = rep.reply

    @addToHistory @lastReply
    return @lastReply

  addToHistory: (reply)->
    if @replyHistory.length == 1 then @replyHistory.pop()
    @replyHistory.push @lastReply

  isInReplyHistory: (reply)->
    for rep in @replyHistory
      if rep is reply then return true
    return false

  getReply: (question, shuffled)->
    @closestDistance = 999
    question = @formatSentence question
    rep = ""
    for reply, count in shuffled
      distance = leven.get @formatSentence(reply), question
      if distance is 0
        ran = @getRandomReplyWithExclusion count
        return {
          reply: ran
          count: count
        }
      if distance < @closestDistance
        @closestDistance = distance
        rep = {
          reply: reply
          count: count
        }
    return rep

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
