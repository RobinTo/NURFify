module.exports = function(grunt){
    grunt.initConfig({
        watch:{
            less: {
                files: ['css/*.less'],
                tasks: ['less'],
                options: {
                    interrupt: true,
                    spawn: false
                }
            }
        },
        less: {
            default: {
                files: {
                    "css/main.css": "css/*.less"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('watchLess', ['watch:less']);
};
