module.exports = (grunt)->

  grunt.initConfig {
    pkg: grunt.file.readJSON 'package.json'

    browserify:
      dist:
        files:
          "dist/scripts/app.js": ['src/scripts/*.coffee', 'src/scripts/**/*.coffee']
          "dist/scripts/tests.js": ['src/tests/*.coffee', 'src/tests/**/*.coffee']
      options:
        transform: ['coffeeify']

    jade:
      html:
        files:
          'dist':['src/index.jade'],
          'dist/views':['src/views/*.jade']
        options:
          client: false
          runtime: false

    sass:
      dist:
        files:
          'dist/styles/main.css': 'src/styles/main.scss'

    simplemocha:
      options:
        globals: ['should']
        timeout: 3000
        ignoreLeaks: false
        ui: 'bdd'
        reporter: 'spec'
      all:
        src: ['dist/scripts/tests.js']

    connect:
      server:
        options:
          hostname: '0.0.0.0'
          port: 9001
          base: "dist"
          keepalive: false

    watch:
      scripts:
        files: ['src/views/*.jade', 'src/index.jade', 'src/**/*.coffee', 'src/**/**/*.coffee', 'src/styles/*.scss', 'src/styles/**/*.scss']
        tasks: ['default']
      options:
          livereload: true

    uglify:
      options:
        mangle: false
      my_target:
        files:
          'dist/scripts/app.min.js': ['dist/scripts/app.js']

    karma:
      unit:
        configFile: 'src/tests/karma.config.js'
        keepalive: true

  }

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-jade'
  grunt.loadNpmTasks 'grunt-sass'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-karma'

  grunt.registerTask 'default', ['browserify', 'jade', 'sass', 'simplemocha']
  grunt.registerTask 'watch', ['default', 'connect', 'watch']
  grunt.registerTask 'build', ['browserify', 'jade', 'sass', 'uglify', 'karma:unit']
