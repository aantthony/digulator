var gulp       = require('gulp');
var gutil      = require('gulp-util');
var stylus     = require('gulp-stylus');
var browserify = require('gulp-browserify');
var minifyHTML = require('gulp-minify-html');
var imagemin   = require('gulp-imagemin');

var paths = {
  html: './views/*.html',
  scripts: 'index.js',
  styles: './styles/*.stylus',
  images: 'images/**/*',
  other: 'other/**/*'
};

gulp.task('other', function () {
  gulp.src(paths.other)
  .pipe(gulp.dest('./dist'));
});

gulp.task('html', function() {
  gulp.src(paths.html)
  .pipe(minifyHTML())
  .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
  .pipe(browserify({
    insertGlobals : true,
    debug : process.env.NODE_ENV !== 'production'
  }))
  .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('styles', function(){
  return gulp.src(paths.styles)
    .pipe(stylus())
    .pipe(gulp.dest('./dist/styles/'));
});

gulp.task('images', function(){
  return gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images/'));
});

gulp.task('watch', function () {
  gulp.watch(paths.other, ['other']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.styles, ['styles']);
});

gulp.task('server', function () {
  var connect = require('connect');
  var http = require('http');

  var app = connect()
  .use(connect.static(__dirname + '/dist'));

  var port = 12345;
  http.createServer(app).listen(port, function () {
    gutil.log('Development web server started on port', gutil.colors.cyan(port));
  });
});

gulp.task('build', ['other', 'html', 'scripts', 'styles', 'images'], function () {});
gulp.task('default', ['build', 'server', 'watch'], function() {});