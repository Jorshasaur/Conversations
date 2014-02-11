Character = require "./character.coffee"

class MichaelScott extends Character

  constructor: ->
    super
    @name = "Michael Scott"
    @image = "images/scott.jpg"

  buildReplies: ->
    @replies.push "I am dead inside."
    @replies.push "Where are the turtles!"
    @replies.push "The worst thing about prison was -- was the Dementors"
    @replies.push "Welcome back jerky jerk face."
    @replies.push "Sometimes I'll start a sentence and I don't know where it's going.  I just hope I find it along the way."
    @replies.push "Occasionally, I'll hit someone with my car.  So sue me."
    @replies.push "If I had a gun with two bullets and I was in a room with Hitler, Bin Laden, and Toby, I would shoot Toby twice."
    @replies.push "Should have burned this place down when I had the chance."
    @replies.push "Well just tell him to call me ASAP as possible."
    @replies.push "Well happy birthday Jesus.  Sorry your party is so lame."
    @replies.push "It's a good thing Russia doesn't exist anymore."
    @replies.push "I will literally kill you and your entire family."
    @replies.push "And you know what's going to be on your tombstone? Loser."
    @replies.push "I want people to be afraid of how much they love me."
    @replies.push "You don't know me, you've just seen my penis."
    @replies.push "Do you think that doing alcohol is cool?"
    @replies.push "That's what she said."
    @replies.push "I DECLARE BANKRUPTCY!!!!"
    @replies.push "I'm not superstitious but I am a little stitious."
    @replies.push "I like waking up to the smell of bacon."
    @replies.push "Big butt.  Bigger heart."
    @replies.push "You just gots to get your freak on."
    @replies.push "We're all homos.  Homo Sapiens."
    @replies.push "If a baby were president, there would be no taxes.  There would be no war."

module.exports = MichaelScott