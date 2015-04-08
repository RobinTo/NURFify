var app = (function(){
    var champions = {},
        championArray = []; // Storing as an array as well, to be able to use js default sort function.
    function init(){
        var allchampions = staticdatahandler.getAllChampions();
        for (var t in allchampions){
            (function(){
                var c = allchampions[t];
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

            createFrontPage();
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

    function createFrontPage(){
        var $c = $('.championContent');
        $c.empty();

        var killers = championArray.slice(0).sort(function(a,b){
            return (b.killsInWins+ b.killsInLosses)/(b.wins+ b.losses) - (a.killsInWins+ a.killsInLosses)/(a.wins+ a.losses)
        });
        var assisters = championArray.slice(0).sort(function(a,b){
            return (b.assistsInWins+ b.assistsInLosses)/(b.wins+ b.losses) - (a.assistsInWins+ a.assistsInLosses)/(a.wins+ a.losses)
        });
        var warders = championArray.slice(0).sort(function(a,b){
            return (b.wardsPlacedInWins+ b.wardsPlacedInLosses)/(b.wins+ b.losses) - (a.wardsPlacedInWins+ a.wardsPlacedInLosses)/(a.wins+ a.losses)
        });
        var diers = championArray.slice(0).sort(function(a,b){
            return (b.deathsInWins+ b.deathsInLosses)/(b.wins+ b.losses) - (a.deathsInWins+ a.deathsInLosses)/(a.wins+ a.losses)
        });

        var $table = $('<table class="frontpageTable"></table>')
        var $tr = $('<tr></tr>');
        $tr.append('<td class="killsHeader">Kills</td>');
        $tr.append('<td class="deathsHeader">Deaths</td>');
        $tr.append('<td class="assistsHeader">Assists</td>');
        $tr.append('<td class="wardsHeader">Wards</td>');
        $table.append($tr);
        var allChampions = staticdatahandler.getAllChampions();
        for(var i = 0; i < killers.length && i < 5; i++){
            (function(){
                var $tr = $('<tr></tr>');
                $tr.append('<td class="kills"></td>');
                $tr.append('<td class="deaths"></td>');
                $tr.append('<td class="assists"></td>');
                $tr.append('<td class="wards"></td>');

                var kpg = (killers[i].killsInWins+ killers[i].killsInLosses)/(killers[i].wins+ killers[i].losses),
                    dpg = (diers[i].deathsInWins+ diers[i].deathsInLosses)/(diers[i].wins+ diers[i].losses),
                    apg = (assisters[i].assistsInWins+ assisters[i].assistsInLosses)/(assisters[i].wins+ assisters[i].losses),
                    wpg = (warders[i].wardsPlacedInWins+ warders[i].wardsPlacedInLosses)/(warders[i].wins+ warders[i].losses);
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[killers[i].championId].image.full, function(image){
                    $tr.find('.kills').append(image).append('<br/>'+kpg.toFixed(2));
                });
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[assisters[i].championId].image.full, function(image){
                    $tr.find('.assists').append(image).append('<br/>'+apg.toFixed(2));
                });
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[diers[i].championId].image.full, function(image){
                    $tr.find('.deaths').append(image).append('<br/>'+dpg.toFixed(2));
                });
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[warders[i].championId].image.full, function(image){
                    $tr.find('.wards').append(image).append('<br/>'+wpg.toFixed(2));
                });
                $table.append($tr);
            })();
        }
        $c.append($table);
    }

    return{
        init : init,
        createFrontPage : createFrontPage
    }
})();