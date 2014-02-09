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

      console.log('Authed', user)
      $rootScope.user = user
    })

    this.login = function (service) {
      return auth.login(service)
    }
  })
  .service('DBService', function() {
    this.db = new Firebase('https://glaring-fire-7868.firebaseio.com/')
    this.postDB = this.db.child('posts')
    this.createPost = function(post, uid, cb) {
      this.postDB.child(uid).child(post.id).set(post)
      this.postDB.child(uid).child(post.id).once('value', cb)
    }
    this.findPost = function(postId, uid, cb) {
      this.postDB.child(uid).child(postId).once('value', cb)
    }
    this.posts = function(uid, cb) {
      this.postDB.child(uid).once('value', function(posts) {
        return cb(posts)
      })
    }
    this.postId = function(str) {
      return encodeURIComponent(str.replace(/\s/g,'-').slice(0, 100))
    }
  })