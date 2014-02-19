var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var ngmin = require('gulp-ngmin')
var nodemon = require('gulp-nodemon')

gulp.task('server', function(cb) {
  nodemon({ script: 'app.js', options: '-e html,js' })
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
