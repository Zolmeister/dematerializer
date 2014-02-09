'use strict';

/* Directives */


angular.module('z.directives', []).
  directive('zPageHeight', function(version) {
    return function($scope, $el, attrs) {
      $el.css('height', window.innerHeight - attrs.zPageHeight + 'px')
    }
  })
.directive ('zViewer', function() {
  marked.setOptions({
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    }
  })
  return function($scope, $el, attrs) {
    $scope.$watch(attrs.zViewer, function(content) {
      $el.html(marked('#['+content.title+']('+content.permalink+')\n<br>'+content.body))
    }, true)
  }
})
.directive ('zViewerText', function() {
  return function($scope, $el, attrs) {
    var div = document.createElement('div')
    $scope.$watch(attrs.zViewerText, function(content) {
      div.innerHTML = marked(content.body)
      $el.html(div.textContent)
    }, true)
  }
})
.directive('spinner', function() {
  return function($scope, $el, attrs) {
    var spinner = new Spinner().spin($el[0])
  }
})
