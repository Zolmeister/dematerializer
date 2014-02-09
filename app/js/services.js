'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('z.services', []).
value('version', '0.1')
  .service('AuthService', function ($rootScope, DBService) {
    var auth = new FirebaseSimpleLogin(DBService.db, function (err, user) {
      if (err) {
        return console.error(err)
      }

      console.log('Auth', user)
      $rootScope.user = user
      $rootScope.$broadcast('Auth', user)
    })

    this.login = function (service) {
      return auth.login(service)
    }
    this.logout = function () {
      return auth.logout()
    }
  })
  .service('DBService', function () {
    this.db = new Firebase('https://glaring-fire-7868.firebaseio.com/')
    this.postDB = this.db.child('posts')
    this.createPost = function (post, uid, cb) {
      this.postDB.child(uid).child(post.id).set(post, cb)
    }
    this.findPost = function (postId, uid, cb) {
      this.postDB.child(uid).child(postId).once('value', cb)
    }
    this.posts = function (uid, cb) {
      if (!cb) {
        cb = uid
        uid = null
      }
      if (uid) {
        this.postDB.child(uid).once('value', cb)
      } else {
        this.postDB.once('value', cb)
      }
    }
    this.postId = function (str) {
      return encodeURIComponent(str.replace(/\s/g, '-').slice(0, 100))
    }
    this.removePost = function (postId, uid, cb) {
      console.log('removing post', postId, uid)
      this.postDB.child(uid).child(postId).remove(cb)
    }
  })