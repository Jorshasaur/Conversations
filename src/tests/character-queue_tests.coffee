assert = require 'assert'
CharacterQueue = require '../scripts/characters/character-queue.coffee'
Spock = require '../scripts/characters/spock.coffee'
Swanson = require '../scripts/characters/swanson.coffee'
Veronica = require '../scripts/characters/veronica.coffee'

describe "Character Queue", ->
	beforeEach ->
		@queue = new CharacterQueue()
		@queue.addCharacter new Spock
		@queue.addCharacter new Swanson
		@queue.addCharacter new Veronica

	it "should have 3 characters when characters are added.", ->
		assert.equal @queue.characters.length, 3

	it "should have a length of 2 when one is removed using next.", ->
		@queue.next()
		assert.equal @queue.characters.length, 2		

	it "should have return 0 when all of the characters are removed.", ->
		@queue.next()
		@queue.next()
		@queue.next()
		assert.equal @queue.next(), 0	

	it "should have a length of 3 when next is run 3 times and then reset is called", ->
		@queue.next()			
		@queue.next()
		@queue.next()
		@queue.reset()
		assert.equal @queue.characters.length, 3