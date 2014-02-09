'use strict';


// Declare app level module which depends on filters, and services
angular.module('z', [
  'ngRoute',
  'ngAnimate',
  'z.filters',
  'z.services',
  'z.directives',
  'z.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '/partials/index.html', controller: 'HomeCtrl'})
  $routeProvider.when('/:username', {templateUrl: '/partials/list.html', controller: 'ListCtrl'})
  $routeProvider.when('/:username/new', {templateUrl: '/partials/list.html', controller: 'ListCtrl'})
  $routeProvider.when('/:username/:postId', {templateUrl: '/partials/read.html', controller: 'ReadCtrl'})
  $routeProvider.otherwise({redirectTo: '/'})
}]);
