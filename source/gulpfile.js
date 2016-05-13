//Imports
var gulp = require('gulp'),
	uglify = require('gulp-uglifyjs'),
	sass   = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require("gulp-notify"),
	filesize = require('gulp-filesize'),
	gutil = require('gulp-util');

var startupTasks = ['CDNfallback',
					'appScripts', 
					'build-css', 
					'fontAwesome'
					]


//Default task - runs startup then starts watchers
gulp.task('default', startupTasks, function(){
	//Initial tasks should be added to the startupTasks array

	//Start the watchers
	gulp.watch('../public_html/css/Sass/*.scss', ['build-css'])
	gulp.watch('../public_html/js/*.js', ['appScripts'])
});


gulp.task('CDNfallback', function(){
/*	
	Copy CDN fallback items
		from: 	bower_components/.../
		to: 	../public_html/js/vendor/	
		Include .map files

	Current payload:
		jquery (min + map)
		picturefill (min)
*/
	var sPath = 'bower_components/',
		tPath = '../public_html/js/vendor/',
		files = [
			{src: sPath + "jquery/dist/jquery.min.js",
			tgt:  tPath},
			{src: sPath + "jquery/dist/jquery.min.map",
			tgt:  tPath},
			{src: sPath + "picturefill/dist/picturefill.min.js",
			tgt:  tPath},
			{src: sPath + "d3/d3.min.js",
			tgt:  tPath}
		];

	files.forEach(function(d,i){
		gulp.src(d.src).pipe(gulp.dest(d.tgt));
	})

});



gulp.task('appScripts', function(){
/*
	Combine and minify site scripts
	Save to ../public_html/js/compiled/app.min.js + map
*/
	gulp.src('../public_html/js/*.js')
		.pipe(filesize())
	    .pipe(uglify('app.min.js',{outSourceMap: true}).on('error', gutil.log))
	    .pipe(filesize())
	    .pipe(gulp.dest('../public_html/js/compiled/'))
})


gulp.task('build-css', function(){
/*
	Sass process:
		from: 	../public_html/css/Sass/app.scss app scripts
		to: 	../public_html/css/app.css
*/
	return gulp.src('../public_html/css/Sass/app.scss')
	    .pipe(sass({outputStyle: 'compressed'}))
	    .pipe(gulp.dest('../public_html/css/'))
})

gulp.task('fontAwesome', function(){
/*	
	Copy FontAwesome CSS (min + map)
		from: 	bower_components/font-awesome/
		to: 	../public_html/css/...
	Copy fonts
		from: 	bower_components/font-awesome/fonts/*
		to: 	../public_html/fonts/
*/
	gulp.src('bower_components/font-awesome/css/font-awesome.min.css').pipe(gulp.dest('../public_html/css/'));
	gulp.src('bower_components/font-awesome/css/font-awesome.css.map').pipe(gulp.dest('../public_html/css/'));
	gulp.src('bower_components/font-awesome/fonts/*').pipe(gulp.dest('../public_html/fonts/'));
})