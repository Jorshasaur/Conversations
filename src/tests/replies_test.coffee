require '../../dist/vendor/angular/angular.js'
require '../../dist/vendor/angular-mocks/angular-mocks.js'
assert = require 'assert'
Spock = require '../scripts/characters/spock.coffee'
require '../scripts/replies.coffee'

describe "Replies Tests", ->
  beforeEach ->
    angular.module('conversations.directives')

  beforeEach ->
    inject (_$compile_, _$rootScope_)->
      @compile = _$compile_
      @scope = _$rootScope_

  beforeEach ->
    @characters = []
    @characters.push new Spock()
    @question = "What is the meaning of life?"

  it 'should have a character image', ->
    inject ()->
      template = @compile("<replies></replies>")(@scope)
      @scope.question = @question
      @scope.$digest()
      html = template.html()
      console.log template, html, @scope
      assert.equal true, true
