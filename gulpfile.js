var gulp = require('gulp');
var coffee = require('gulp-coffee');
var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var haml = require('gulp-haml');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var server = require('gulp-server-livereload');
var del = require('del');

var paths = {
    js: ['scripts/*.coffee'],
    css: ['styles/*.sass'],
    haml: ['template/*.haml'],
    images: 'assets/*'
};

gulp.task('clean_js', function() {
    return del(['_jss']);
});

gulp.task('clean_css', function() {
    return del(['_css']);
});

gulp.task('js', ['clean_js'], function() {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(coffee())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('js'));
});

gulp.task('css', ['clean_css'], function() {
    return gulp.src(paths.css)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'));
});

gulp.task('haml', function() {
    return gulp.src(paths.haml)
        .pipe(sourcemaps.init())
        .pipe(haml())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('.'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.src('.').pipe(server({ livereload: true, open: true }));
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.haml, ['haml']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'js', 'css', 'haml', 'clean_js', 'clean_css']);
