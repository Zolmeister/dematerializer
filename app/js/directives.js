'use strict';

/* Directives */


angular.module('z.directives', []).
  directive('zPageHeight', function(version) {
    return function($scope, $el, attrs) {
      $el.css('height', window.innerHeight - attrs.zPageHeight + 'px')
    }
  })
.directive ('zViewer', function() {
  return function($scope, $el, attrs) {
    $scope.$watch(attrs.zViewer, function(content) {
      $el.html(marked(content))
    })
  }
})
