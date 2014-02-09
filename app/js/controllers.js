'use strict';

/* Controllers */

angular.module('z.controllers', [])
.controller('ReadCtrl', function($scope, $routeParams, DBService) {
  $scope.post = {body:'', title:''}
  $scope.username = $routeParams.username
  $scope.postId = $routeParams.postId
  DBService.findPost($scope.postId, $scope.username, function(post) {
    if(!post.val()) return console.error('post not found')
    $scope.post = post.val()
    console.log('loaded post', $scope.post)
    $scope.$apply()
  })
})
.controller('HomeCtrl', function ($scope, AuthService, DBService, $rootScope, $location) {
  $scope.login = AuthService.login
  $scope.next = null // fn
  $scope.noop = function(e) {
    e && e.stopPropagation()
  }
  $scope.$watch(function() { return $rootScope.user }, function(user) {
    if(user) {
      $scope.loginModal = false
      $scope.next && $scope.next()
    }
  })
  $scope.publish = function () {
    if(!$rootScope.user) {
      console.log('user not authed')
      $scope.next = $scope.publish;
      return $scope.loginModal = true
    }
    console.log('publishing')
    $scope.post.date = new Date().toString()
    $scope.post.id = DBService.postId($scope.post.title)
    $scope.post.permalink = '/#/'+$rootScope.user.username+'/'+$scope.post.id
    $scope.waiting = true
    DBService.createPost($scope.post, $rootScope.user.username, function(post) {
      $scope.waiting = false
      console.log("published", post.name())
      $location.path($rootScope.user.username+'/'+$scope.post.id)
      $scope.$apply()
    })
    $scope.next = null
  }
  $scope.post={title:'How I learned to swim', body:'[![The Pond](http:\/\/i.imgur.com\/Z1bWs0j.png)](http:\/\/thepond.zolmeister.com\/)\r\n\r\n### [ThePond](http:\/\/thepond.zolmeister.com\/) ([source](https:\/\/github.com\/Zolmeister\/pond))\r\n\r\n[![google play](http:\/\/4.bp.blogspot.com\/-cPl79M_hD18\/UlmrBIx0XrI\/AAAAAAAAAqs\/hl6MfbFZWFI\/s1600\/play-store-icon.png)](https:\/\/play.google.com\/store\/apps\/details?id=com.Zolmeister.ThePond)\r\n[![chrome web store](http:\/\/1.bp.blogspot.com\/-SrpGXzQgk2w\/UlmrFZ6xLfI\/AAAAAAAAAq0\/Sgx3BnEddh8\/s1600\/chrome-store.png)](https:\/\/chrome.google.com\/webstore\/detail\/the-pond\/aonjkompolbfgipkpgmcgiakfghibjmm)\r\n[![Firefox Marketplace](http:\/\/4.bp.blogspot.com\/-kIy9Qf9ks0Y\/UlmqRdpFQGI\/AAAAAAAAAqo\/QyVriwr-zig\/s1600\/firefox-marketplace.png)](https:\/\/marketplace.firefox.com\/app\/the-pond\/)\r\n[![A fish](http:\/\/4.bp.blogspot.com\/-L_jM7rzHhi4\/UljxPJSutUI\/AAAAAAAAAqM\/229Poch2jTo\/s1600\/icon-90.png)](http:\/\/thepond.zolmeister.com\/)\r\n - [Google Play](https:\/\/play.google.com\/store\/apps\/details?id=com.Zolmeister.ThePond)\r\n - [Chrome Web Store](https:\/\/chrome.google.com\/webstore\/detail\/the-pond\/aonjkompolbfgipkpgmcgiakfghibjmm)\r\n - [Amazon App store](http:\/\/www.amazon.com\/Zolmeister-The-Pond\/dp\/B00FROOKHI)\r\n - [Firefox Marketplace](https:\/\/marketplace.firefox.com\/app\/the-pond\/)\r\n - [Clay.io](http:\/\/clay.io\/game\/thepond)\r\n - [Pokki](https:\/\/www.pokki.com\/app\/The-Pond)\r\n\r\nThe Pond is a multi-platform HTML5 game that explores minimalistic design and resolution independant gameplay. The Pond isn\'t about reaching a high score, or about buying weapon upgrades. It\'s about relaxing and exploring a beautiful world. In making The Pond I came across many performance obstacles which I will explore in detail (especially when optimizing the codebase for mobile).\r\n\r\n## Tools\r\nBefore I begin, I would like to mention the two tools that made coding The Pond both efficient and highly enjoyable: Light Table and CocoonJS.\r\n\r\n[Light Table](http:\/\/www.lighttable.com\/) is an IDE (still in alpha) which provides an integrated development environment for real-time javascript code injection. This means that javascript edited within the editor can be previewed without reloading the page. If we look at the shape of the fish in the game we notice that it is comprised of [B\u00E9zier curves](http:\/\/en.wikipedia.org\/wiki\/B%C3%A9zier_curve). Instead of trying to find an editor for creating B\u00E9zier curves, I simply estimated a basic shape and modified the variables in real-time until I was satified with it\'s look and feel.\r\n\r\n[CocoonJS](http:\/\/www.ludei.com\/tech\/cocoonjs) on the otherhand provides a canvas optimized compatability layer for improved performance on mobile devices. Not only does it optimize though, it also provies an interface for exporting our application to many devices (Android, iOS, Amazon (android), Pokki, and Chrome Web Store).\r\n\r\n## Physics\r\nThe Pond may seem simple on the outside, but on the inside it\'s full of performance optimizations and resonsive features. As we resize the game, it updates and re-optimizes itself to render less objects and spawn less fish, and if that\'s not enough the framerate degrades smoothly to keep physics in check. This is thanks to the use of a **fixed interval physics time step**. [Gameprogrammingpatterns.com](http:\/\/gameprogrammingpatterns.com\/game-loop.html) provides a good explanation for how to do this and why it matters, but honestly the code makes the most sense:\r\n```\r\nvar MS_PER_UPDATE = 18; \/\/ Time between physics calculations\r\nvar lag = 0.0; \/\/ accumulate lag over frames\r\nvar previousTime = 0.0; \/\/ used for calulating the time delta\r\n\r\n\/\/ main game loop\r\nfunction draw(time) {\r\n  requestAnimFrame(draw); \/\/ immidiately queue another frame\r\n  lag += time - previousTime; \/\/ add time delta\r\n  previousTime = time;\r\n\r\n  var MAX_CYCLES = 18; \/\/ prevent infinite looping\/hanging on slow machines\r\n  \r\n  \/\/ physics calculations\r\n  while(lag >= MS_PER_UPDATE && MAX_CYCLES) {\r\n   \r\n    \/\/ user input, movement, and animation calculations\r\n    physics();\r\n    lag -= MS_PER_UPDATE;\r\n    MAX_CYCLES--;\r\n  }\r\n\r\n  \/\/ if we exhausted our cycles, the client must be lagging\r\n  if(MAX_CYCLES === 0) {\r\n\r\n    \/\/ adaptive quality\r\n    lowerQuality();\r\n  }\r\n  \r\n  \/\/ if 5 frames behind after update, jump\r\n  \/\/ this prevents an infinite input lag from ocurring\r\n  if(lag\/MS_PER_UPDATE > 75) {\r\n    lag = 0.0;\r\n  }\r\n\r\n  \/\/ draw to canvas\r\n  paint();\r\n}\r\n```\r\n\r\nWhat\'s important to notice here is that physics is not calculated based on the time delta, instead it\'s calculated at a fixed 18ms interval. This is important because it means that any client lag will not be reflected in phyics calculations, and that slower machines will simply lose framerate.\r\n\r\n### Dynamic Quality\r\nThe next optimization we notice is the `lowerQuality()` function, which adaptively decreases the render quality of the game. The way this works is simply by re-sizing the drawing canvas (it\'s still full screen, it simply gets streched out), which in-turn leads to reduced spawns and collisions.\r\n```\r\nfunction resizeWindow() {\r\n\r\n  \/\/ quality is a global variable, updated by lowerQuality()\r\n  $canv.width = window.innerWidth * quality\/10\r\n  $canv.height = window.innerHeight * quality\/10\r\n  ctx = $canv.getContext(\'2d\')\r\n  ctx.lineJoin = \'round\'\r\n\r\n  \/\/ resize HUD elements, and reduce spawning\r\n  if(GAME.state === \'playing\') {\r\n    GAME.spawner.resize($canv.width, $canv.height)\r\n    GAME.levelBar.resize($canv.width, $canv.height)\r\n    GAME.levelBalls.resize($canv.width, $canv.height)\r\n  } else {\r\n    if(ASSETS.loaded) drawMenu()\r\n  }\r\n}\r\n```\r\n### Spawning\r\nNow, we\'ve been talking about reducing spawning to improve performance so let me explain how that happens. The spawning algorithm works by creating a virtual grid sized based on the window size. As the player travels from one grid zone to another, the adjacent zones are populated with enemies:\r\n![Grid Spawner](http:\/\/i.imgur.com\/TPGtanv.png)\r\n\r\n```\r\nSpawner.prototype.spawn = function(zone) {\r\n  \/\/ spawn 1-3  fish per 500sqpx, maybe larger maybe smaller than player\r\n  \/\/ 0.5 chance that it will be bigger\/smaller\r\n  var mult = this.width*this.height\/(500*500)\r\n  for(var i=0, l=(Math.floor(Math.random()*3) + 1) * mult;i<l;i++) {\r\n  \r\n    \/\/ spawn coordinates random within a zone\r\n    var x = zone[0]+Math.floor(this.width*Math.random()) - this.width\/2\r\n    var y = zone[1]+Math.floor(this.height*Math.random()) - this.height\/2\r\n    var size = Math.random() > 0.5 ? this.player.size + Math.floor(Math.random() * 10) : this.player.size - Math.floor(Math.random() * 10)\r\n\r\n    \/\/ spawn a new fish\r\n    var fish = new Fish(true, x, y, size, Math.random()*Math.PI*2-Math.PI, Math.random()*Math.PI)\r\n\r\n    this.fishes.push(fish)\r\n  }\r\n  return zone\r\n}\r\n```\r\nThe last piece of the puzzle is removing enemies as they move far enough away:\r\n```\r\n\/\/ if far enough away from player, remove\r\nif(distance(fish, player) > Math.max($canv.width, $canv.height) * 2) {\r\n  fish.dead = true\r\n}\r\n```\r\n\r\n### Collisions\r\nThe next performance optimization lies with the collision code. Colliding irregularly shaped objects can be extremely difficult and resource intensive. One option is to do color based colision (scan for overlapping colors), but that is much too slow. Another option might be to mathematically calculate B\u00E9zier curve collisions, however this is not only CPU intensive, it also quite difficult to write code for. I finally opted for an approximation approach using circles. Basically I calculate the position of circles within each fish and detect circle collision among the fish. Boolean circle collision is extremely efficient, as it simply requires measuring the distance between objects. This ends up looking like this (debug mode):\r\n![debug mode](http:\/\/i.imgur.com\/jtFXHxz.png)\r\n```\r\nFish.prototype.collide = function (fish) {\r\n\r\n  \/\/ the fish has been killed and is being removed or it is far away\r\n  if (this.dying || fish.dying || distance(this, fish) > this.size * 5 + fish.size*5) {\r\n    return false\r\n  }\r\n\r\n  \/\/ there are 6 circles that make up the collision box of each fish\r\n  var c1, c2\r\n  for (var i=-1, l = this.circles.length; ++i<l;) {\r\n    c1 = this.circles[i]\r\n    for (var j=-1, n = fish.circles.length; ++j < n;) {\r\n      c2 = fish.circles[j]\r\n\r\n      \/\/ check if they touch\r\n      if(distance(c1, c2) <= c2.r + c1.r) {\r\n        return true\r\n      }\r\n    }\r\n  }\r\n\r\n  return false\r\n}\r\n```\r\nWe also avoid unecessary collision calulations by only checking the fish that are visible (or near-visible):\r\n```\r\nif(Math.abs(fish2.x - player.x) < $canv.width && Math.abs(fish2.y - player.y) < $canv.height) {\r\n    \/\/ check\r\n}\r\n```\r\n## Drawing\r\nAfter getting that physics out of the way, it\'s time to optimize drawing operations. Many games use sprite maps for animation ([Senshi](http:\/\/www.zolmeister.com\/2013\/09\/senshi-mmo-battle-royale-inspired-html5.html) for example) which can be highly optimized. Unfortunantely our fish are dynamically generated so we must find other ways to optimizing drawing. First lets use Chrome\'s javascript profiler to identify bottlenecks:\r\n![The Pond CPU profile](http:\/\/i.imgur.com\/X6xZOUO.png)\r\n\r\nWhat we see here is that `stroke` is using a lot of resources. Truth be told, `fill` used to be there too. This is because both were called heavily when drawing fish. The game looked a bit like this:\r\n![The Pond - Old rendering](http:\/\/i.imgur.com\/JXA3spJ.png)\r\n\r\nAfter removing `fill` I saw a huge performance increase, and the game looked much better. The reason the `drawImage` function is up there as well is because I take advantage of [offscreen canvas](https:\/\/hacks.mozilla.org\/2013\/05\/optimizing-your-javascript-game-for-firefox-os\/) rendering. Each fish is drawn on its own offscreen canvas which is then rendered onto the larger visible canvas. This is also what allowed me to easily explode the fish into particles by reading pixel data:\r\n```\r\nFish.prototype.toParticles = function(target) {\r\n  var particles = []\r\n\r\n  \/\/ read canvas pixel data\r\n  var pixels = this.ctx.getImageData(0,0,this.canv.width, this.canv.height).data\r\n  for(var i = 0; i < pixels.length; i += 36 * Math.ceil(this.size\/20) * (isMobile ? 6 : 1)) {\r\n    var r = pixels[i]\r\n    var g = pixels[i + 1]\r\n    var b = pixels[i + 2]\r\n\r\n    \/\/ black pixel - no data\r\n    if(!r && !g && !b){\r\n      continue\r\n    }\r\n\r\n    \/\/ Math to calculate position\r\n    var x = i\/4 % this.canv.width - (this.canv.width\/2 + this.size)\r\n    var y = Math.floor(i\/4 \/ this.canv.width) - (this.canv.height\/2)\r\n    var relativePos = rot(x, y, this.dir)\r\n    x=this.x + relativePos[0]\r\n    y=this.y + relativePos[1]\r\n\r\n    var col = new Color(r, g, b)\r\n    var dir = directionTowards({x: x, y: y}, this)\r\n    particles.push(new Particle(x, y, col, target, Math.PI*Math.random()*2 - Math.PI, this.size\/20))\r\n  }\r\n  return particles\r\n}\r\n```\r\n## The End\r\nIn the end the performance optimizations payed off and made the game feel more polished and playable even on lower-end mobile devices.\r\n\r\nIf you enjoyed this post, I regularly blog about my development projects over at [http:\/\/zolmeister.com](http:\/\/www.zolmeister.com\/).\r\n\r\n[The Pond](http:\/\/thepond.zolmeister.com\/) awaits exploring...\r\n'}
})