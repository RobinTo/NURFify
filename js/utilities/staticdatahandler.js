var staticdatahandler = (function(){
    var champions = {},
        summonerSpells = {};
    var loaded = 0,
        toLoad = 2;

    function init(){
        loadOrCache(config.baseurl + '/champions', function(data){
            loaded++;
            loadChampions(data);
            app.init();
        });
        loadOrCache(config.baseurl + '/summonerspells', function(data){
            loaded++;
            loadSummonerSpells(data);
        });
    }

    function loadOrCache(path, callback){
        storage.getDbEntry(path, function(result) {
            if (!result || typeof result === 'undefined') {
                cachePath(path, function(blobData){
                    callback(blobData);
                });
            } else{
                console.log('Got ' + path + ' from db.');
                callback(result.entry)
            }
        });
    }

    function cachePath(url, callback){
        // Create XHR
        $.ajax(url).done(function(data){
            storage.addDbEntry(url, data, config.version);
            if(typeof callback === 'function'){
                callback(data);
            }
        })
    }

    function loadChampions(data){
        for(var champ in data.data){
            champions[data.data[champ].id] = data.data[champ];
        }
    }

    function getChampion(championid){
        if(championid in champions){
            return champions[championid];
        } else{
            return false;
        }
    }

    function loadSummonerSpells(data){
        for(var sspell in data.data) {
            summonerSpells[data.data[sspell].id] = data.data[sspell];
        }
    }

    function getSummonerSpell(sid){
        if(sid in summonerSpells){
            return summonerSpells[sid];
        } else{
            return false;
        }
    }

    return{
        init : init,
        getAllChampions : function(){
            return champions;
        },
        getAllSummonerSpells : function(){
            return summonerSpells;
        },
        getChampion : getChampion,
        getSummonerSpell : getSummonerSpell,
        isReady : function(){
            return loaded >= toLoad;
        }
    }
})();