module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // packages
        pkg: grunt.file.readJSON('package.json'),

        // minify javascript
        uglify: {
            options: {
            },
            main: {
                src: [
                    'src/assets/js/main.js'
                ],
                dest: 'build/assets/js/main.js'
            }
        },

        // jshint config
        jshint: {
            all: ['src/assets/js/**/*.js'],
            options: {
                ignores: [
                    'src/assets/js/lib/*.js',
                    'src/assets/js/lib/**/*.js'
                ],
                globals: {
                    jQuery: true,
                    angular: true

                }
            }
        },

        // compile sass
        compass: {
            dev: {                          // Another target
                options: {
                    config: 'config/compass-dev.rb'
                }
            },
            build: {                          // Another target
                options: {
                    config: 'config/compass-build.rb'
                }
            }
        },

        // watch config
        watch: {
            scripts: {
                files: ['src/assets/**/*.js'],
                tasks: ['jshint'],
                options: {
                    spawn: false,
                }
            },

            styles: {
                files: ['src/assets/scss/*.scss','src/assets/scss/**/*.scss'],
                tasks: ['compass:dev']
            }
        },

        // Server configuration.
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: 'src'
                }
            }
        },

        clean: {
            build: ["build/*", "build/**/*", "temp/*", "temp/**/*"],
            cleanup: ["temp/*", "temp/**/*"]
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/img/*',
                        src: ['**'],
                        dest: 'build/assets/img/*'
                    },
                    {
                        src: ['src/assets/css/main.css'],
                        dest: 'build/assets/css/main.css'
                    },
                    {
                        src: ['src/assets/js/main.js'],
                        dest: 'build/assets/js/main.js'
                    }
               ]
            },
            debug: {
                files: [
                    {
                        src: ['src/assets/css/main.css'],
                        dest: 'build/assets/css/main.css'
                    },
                    {
                        src: ['temp/js/lib.js'],
                        dest: 'build/assets/js/lib.min.js'
                    }
                ]
            }
        },

        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {                                   // Dictionary of files
                    'build/index.html': 'build/index.html'     // 'destination': 'source'
                }
            }
        },
        processhtml: {
            options: {
              // Task-specific options go here.
            },
            dist: {
                options: {
                    process: true
                },
                files: {
                    'build/index.html': ['src/index.html']
                }
            },
        },
        svg_sprite: {
            your_target: {
                src: ['assets/img/icons/*.svg'],
                dest: 'assets/img/sprites/'
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-svg-sprite');

    // watch task
    var watchScripts = Object.create(null);

    var watchScriptsChange = grunt.util._.debounce(function() {
        grunt.config(['jshint', 'all'], Object.keys(watchScripts));
        watchScripts = Object.create(null);
    }, 200);

    grunt.event.on('watch', function(action, filepath, target) {
        switch(target){
            case "scripts":
                watchScripts[filepath] = action;
                watchScriptsChange();
                break;
        }
    });


    // grunt.registerTask('sprites', ['svg_sprite:your_target']);

    // build tasks
    grunt.registerTask('build', ['clean:cleanup', 'clean:build', 'jshint', 'uglify:main', 'compass:build', 'copy:main', 'processhtml:dist', 'htmlmin:dist', 'clean:cleanup']);

    // Default task.
    grunt.registerTask('default', ['connect', 'compass:dev', 'watch']);



};