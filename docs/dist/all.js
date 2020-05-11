'use strict';
// Declare app level module which depends on filters, and services
angular.module('z', [
  'ngRoute',
  'ngAnimate',
  'z.filters',
  'z.services',
  'z.directives',
  'z.controllers'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: '/partials/index.html',
      controller: 'HomeCtrl'
    });
    $routeProvider.when('/:username', {
      templateUrl: '/partials/list.html',
      controller: 'ListCtrl'
    });
    $routeProvider.when('/:username/new', {
      templateUrl: '/partials/list.html',
      controller: 'ListCtrl'
    });
    $routeProvider.when('/:username/:postId', {
      templateUrl: '/partials/read.html',
      controller: 'ReadCtrl'
    });
    $routeProvider.otherwise({ redirectTo: '/' });
  }
]);
'use strict';
/* Controllers */
angular.module('z.controllers', []).controller('MenuCtrl', [
  '$scope',
  'AuthService',
  '$rootScope',
  '$location',
  function ($scope, AuthService, $rootScope, $location) {
    $scope.$on('Auth', function (e, user) {
      $scope.me = user;
      $scope.$apply();
    });
    $scope.me = $rootScope.user;
    $scope.logout = function () {
      AuthService.logout();
    };
    $scope.home = function () {
      $location.path('/');
    };
    $scope.isHome = function () {
      return $location.path() === '/';
    };
    $scope.login = AuthService.login;
    $scope.posts = function () {
      $location.path('/' + $scope.me.username);
    };
  }
]).controller('ReadCtrl', [
  '$scope',
  'AuthService',
  '$routeParams',
  'DBService',
  '$location',
  '$rootScope',
  function ($scope, AuthService, $routeParams, DBService, $location, $rootScope) {
    $scope.post = {
      body: '',
      title: ''
    };
    $scope.offset = 100;
    $scope.username = $routeParams.username;
    $scope.postId = $routeParams.postId;
    DBService.findPost($scope.postId, $scope.username, function (post) {
      if (!post.val())
        return console.error('post not found');
      $scope.post = post.val();
      $scope.post.date = new Date($scope.post.date);
      console.log('loaded post', $scope.post);
      $scope.$apply();
    });
    $scope.delete = function () {
      DBService.removePost($scope.postId, $scope.username, function () {
        $location.path('/' + $scope.username);
        $scope.$apply();
      });
    };
    $scope.me = $rootScope.user;
    $scope.$on('Auth', function (e, user) {
      $scope.me = user;
      $scope.$apply();
    });
    $scope.edit = function () {
      $scope.editing = true;
    };
    $scope.publish = function () {
      console.log('publishing');
      $scope.waiting = true;
      $scope.post.date = $scope.post.date.toString();
      DBService.createPost($scope.post, $rootScope.user.username, function () {
        $scope.waiting = false;
        console.log('published', $scope.post.id);
        $scope.editing = false;
        $scope.$apply();
      });
    };
  }
]).controller('ListCtrl', [
  '$scope',
  'AuthService',
  '$routeParams',
  'DBService',
  '$rootScope',
  '$location',
  function ($scope, AuthService, $routeParams, DBService, $rootScope, $location) {
    $scope.post = {
      title: localStorage.title || '',
      body: localStorage.body || ''
    };
    $scope.offset = 100;
    $scope.composing = /^\/.+\/new$/.test($location.path());
    $scope.$watch('post', function (post) {
      localStorage.title = post.title;
      localStorage.body = post.body;
    }, true);
    $scope.username = $routeParams.username;
    $scope.posts = [];
    DBService.posts($scope.username, function (posts) {
      $scope.posts = _.sortBy(_.map(_.filter(posts.val(), function (post) {
        return post.title;
      }), function (post) {
        post.date = new Date(post.date);
        return post;
      }), 'date').reverse();
      console.log('Posts', $scope.posts);
      $scope.$apply();
    });
    $scope.me = $rootScope.user;
    $scope.$on('Auth', function (e, user) {
      $scope.me = user;
      $scope.$apply();
    });
    $scope.new = function () {
      $scope.post.title = '';
      $scope.post.body = '';
      $scope.composing = true;
      $location.path('/' + $rootScope.user.username + '/new');
      $scope.$apply();
    };
    $scope.publish = function () {
      console.log('publishing');
      $scope.post.date = new Date().toString();
      $scope.post.id = DBService.postId($scope.post.title);
      $scope.post.permalink = '/#/' + $rootScope.user.username + '/' + $scope.post.id;
      $scope.waiting = true;
      DBService.createPost($scope.post, $rootScope.user.username, function () {
        $scope.waiting = false;
        localStorage.title = '';
        localStorage.body = '';
        console.log('published', $scope.post.id);
        $location.path($rootScope.user.username + '/' + $scope.post.id);
        $scope.$apply();
      });
    };
  }
]).controller('HomeCtrl', [
  '$scope',
  'AuthService',
  'DBService',
  '$rootScope',
  '$location',
  function ($scope, AuthService, DBService, $rootScope, $location) {
    $scope.login = AuthService.login;
    $scope.modal = {};
    $scope.next = null;
    // fn
    $scope.noop = function (e) {
      e && e.stopPropagation();
    };
    DBService.posts(function (creators) {
      var posts = [];
      _.forEach(creators.val(), function (postings) {
        _.forEach(_.values(postings), function (post) {
          post.date = new Date(post.date);
          posts.push(post);
        });
      });
      posts = _.first(_.sortBy(posts, 'date').reverse(), 10);
      console.log('posts', posts);
      $scope.posts = posts;
      $scope.$apply();
    });
    $scope.post = {
      title: localStorage.title || '',
      body: localStorage.body || ''
    };
    $scope.$watch('post', function (post) {
      localStorage.title = post.title;
      localStorage.body = post.body;
    }, true);
    $scope.$on('Auth', function (e, user) {
      if (user) {
        $scope.loginModal = false;
        $scope.next && $scope.next();
      }
    });
    $scope.publish = function () {
      if (!$rootScope.user) {
        console.log('user not authed');
        $scope.next = $scope.publish;
        return $scope.modal.login = true;
      }
      console.log('publishing');
      $scope.post.date = new Date().toString();
      $scope.post.id = DBService.postId($scope.post.title);
      $scope.post.permalink = '/#/' + $rootScope.user.username + '/' + $scope.post.id;
      $scope.waiting = true;
      DBService.createPost($scope.post, $rootScope.user.username, function () {
        $scope.waiting = false;
        $location.path($rootScope.user.username + '/' + $scope.post.id);
        localStorage.title = '';
        localStorage.body = '';
        $scope.$apply();
      });
      $scope.next = null;
    };
    if (!localStorage.once) {
      localStorage.once = true;
      $scope.post = {
        title: 'Blogging at its finest',
        body: '## Why is Dematerializer different?\nDematerializer aims to be the simplest and most elegant blogging platform for developers, powered by [markdown](https://daringfireball.net/projects/markdown/).\n\n## What can I do with markdown?\n\n### Subtitles\n\n**bolding**\n_italicizing_\n_**or both**_\n\n- lists of \n- things\n\n```js\n// Code embedding\nfunction dematerializer(obj) {\n  "with syntax  highlighting"\n  return void 0\n}\n```\nAnd `backtick` emphasis\n\n> block   \n> quotes\n\n[links](http://zolmeister.com)  \n![images](http://i.imgur.com/79sVqQr.png)\n\nAnd of course you can write paragraphs of text.  \n  \n(newlines require 2 spaces at the end of the line)\n\n\n# YEAH!'
      };
    }
  }
]);
'use strict';
/* Directives */
angular.module('z.directives', []).directive('zPageHeight', [
  'version',
  function (version) {
    return function ($scope, $el, attrs) {
      $el.css('height', window.innerHeight - attrs.zPageHeight + 'px');
    };
  }
]).directive('zViewer', function () {
  marked.setOptions({
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    },
    sanitize: true
  });
  return function ($scope, $el, attrs) {
    $scope.$watch(attrs.zViewer, function (content) {
      $el.html(marked('#[' + content.title + '](' + content.permalink + ')\n' + content.body));
    }, true);
  };
}).directive('zScrollSync', [
  '$rootScope',
  function ($rootScope) {
    return function ($scope, $el, attrs) {
      var el = $el[0];
      var uid = attrs.zScrollSync;
      $el.bind('scroll', function () {
        if ($rootScope.disableScrollListener)
          return;
        $rootScope.$broadcast('Scroll', {
          uid: uid,
          perc: el.scrollTop / el.scrollHeight
        });
      });
      $scope.$on('Scroll', function (e, scrolled) {
        // console.log('SCROLL EVENT', scrolled)
        if (scrolled.uid !== uid) {
          var perc = el.scrollTop / el.scrollHeight;
          $rootScope.disableScrollListener = true;
          el.scrollTop = scrolled.perc * el.scrollHeight;
          setTimeout(function () {
            $rootScope.disableScrollListener = false;
          }, 50);
        }
      });
    };
  }
]).directive('zViewerText', function () {
  return function ($scope, $el, attrs) {
    var div = document.createElement('div');
    $scope.$watch(attrs.zViewerText, function (content) {
      div.innerHTML = marked(content.body);
      $el.html(div.textContent);
    }, true);
  };
}).directive('spinner', function () {
  return function ($scope, $el, attrs) {
    var spinner = new Spinner().spin($el[0]);
  };
});
'use strict';
/* Filters */
angular.module('z.filters', []).filter('interpolate', [
  'version',
  function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/gm, version);
    };
  }
]);
'use strict';
/* Services */
// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('z.services', []).value('version', '0.1').service('AuthService', [
  '$rootScope',
  'DBService',
  function ($rootScope, DBService) {
    var auth = new FirebaseSimpleLogin(DBService.db, function (err, user) {
        if (err) {
          return console.error(err);
        }
        console.log('Auth', user);
        $rootScope.user = user;
        $rootScope.$broadcast('Auth', user);
      });
    this.login = function (service) {
      return auth.login(service);
    };
    this.logout = function () {
      return auth.logout();
    };
  }
]).service('DBService', function () {
  this.db = new Firebase('https://glaring-fire-7868.firebaseio.com/');
  this.postDB = this.db.child('posts');
  this.createPost = function (post, uid, cb) {
    this.postDB.child(uid).child(post.id).set(post, cb);
  };
  this.findPost = function (postId, uid, cb) {
    this.postDB.child(uid).child(postId).once('value', cb);
  };
  this.posts = function (uid, cb) {
    if (!cb) {
      cb = uid;
      uid = null;
    }
    if (uid) {
      this.postDB.child(uid).once('value', cb);
    } else {
      this.postDB.once('value', cb);
    }
  };
  this.postId = function (str) {
    return encodeURIComponent(str.replace(/\s/g, '-').slice(0, 100));
  };
  this.removePost = function (postId, uid, cb) {
    console.log('removing post', postId, uid);
    this.postDB.child(uid).child(postId).remove(cb);
  };
});