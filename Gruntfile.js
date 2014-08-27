module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			sass: {
				files: ['app/client/sass/**/*.{scss,sass}'],
				tasks: ['sass:dist']
			},
			livereload: {
				files: ['*.html', '*.htm', 'js/**/*.{js,json}', 'app/client/css/*.css','app/client/img/**/*.{png,jpg,jpeg,gif,webp,svg}'],
				options: {
					livereload: true
				}
			}
		},
		sass: {
			options: {
				sourceComments: 'normal',
				outputStyle: 'expanded'
			},
			dist: {
				files: {
					'app/client/css/style.css': 'app/client/sass/style.sass'
				}
			}
		}
	});
	grunt.registerTask('default', ['sass:dist', 'watch']);
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
};