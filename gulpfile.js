var gulp = require('gulp')

gulp.task('server', function(cb) {
  var spawn = require('child_process').spawn
  var log = function(data){ console.log(data.toString().trim()) }

  var server = spawn('divshot', ['server', '--port', '3000'])

  server.on('error', function(error) { console.log(error.stack) })
  server.stdout.on('data', log)
  server.stderr.on('data', log)
})

gulp.task('default', ['server'])
