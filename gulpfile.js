'use strict';

var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    run = require('gulp-run');

gulp.task('styles', function () {
    return gulp.src('frontend/scss/index.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ includePaths: [] }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/'));
});

gulp.task('browserify', ['browserify-index', 'browserify-thing'], function () {});

gulp.task('browserify-index', function () {
    browserify({
        entries: 'frontend/js/index.js',
        debug: true
    }).bundle()
        .pipe(source('index.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/'));
});

gulp.task('browserify-thing', function () {
    browserify({
        entries: 'frontend/js/thing.js',
        debug: true
    }).bundle()
        .pipe(source('thing.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/'));
});

gulp.task('html', function () {
    return gulp.src('frontend/*.html').pipe(gulp.dest('public/'));
});

gulp.task('favicon', function () {
    return gulp.src('logo.png')
        .pipe(rename('favicon.png'))
        .pipe(gulp.dest('public/'));
});

gulp.task('3rdparty', function () {
    return gulp.src([
        'node_modules/jquery/dist/*.min.js*',
        'frontend/3rdparty/**/*.min.css*',
        'frontend/3rdparty/**/*.min.js*',
        'frontend/3rdparty/**/*.js*',
        'frontend/3rdparty/**/*.otf',
        'frontend/3rdparty/**/*.svg',
        'frontend/3rdparty/**/*.ttf',
        'frontend/3rdparty/**/*.woff*',
    ]).pipe(gulp.dest('public/3rdparty/'));
});

gulp.task('images', function () {
    return gulp.src([
        'frontend/img/*',
    ]).pipe(gulp.dest('public/img/'));
});

gulp.task('chrome_extension', function () {
    run('chromium --pack-extension=webextension --pack-extension-key=webextension.pem').exec();
});

gulp.task('firefox_extension', function () {
    run('/bin/bash build_firefox_extension.sh').exec();
});

gulp.task('extensions', ['chrome_extension', 'firefox_extension'], function () {});

gulp.task('default', ['clean', 'html', 'favicon', 'images', 'styles', 'browserify', '3rdparty'], function () {});

gulp.task('clean', function () {
    del.sync(['public/']);
});

gulp.task('watch', ['default'], function () {
    gulp.watch('frontend/scss/*.scss', ['styles']);
    gulp.watch('frontend/**/*.js', ['browserify']);
    gulp.watch('frontend/**/*.html', ['html']);
    gulp.watch('frontend/img/*', ['images']);
    gulp.watch('webextension/*', ['extensions']);
});
