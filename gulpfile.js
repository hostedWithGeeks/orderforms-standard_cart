var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    concat = require("gulp-concat"),
    del = require('del'),
	minifyHTML = require("gulp-minify-html"),
    minifyCSS = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    stripCssComments = require('gulp-strip-css-comments'),
    runSequence = require('run-sequence'),
    wait = require('gulp-wait2'),
    zip = require('gulp-zip');

var config = {
    paths: {
        javascript: {
            src:  "src/js/**/*.js",
            dest: "./js"
        },
        sass: {
            src: ["src/sass/**/*.scss"],
            dest: "./css"
        },
        tpl: {
            src:  "./src/tpl/**/*.tpl",
            dest: ".",
        },
    }
};

gulp.task('clean', function() {
    return del([
        './*.tpl',
        './favicon.png',
        './index.html',
        './includes',
        './images',
        './css/whmcs-hostedwithgeeks.css',
        './css/whmcs-hostedwithgeeks.css.map',
        './css/whmcs-hostedwithgeeks-helpers.css',
        './js/vendor',
        './js/main.js',
        './js/plugins.js',
        './dist'
    ]);
});

gulp.task('cleanpostrelease', function() {
    return del([
        './css/hwg_cart.css.map'
    ])
});

gulp.task('ziprelease', function() {
    setTimeout(function() {
        return gulp.src([
            './**/*',
            '!./{src,src/**,node_modules,node_modules/**}',
            '!./gulpfile.js',
            '!./package.json'
            ])
            .pipe(zip('whmcs-hostedWithGeeks-cart-release.zip'))
            .pipe(gulp.dest('dist/'));
    }, 5000);
});

gulp.task('sass', function () {
    return gulp.src(config.paths.sass.src)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.paths.sass.dest))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function() {
    gulp.src(config.paths.javascript.src)
        .pipe(gulp.dest(config.paths.javascript.dest));
});

gulp.task('copyTpl', function(){
    gulp.src(config.paths.tpl.src)
        .pipe(gulp.dest(config.paths.tpl.dest));
});

gulp.task('build', ['copyTpl', 'scripts', 'sass'], function() {
    // Quick 2s delay to allow all tasks to complete
    setTimeout(function() {
        browserSync({
            proxy: "dev.hostedwithgeeks.com",
            reloadDelay: 1000
        });
    }, 2000);

});

gulp.task('release', function() {
    runSequence('clean', ['copyTpl', 'scripts', 'sass'], 'cleanpostrelease', 'ziprelease')
});

gulp.task('default', ['build'], function(){
    gulp.watch(config.paths.sass.src, ['sass', browserSync.reload]);
    gulp.watch(config.paths.javascript.src, ['scripts', browserSync.reload]);
    gulp.watch(config.paths.tpl.src, ['copyTpl', browserSync.reload]);
});
