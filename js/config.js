var config = (function(){
    var version = '1';

    function getVersion(){
        return version;
    }

    function setVersion(newver){
        version = newver;
    }

    return {
        baseurl:'http://localhost:8000',
        ddragonbase: 'http://ddragon.leagueoflegends.com/cdn/',
        getVersion : getVersion,
        setVersion : setVersion
    }

})();