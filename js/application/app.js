var app = (function(){
    var champions = {};
    function init(){
        var allchampions = staticdatahandler.getAllChampions();
        for (var t in allchampions){
            (function(){
                var c = allchampions[t];
                console.log(c);
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + c.image.full, function(image){
                    console.log(c.image.full);
                    image.addClass('icon');
                    image.attr('champion', c.name);
                    $('.searchBox').append(image);
                });
            })();
        }

        $.ajax('http://robint.pythonanywhere.com/allcstats/').done(function(data){
            for(var i in data){
                var champion = data[i].fields;
                var cobject = {};
                cobject['championId'] = champion.championId;
                cobject['winrate'] = (champion.wins/(champion.wins+champion.losses));
                cobject['wins'] = champion.wins;
                cobject['losses'] = champion.losses;
                cobject['matchDurationInWins'] = champion.matchDurationInWins;
                cobject['matchDurationInLosses'] = champion.matchDurationInLosses;
                cobject['wardsPlacedInWins'] = champion.wardsPlacedInWins;
                cobject['wardsPlacedInLosses'] = champion.wardsPlacedInLosses;
                cobject['killsInWins'] = champion.killsInWins;
                cobject['assistsInWins'] = champion.assistsInWins;
                cobject['deathsInWins'] = champion.deathsInWins;
                cobject['minionsInWins'] = champion.minionsInWins;
                cobject['killsInLosses'] = champion.killsInLosses;
                cobject['assistsInLosses'] = champion.assistsInLosses;
                cobject['deathsInLosses'] = champion.deathsInLosses;
                cobject['minionsInLosses'] = champion.minionsInLosses;
                champions[champion.championId] = cobject;
            }
        });

        $('.championFilter').on('keyup', function(event){
            var text = $(event.target).val().toLowerCase();
            var icons = $('.icon');
            for(var i = 0; i < icons.length; i++){
                var currentIcon = icons[i];
                if($(currentIcon).attr('champion').toLowerCase().indexOf(text) < 0){
                    $(currentIcon).hide();
                } else{
                    $(currentIcon).show();
                }
            }
        });
    }

    return{
        init : init
    }
})();