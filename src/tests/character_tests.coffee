assert = require 'assert'
Character = require '../scripts/characters/character.coffee'

describe "Character tests", ->
	beforeEach ->
		@character = new Character()

	it "should find a distance of zero for 'I have no idea' when that is the question.", ->
		@character.ask "I have no idea."
		assert.equal @character.closestDistance, 0
	
	it "should find a distance of zero for 'I have no idea' when that is the question with no punctuation.", ->
		@character.ask "I have no idea"
		assert.equal @character.closestDistance, 0	

	it "should find a distance of zero for 'I have no idea' when that is the question with differing punctuation.", ->
		@character.ask "I have no idea!!!"
		assert.equal @character.closestDistance, 0	
	
	it "should find a distance of zero for 'I have no idea' when that is the question with differing cases.", ->
		@character.ask "I HAVE NO IDEA."
		assert.equal @character.closestDistance, 0	

	it "should answer 'I have no idea.' to 'What are you wearing today?'", ->
		answer = @character.ask "What are you wearing today?"
		assert.equal answer, "I have no idea."

	it "should not have a distance 0 to 'What are you wearing today?'", ->
		@character.ask "What are you wearing today?"
		assert.notEqual @character.closestDistance, 0

	it "should answer 'You should think more on that.' to 'I should think more about rabbits.'", ->
		answer = @character.ask "I should think about more rabbits."
		assert.equal answer, "You should think more on that."