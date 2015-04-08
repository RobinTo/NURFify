var app = (function(){
    var champions = {},
        championArray = []; // Storing as an array as well, to be able to use js default sort function.
    function init(){
        var allchampions = staticdatahandler.getAllChampions();
        for (var t in allchampions){
            (function(){
                var c = allchampions[t];
                console.log(c);
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + c.image.full, function(image){
                    image.addClass('icon');
                    image.attr('champion', c.name);
                    image.attr('championId', c.id);
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
                championArray.push(cobject);
            }

            var killers = championArray.sort(function(a,b){
                return (b.killsInWins+ b.killsInLosses)/(b.wins+ b.losses) - (a.killsInWins+ a.killsInLosses)/(a.wins+ a.losses)
            });
            for (var k = 0; k < killers.length; k++){
                console.log(staticdatahandler.getChampion(killers[k].championId).name);
                console.log((killers[k].killsInWins+ killers[k].killsInLosses)/(killers[k].wins+killers[k].losses))
            }
        });

        $('.championFilter').on('keyup', function(event){
            var text = $(event.target).val().toLowerCase();
            var icons = $('.icon');
            for(var i = 0; i < icons.length; i++){
                var currentIcon = icons[i];
                if($(currentIcon).attr('champion').toLowerCase().indexOf(text) < 0){
                    $(currentIcon).addClass('hidden');
                } else{
                    $(currentIcon).removeClass('hidden');
                }
            }
        });


        $(document).on('click', '.icon', function(event){
            var championId = parseInt($(event.target).attr('championId')),
                championData = staticdatahandler.getChampion(championId),
                championStats = champions[championId];

            var $c = $('.championContent');
            $c.empty();
            $c.append(championData.name + '<br />');
            $c.append(championStats.wins+'/'+championStats.losses + '('+championStats.winrate.toFixed(2)+'%)<br />');
            $c.append('Wards in wins: ' + (championStats.wardsPlacedInWins/championStats.wins).toFixed(2) + '<br />');
            $c.append('Wards in losses: ' + (championStats.wardsPlacedInLosses/championStats.losses).toFixed(2) + '<br />');
        })
    }

    return{
        init : init
    }
})();