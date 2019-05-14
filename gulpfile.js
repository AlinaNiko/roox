"use strict";

const gulp = require('gulp'),
    posthtml = require('gulp-posthtml'),
    include = require('posthtml-include'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csscomb = require('gulp-csscomb'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    webp = require('imagemin-webp'),
    svgstore = require('gulp-svgstore'),
    svgMinify = require('gulp-svgmin'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    del = require('del'),
    browserSync = require('browser-sync').create();

const root = {
  src: 'src/',
  build: 'build/'
};

const path = {
  src: {
    php: root.src + '*.php',
    html: root.src + '*.html',
    css: root.src + '*.scss',
    js: root.src + 'scripts/**/*.js',
    img: root.src + 'images/',
    font: root.src + 'fonts/**/*.ttf',
    ico: root.src + 'icons/**/*.svg',
    vid: root.src + 'video/**/*.mp4'
  },
  build: {
    php: root.build,
    html: root.build,
    css: root.build + 'styles/',
    js: root.build + 'scripts/',
    img: root.build + 'images/',
    font: root.build + 'fonts/',
    ico: root.build + 'icons/',
    vid: root.build + 'videos/'
  },
  watch: {
    php: root.src + '*.php',
    html: [
      root.src + 'markup/*.html',
      root.src + '*.html'
    ],
    css: [
      root.src + 'styles/blocks/*.scss',
      root.src + 'styles/common/*.scss',
      root.src + 'styles/helpers/*.scss'
    ],
    js: root.src + 'scripts/**/*.js',
    img: root.src + 'images/',
    font: root.src + 'fonts/**/*.ttf',
    ico: root.src + 'icons/**/*.svg',
    vid: root.src + 'video/**/*.mp4'
  }
};


// Clean dir ============================

function clean() {
  console.log('Очистка директории...');
  return del([
    'build/**',
    '!build',
    '!build/vendor/**'
  ]);
}


// PHP ============================

function compilePHP() {

  console.log('Переброс PHP...');

  return gulp.src(path.src.php)
    .pipe(gulp.dest(path.build.php))
    .pipe(browserSync.stream());
}


// HTML ============================

function compileMarkup() {

  console.log('Компиляция HTML...');

  return gulp.src(path.src.html)
    .pipe(posthtml([ include() ]))
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
}


// CSS ============================

function compileStyles() {

  console.log('Компиляция CSS...');

  return gulp.src(path.src.css)
    .pipe(plumber())
    .pipe(scss())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(csscomb())
    .pipe(gulp.dest(path.build.css))
    .pipe(csso({ comments: false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
}


// JS ============================

function scripts() {

  console.log('Компиляция JS...');

  return gulp.src(path.src.js)
    .pipe(plumber())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.build.js))
    .pipe(browserSync.stream());
}


// FONT ============================

function convertTTFtoWOFF() {

  console.log('Конвертация ttf в woff...');

  return gulp.src(path.src.font)
    .pipe(ttf2woff())
    .pipe(gulp.dest(path.build.font))
    .pipe(browserSync.stream());
}

function convertTTFtoWOFF2() {

  console.log('Конвертация ttf в woff2...');

  return gulp.src(path.src.font)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.build.font))
    .pipe(browserSync.stream());
}


// IMG ============================

function optimizeImages() {

  console.log('Оптимизация изображений...');

  return gulp.src(path.src.img + '**/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.optipng(),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {removeTitle: true},
          {cleanupNumericValues:
            {floatPrecision: 0}
          }
        ]
      }),
      imageminMozjpeg({
        quality: 80
      })
    ]))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
}


function convertImagesToWebp() {

  console.log('Конвертирование изображений в WebP...');

  return gulp.src(path.src.img + '**/*.{jpg,png}')
    .pipe(imagemin([
      webp({ quality: 80 })
    ]))
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
}


// ICO ============================

function collectIconsToSvgSprite() {

  console.log('Сборка спрайта SVG...');

  return gulp.src(path.src.ico)
    .pipe(svgMinify())
    .pipe(gulp.dest(path.build.ico))
		.pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest(path.build.ico))
    .pipe(browserSync.stream());
}


// VIDEO ============================

function optimizeVideos() {

  console.log('Переброс MP4...');

  return gulp.src(path.src.vid)
    .pipe(gulp.dest(path.build.vid))
    .pipe(browserSync.stream());
}


// SERVER ============================

function server() {
  browserSync.init({ 
    server: path.build.html,
    cors: true,
    notify: false 
  });

  gulp.watch(path.watch.php, compilePHP);
  gulp.watch(path.watch.html, compileMarkup);
  gulp.watch(path.watch.css, compileStyles);
  gulp.watch(path.watch.js, scripts);
  gulp.watch(path.watch.font, convertTTFtoWOFF);
  gulp.watch(path.watch.font, convertTTFtoWOFF2);
  gulp.watch(path.watch.img + '**/*.{jpg,png,svg}', optimizeImages);
  gulp.watch(path.watch.img + '**/*.{jpg,png}', convertImagesToWebp);
  gulp.watch(path.watch.ico, collectIconsToSvgSprite);
  gulp.watch(path.watch.vid, optimizeVideos);

  gulp.watch(path.watch.html).on('change', browserSync.reload);
}


// BUILD ============================

var build = gulp.series(clean, gulp.parallel(compilePHP, compileMarkup, compileStyles, scripts, convertTTFtoWOFF, convertTTFtoWOFF2, optimizeImages, convertImagesToWebp, collectIconsToSvgSprite, optimizeVideos));
exports.build = build;


// DEFAULT ============================

exports.default = gulp.series(build, server);