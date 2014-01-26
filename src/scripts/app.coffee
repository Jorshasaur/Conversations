require '../../dist/vendor/angular/angular'
require './controllers.coffee'
require './replies.coffee'

angular.module "conversations", ['conversations.controllers', 'conversations.directives']

	
