/**
 * @description I am the Projects Gruntfile that contains tasks to build, test and deploy a project.
 * @namespace my-test-app
 */
module.exports = function(grunt) {
    'use strict';

    // Local server ports
    var LIVERELOAD_PORT = 35723;
    var SERVER_PORT = 9000;
    var RUNNER_PORT = 9002;

    // Project config
    var buildNumber = '';
    var CONFIG = {
        name: 'px.js',
        app: 'public',
        test: 'test',
        server: 'server',
        src: 'src',
        dist: 'dist',
        bower: 'public/bower_components',
        tmp: '.tmp',
        // Environment-specific settings
        dev: {
            options: {
                variables: {
                    'repo': 'DSP-SNAPSHOT'
                }
            }
        },
        prod: {
            options: {
                variables: {
                    'repo': 'DSP'
                }
            }
        }
    };

    // For adding build number to zip
    if (grunt.option('buildNumber')) {
        buildNumber = grunt.option('buildNumber');
    }

    // Connect - Livereload setup
    var lrSnippet = require('connect-livereload')({
        port: CONFIG.livereload
    });

    // Connect - static directory
    var mountFolder = function(connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' + ' * <%= pkg.name %>\n' + ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
            + ' * @link <%= pkg.homepage %>\n' + ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n'
            + ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */\n'
        },

        // Project settings
        config: CONFIG,

        // Watch task configuration
        watch: {
            options: {
                nospawn: true,
                livereload: '<%= connect.livereload %>'
            },
            test: {
                files: ['test/**/*.js'],
                tasks: ['karma']
            }
        },

        // Clean task configuration
        clean: {
            build: ['<%= config.dist %>'],
            test: ['test-target/']
        },

        // Karma Unit configuration
        karma: {
            runner: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        // JSHint task - https://www.npmjs.com/package/grunt-contrib-jshint
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: [
                '<%= config.src %>/**/*.js'
            ],
            test: [
                '<%= config.test %>/e2e/**/*.js',
                '<%= config.test %>/spec/**/*.js'
            ]
        },

        // Changelog - https://www.npmjs.org/package/grunt-changelog
        changelog: {
            sample: {
                options: {
                    dest: 'release-notes/<%= pkg.version %>.txt',
                    //TODO: Change to match your project's feature commit comment code.
                    //featureRegex: '/(^(PROJECT-*\d+\W*\s*\[FEATURE\])+\s-\s)/gm',
                    //TODO: Change to match your project's fix commit comment code.
                    //fixRegex: '/(^(PROJECT-*\d+\W*\s*\[FIX\])+\s-\s)/gm',
                    partials: {
                        features: '{{#each features}}{{> feature}}{{/each}}',
                        feature: '[NEW] {{this}}\n',
                        fixes: '{{#each fixes}}{{> fix}}{{/each}}',
                        fix: '[FIX] {{this}}\n'
                    }
                }
            }
        },

        // Bump task - https://www.npmjs.com/package/grunt-bump
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        // Concat task - https://www.npmjs.com/package/grunt-contrib-concat
        concat: {
            options: {
                //banner: '<%= meta.banner %>',
                stripBanners: true
            },
            dist: {
                src: ['<%= config.src %>/<%= pkg.name %>.js'],
                dest: '<%= config.dist %>/<%= pkg.name %>.js'
            }
        },

        // Uglify task - https://www.npmjs.com/package/grunt-contrib-uglify
        uglify: {
            options: {
                //banner: '<%= meta.banner %>'
            },
            dist: {
                src: '<%= config.src %>/*.js',
                dest: '<%= config.dist %>/<%= pkg.name %>.min.js'
            }
        },

        insert: {
          insertpxjs:{
            src: "dist/px.min.js",
            dest: "dist/px-library.html",
            match: "!!px.js script goes here!!"
          }
        },

        copy: {
          copypxtemplate: {
            src: "src/_px-library.html",
            dest: "dist/px-library.html"
          }
        }

    });

    grunt.loadNpmTasks('grunt-insert');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('dist', ['clean:build', 'jshint:src', 'uglify']);
    grunt.registerTask('test', ['jshint:test', 'clean:test', 'karma']);

    // Default task.
    grunt.registerTask('default', 'Basic build', [
      'test',
      'dist',
      'copy',
      'insert'
    ]);

};
