assert = require 'assert'
Spock = require '../scripts/characters/spock.coffee'

describe "Spock tests", ->
  beforeEach ->
    @character = new Spock()

  it "should never answer the same answer as the question", ->
    answer = @character.ask "It is curious how often you humans manage to obtain that which you do not want."
    assert.notEqual answer, "It is curious how often you humans manage to obtain that which you do not want."

  it "should be a breaking test", ->
    assert.equal 1, 2