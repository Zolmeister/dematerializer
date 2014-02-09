var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var ngmin = require('gulp-ngmin')

gulp.task('server', function(cb) {
  var spawn = require('child_process').spawn
  var log = function(data){ console.log(data.toString().trim()) }

  var server = spawn('divshot', ['server', '--port', '3000'])

  server.on('error', function(error) { console.log(error.stack) })
  server.stdout.on('data', log)
  server.stderr.on('data', log)
})

// Concatenate & Minify JS
gulp.task('scripts', function() {
    gulp.src('./app/js/*.js')
        .pipe(concat('all.js'))
        .pipe(ngmin())
        .pipe(gulp.dest('./app/dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./app/dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('./js/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'watch', 'server'])
