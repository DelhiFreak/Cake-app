require('babel-polyfill')
var gulp = require('gulp')
var babelify = require('babelify')
var watchify = require('watchify')
var exorcist = require('exorcist')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var browserSync = require('browser-sync')
var source = require('vinyl-source-stream')
var helpers = require('babelify-external-helpers')

var BUILD_DIR = 'public/'

var sync = browserSync.create()

// Input file
var bundler = watchify(browserify('src/index.js', {
  debug: true,
  extensions: ['.js', 'jsx']
}))

// Babel transform
bundler.transform(babelify.configure({
  plugins: ['babel-plugin-external-helpers'],
  presets: ['env', 'react', 'stage-2']
}))

// Recompile on update
bundler.on('update', bundle)

function bundle () {
  return bundler.plugin(helpers)
    .bundle()
    .on('error', function (error) {
      console.log('==========')
      console.error((error.toString()))
      console.log('==========')
      this.emit('end')
    })
    .pipe(exorcist('public/bundle.js.map'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BUILD_DIR))
}

gulp.task('default', ['build'])

gulp.task('build', function () {
  return bundle()
})

gulp.task('serve', function () {
  sync.init({
    server: 'public'
  })
})

gulp.task('watch', ['serve', 'build'], function () {
  gulp.watch(['src/*.js', 'src/**/*.js'], ['build'], function () {
    sync.reload()
  })
})
