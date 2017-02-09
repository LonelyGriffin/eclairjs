var gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify');

gulp.task('default', function(){
	return gulp.src(["./src/index.js","./src/utils.js", "./src/*.js", "./src/modules/main/index.js", "./src/modules/main/*.js"])
	.pipe(jshint())
	.pipe(jshint.reporter("default"))
	.pipe(concat("eclair.js"))
	.pipe(gulp.dest("./dest/"))
	.pipe(rename({suffix: "_min"}))
	.pipe(uglify())
	.pipe(gulp.dest("./dest/"));
});