var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
// var less = require('gulp-less');
// var watch = require('gulp-watch');
// var path = require('path');
// var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


gulp.task('default', function () {
    return gulp.src('css/custom.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('css'));
});

gulp.task('compress', function() {
	return gulp.src('js/main.js')
		.pipe(uglify())
		.pipe(gulp.dest('js/'))
});

// Set this up later
// less compile -> autoprefix -> concatenate -> minifiy
// gulp.task('less', function () {
//     return gulp.src('css/custom.less')
//     	.pipe(less({
//     		paths: [ path.join(__dirname, 'less', 'includes') ]
//     	}))
//         .pipe(autoprefixer({
//             browsers: ['last 2 versions'],
//             cascade: false
//         }))
//         .pipe(concat(dist.css))
//         .pipe(gulp.dest('css'));
// });


// DEV
// Watch:: less compile -> autoprefix -> sourcemaps

// gulp.task('watch', function () {
//     return gulp.src('css/custom.css')
//         .pipe(autoprefixer({
//             browsers: ['last 2 versions'],
//             cascade: false
//         }))
//         .pipe(gulp.dest('css'));
// });
