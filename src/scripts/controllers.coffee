$ = require '../../dist/vendor/jquery/jquery.js'
require '../../dist/vendor/angular/angular.js'
require '../../dist/vendor/angular-ui-utils/ui-utils.js'

angular.module("conversations.controllers", ['ui.keypress'])
angular.module("conversations.controllers").controller "appController", ['$scope', ($scope)->

	$scope.onEnterPressed = (event)->
		event.preventDefault()
		$scope.question = $("#guidance").val()
]