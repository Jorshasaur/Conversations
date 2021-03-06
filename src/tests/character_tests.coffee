assert = require 'assert'
Character = require '../scripts/characters/character.coffee'

describe "Character tests", ->
  beforeEach ->
    @character = new Character()

  it "should not find a distance of zero for 'I have no idea' when that is the question.", ->
    @character.ask "I have no idea."
    assert.notEqual @character.closestDistance, 0

  it "should not find a distance of zero for 'I have no idea' when that is the question with no punctuation.", ->
    @character.ask "I have no idea"
    assert.notEqual @character.closestDistance, 0

  it "should not find a distance of zero for 'I have no idea' when that is the question with differing punctuation.", ->
    @character.ask "I have no idea!!!"
    assert.notEqual @character.closestDistance, 0

  it "should not find a distance of zero for 'I have no idea' when that is the question with differing cases.", ->
    @character.ask "I HAVE NO IDEA."
    assert.notEqual @character.closestDistance, 0

  it "should answer 'I have no idea.' to 'What are you wearing today?'", ->
    answer = @character.ask "What are you wearing today?"
    assert.equal answer, "I have no idea."

  it "should not have a distance 0 to 'What are you wearing today?'", ->
    @character.ask "What are you wearing today?"
    assert.notEqual @character.closestDistance, 0

  it "should answer 'You should think more on that.' to 'I should think more about rabbits.'", ->
    answer = @character.ask "I should think about more rabbits."
    assert.equal answer, "You should think more on that."

  it "should not give the same answer immediately for the same question", ->
    question = "I should think about more rabbitss."
    answer = @character.ask question
    answer2 = @character.ask question
    assert.notEqual answer, answer2

  it "should not give the same answer for the last 3 questions", ->
    question = "I should think about more rabbits.."
    answer = @character.ask question
    answer2 = @character.ask question
    answer3 = @character.ask question
    assert.notEqual answer, answer2
    assert.notEqual answer, answer3
    assert.notEqual answer2, answer3

  it "should give the first answer on the 5th question that is the same", ->
    question = "I should think about more rabbits."
    answer = @character.ask question
    @character.ask question
    @character.ask question
    @character.ask question
    answer5 = @character.ask question
    assert.equal answer, answer5
