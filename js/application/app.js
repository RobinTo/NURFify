var app = (function(){
    function init(){
        imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/Thresh.png', function(image){
            $('body').append(image);
        });
    }

    return{
        init : init
    }
})();