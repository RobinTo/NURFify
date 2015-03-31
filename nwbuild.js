var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
    files: [
      './*.*',
      './js/*.js',
      './js/ext/*.js',
      './css/*.css',
      './html/*.html'
    ], // use the glob format
    platforms: ['win64'] // 'osx32', 'osx64', 'win32',
});

//Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
