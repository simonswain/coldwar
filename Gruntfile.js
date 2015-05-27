"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    nodeunit: {
      files: [
        'test/*.js'
      ]
    },
    jshint: {
      server: ['Gruntfile.js',
               'lib/*.js',
               'test/**/*.js',
               'server/*.js',
               'server/handlers/*.js'
              ],
      client: ['server/public/js/actors/*.js',
               'server/public/js/scenes/*.js',
               'server/public/js/*.js'
              ],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      }
    },
    env : {
      dev : {
        NODE_ENV : 'development'
      },
      test : {
        NODE_ENV : 'test'
      },
      staging : {
        NODE_ENV : 'staging'
      },
      production : {
        NODE_ENV : 'production'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('test', ['jshint', 'env:test', 'nodeunit:files']);

  grunt.registerTask('default', ['lint']);

};
