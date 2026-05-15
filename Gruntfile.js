module.exports = function(grunt) {
  // Jshint options - http://jshint.com/docs/options/
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js',
              'app.js',
              'bin/*.js',
              'config/*.js',
              'email/*.js',
              'log/*.js',
              'migrations/*.js',
              'models/*.js',
              'public/javascript/*.js',
              'routes/*.js',
              'seeders/*.js',
              'util/*.js',
              'test/*.js',
            ],
      options: {
        esversion: 11,
        node: true,
        curly: true,
        immed: true,
        newcap: false,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        laxbreak: true,
        globals: {
          jQuery: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);

};
