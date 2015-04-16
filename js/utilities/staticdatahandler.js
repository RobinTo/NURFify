var staticdatahandler = (function(){
    var champions = {},
        summonerSpells = {},
        items = {};
    var loaded = 0,
        toLoad = 3;

    function init(){
        loadOrCache(config.baseurl + '/champions', function(data){
            loaded++;
            loadChampions(data);
            app.init();
        });
        loadOrCache(config.baseurl + '/summonerspells', function(data){
            loaded++;
            loadSummonerSpells(data);
        })
        loadOrCache(config.baseurl + '/items', function(data){
            loaded++;
            loadItems(data);
        });
    }

    function loadOrCache(path, callback){
        storage.getDbEntry(path, function(result) {
            if (!result || typeof result === 'undefined') {
                cachePath(path, function(blobData){
                    callback(blobData);
                });
            } else{
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

    function loadItems(data){
        for(var item in data.data){
            items[data.data[item].id] = data.data[item];
        }
    }

    function loadChampions(data){
        for(var champ in data.data){
            champions[data.data[champ].id] = data.data[champ];
        }
    }
    function getItem(itemId){
        if(itemId in items){
            return items[itemId];
        } else{
            return false;
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
        },
        getItem : getItem
    }
})();