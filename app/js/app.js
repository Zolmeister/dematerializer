'use strict';


// Declare app level module which depends on filters, and services
angular.module('z', [
  'ngRoute',
  'z.filters',
  'z.services',
  'z.directives',
  'z.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '/partials/index.html', controller: 'HomeCtrl'})
  $routeProvider.when('/:username', {templateUrl: '/partials/read.html', controller: 'ReadCtrl'})
  $routeProvider.when('/:username/:postId', {templateUrl: '/partials/read.html', controller: 'ReadCtrl'})
  $routeProvider.otherwise({redirectTo: '/'})
}]);
