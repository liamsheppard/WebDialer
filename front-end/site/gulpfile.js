var gulp =         require('gulp'),
    sass =         require('gulp-sass'),
    minifyCss =    require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    rename =       require('gulp-rename'),
    notify =       require('gulp-notify'),
    gutil =        require( 'gulp-util' ),
    directory =    '';

gulp.task('default', function() {
    gulp.watch('./' + directory + '/scss/**/*.scss',['sass']);
    gulp.watch('./' + directory + '/css/**/*.css',['minify-css']);
});

gulp.task('sass', function () {
    return gulp.src('./' + directory + '/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('./' + directory + '/css'));
});

var cssMinifyLocation = ['./' + directory + '/css/**/*.css', '!./' + directory + '/css/**/*min.css'];
gulp.task('minify-css', function() {
    return gulp.src(cssMinifyLocation)
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifyCss())
        .pipe(gulp.dest('./' + directory + '/dist/css'))
        .pipe(notify({ message: 'Styles Successfully Compiled' }));
});
