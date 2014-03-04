require '../../dist/vendor/angular/angular.js'

Spock = require './characters/spock.coffee'
Veronica = require './characters/veronica.coffee'
Swanson = require './characters/swanson.coffee'
MichaelScott = require './characters/scott.coffee'
CharacterQueue = require './characters/character-queue.coffee'

angular.module("conversations.directives", [])
angular.module("conversations.directives").directive "replies", ['$timeout', ($timeout)->
	
  $scope = {}
  cacheScope = (_$scope_)->
    $scope = _$scope_

  buildCharacters = ->
    spock = new Spock()
    veronica = new Veronica()
    swanson = new Swanson()
    scott = new MichaelScott()
    @queue = new CharacterQueue()
    @queue.addCharacter spock
    @queue.addCharacter veronica
    @queue.addCharacter swanson
    @queue.addCharacter scott

  askCharacters = ->
    @queue.reset()
    characters = []
    #asking = Math.round(Math.random() * (@queue.characters.length-1)) + 1
    asking = 4
    lastResponse = $scope.question
    while asking != 0
      character = @queue.next()
      if character == 0
        asking = 0
      else
        lastResponse = character.ask lastResponse
        characters.push character
        asking--

    $scope.characters = characters
    $timeout ->
      fadeInAnswers()
    , 1

  fadeInAnswers = ->
    $(".character").css("opacity", 1)

  return{
    restrict: "E"
    templateUrl: "views/replies.html"
    replace: true
    scope:
      question:"="
    link: ($scope, element, attrs)->
      cacheScope $scope
      buildCharacters()
      $scope.$watch "question", (newValue, oldValue)->
        if typeof newValue != "undefined"
          askCharacters()

  }
]