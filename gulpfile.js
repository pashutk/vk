// include gulp
var gulp = require('gulp');

// include plugins
var jshint     	 = require('gulp-jshint');
var stylus     	 = require('gulp-stylus');
var concat     	 = require('gulp-concat');
var uglify     	 = require('gulp-uglify');
var rename     	 = require('gulp-rename');
var coffee     	 = require('gulp-coffee');
var sourcemaps 	 = require('gulp-sourcemaps');
var postcss    	 = require('gulp-postcss');
var mqpacker   	 = require('css-mqpacker');
var autoprefixer = require('autoprefixer-core');
var gutil 		 = require('gulp-util');
var inject 		 = require("gulp-inject");
var refresh      = require('gulp-livereload');  
var lr           = require('tiny-lr');  
var server       = lr();
var jade         = require('gulp-jade');

var src = {
    getPath: function(destString){
        var string = '',
            path   = destString.split('.'),
            that   = this;
        for (var i = 0; i < path.length; i++) {
            string += that.parentPrefix;
            if (i == path.length-1) {
                if (typeof(that[path[i]])=='object') {
                  string += that[path[i]].parentPrefix;
                } else if (typeof(that[path[i]])=='string'){
                  string += that[path[i]];
                }
            } else {
                that = that[path[i]];
            }
            
        };
        return string;
    },
    parentPrefix: '',
    chromeapp:{
        parentPrefix: 'chromeapp/',
        src: {
          parentPrefix: 'src/',
          jade: 'index.jade',
          background: 'background.coffee'
        }
        
    }
};

//chromappJade
gulp.task('cJade', function() {
  gulp.src(src.getPath('chromeapp.src.jade'))
    .pipe(jade())
    .pipe(gulp.dest(src.getPath('chromeapp')))
});

//chromeCoffee
gulp.task('cCoffee', function() {
  gulp.src(src.getPath('chromeapp.src.background'))
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest(src.getPath('chromeapp')))
});



// Coffee
gulp.task('coffee', function() {
  gulp.src('./src/coffee/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./webapp/js'))
    .pipe(gulp.dest('./chromeapp/js'))
});

//chromeappCoffee



// css
gulp.task('css', function () {
    var processors = [
        autoprefixer,
        mqpacker
     ];
     return gulp.src('./src/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest('./webapp/css'))
        .pipe(gulp.dest('./chromeapp/css'))
        .pipe(refresh(server));
});

// stylus
gulp.task('makeStyl', function () {
  gulp.src('./src/styl/*.styl')
    .pipe(stylus())
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer,mqpacker]))
    .pipe(sourcemaps.write('./sourcemaps'))
    .pipe(gulp.dest('./webapp/css'))
    .pipe(gulp.dest('./chromeapp/css'))
    .pipe(refresh(server));
});

gulp.task('index', ['css','makeStyl'], function () {
  var target = gulp.src('./src/index.html');
  var sources = gulp.src(['css/*.css'], {read: false});
  return target.pipe(inject(sources,{addRootSlash:false}))
    .pipe(gulp.dest('./webapp/'))
    .pipe(gulp.dest('./chromeapp/'))
    .pipe(refresh(server));
});

gulp.task('lr-server', function() {  
    server.listen(35729, function(err) {
        if(err) return console.log(err);
    });
});

gulp.task('watchWebapp', function() {  
    gulp.run('default');

    gulp.watch('./src/coffee/*.coffee', ['coffee']);
    gulp.watch('./src/css/*.css', ['css']);
    gulp.watch('./src/styl/*.styl', ['makeStyl']);
    gulp.watch('./src/index.html', ['index']);
})

gulp.task('cWatch', function() {  

    gulp.run('chromeapp');
    gulp.watch(src.getPath('chromeapp.src.jade'), ['cJade']);
    gulp.watch(src.getPath('chromeapp.src.background'), ['cCoffee']);
})


gulp.task('default', ['coffee', 'makeStyl', 'css', 'index']);

gulp.task('chromeapp',['cJade', 'cCoffee']);