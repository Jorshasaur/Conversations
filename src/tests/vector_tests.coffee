assert = require 'assert'
Vector = require '../scripts/vector.coffee'

describe "Vector tests", ->
	beforeEach ->
		@vector = new Vector()

	it "should have the correct name set", ->
		assert.equal @vector.name, "VECTOR!"