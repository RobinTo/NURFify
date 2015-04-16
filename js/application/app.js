var app = (function(){
    var champions = {},
        championArray = [], // Storing as an array as well, to be able to use js default sort function.
        generalStats = {},
        pDescriptions = {},
        matchData;

    function init(){

        $.ajax(config.baseurl + '/randommatch/').done(function(data){
            matchData = new matchdata(data);
            createMatchDetailPage();
        });

        var allchampions = staticdatahandler.getAllChampions();
        var array = $.map(allchampions, function(value, index) {
            return [value];
        });
        array = array.sort(function(a, b){
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
        })
        for (var t in array){
            (function(){
                var c = array[t];
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + c.image.full, function(image){
                    image.addClass('icon');
                    image.attr('champion', c.name);
                    image.attr('championId', c.id);
                    $('.searchBox').append(image);
                });
            })();
        }

        //createFrontPage();
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
            //_renderChampionLists();

            $.ajax('http://robint.pythonanywhere.com/gstats/').done(function(data){
                generalStats = data[0].fields;
                //_renderGeneralStats();
            });
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
            var championId = parseInt($(event.target).attr('championId'));

            _renderChampionDetails(championId);
        });

        $(document).on('click', '.matchChampion', function(event){
            var pId = parseInt($(event.target).attr('participant'));

            _renderParticipantDetails(pId);
        });
    }

    function _renderChampionDetails(championId){
        var championData = staticdatahandler.getChampion(championId),
            championStats = champions[championId];
        var $c = $('<div class="championData"></div>');
        $c.append(championData.name + ', ' + championData.title + '<br />');
        $c.append((championStats.winrate * 100).toFixed(2)+'%<br />');
        $c.append('Wards in wins: ' + (championStats.wardsPlacedInWins).toFixed(2) + '<br />');
        $c.append('Wards in losses: ' + (championStats.wardsPlacedInLosses).toFixed(2) + '<br />');
        $c.append($('<canvas id="myChart" width="200" height="200"></canvas>'));
        $('.championContent').empty();
        $('.championContent').append($c);
        var ctx = document.getElementById("myChart").getContext("2d");
        var data = {
            labels: ["Kills", "Deaths", "Assists"],
            datasets: [
                {
                    label: "When winning",
                    fillColor: "rgba(0,255,0,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(0,255,0,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [(championStats.killsInWins).toFixed(2), (championStats.deathsInWins).toFixed(2), (championStats.assistsInWins).toFixed(2)]
                },
                {
                    label: "When losing",
                    fillColor: "rgba(255,0,0,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(255,0,0,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [(championStats.killsInLosses).toFixed(2), (championStats.deathsInLosses).toFixed(2), (championStats.assistsInLosses).toFixed(2)]
                }
            ]
        };
        new Chart(ctx).Radar(data, {});

    }

    function _eventsToDescription(events){
        var descriptions = {
            buyOrder : [],
            skillOrder : [],
            wards : [],
            wardKills: [],
            kills : [],
            deaths : [],
            assists : []
        }
        for (var e in events){
            var event = events[e];
            switch(event.type){
                case 'ITEM_PURCHASED':
                    descriptions.buyOrder.push(event.item);
                    break;
                case 'SKILL_LEVEL_UP':
                    descriptions.skillOrder.push(event.skill);
                    break;
                case 'WARD_PLACED':
                    descriptions.wards.push({timestamp:event.timestamp, wardType:event.wardType});
                    break;
                case 'CHAMPION_DEATH':
                    descriptions.deaths.push({killer:event.killerId, timestamp: event.timestamp, assists: event.assists});
                    break;
                case 'CHAMPION_ASSIST':
                    descriptions.assists.push({killer:event.killerId, timestamp: event.timestamp, victim: event.victimId})
                    break;
                case 'CHAMPION_KILL':
                    descriptions.kills.push({victim:event.victimId, timestamp: event.timestamp, assists: event.assists});
                    break;
                case 'WARD_KILL':
                    descriptions.wardKills.push({timestamp:event.timestamp, wardType:event.wardType});
                    break;
                default:
                    break;
            }
        }
        return descriptions;
    }

    function _renderParticipantDetails(pId){
        console.log(pId);
        console.log(matchData.getParticipants());
        console.log(matchData.getParticipants()[pId]);
        var desc = pDescriptions[pId],
            par = matchData.getParticipants()[pId],
            c = par.champion,
            $c = $('#matchInfo');

        var $championInfo = $('<div class="cInfo"></div>');

        $championInfo.append('<div class="name">' + c.name + ', ' + c.title + '</div>');
        $championInfo.append('<div class="lane">' + (par.role !== 'NONE' ? par.role + ' ' : '')  + par.lane + '</div>');
        var $spells = $('<div class="spells"></div>');
        $championInfo.append($spells);
        imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/spell/' + staticdatahandler.getSummonerSpell(par.spell1).image.full, function(image){
            image.addClass('matchSummonerSpell');
            image.attr('spell1id', par.spell1);
            $spells.append(image);
        });
        imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/spell/' + staticdatahandler.getSummonerSpell(par.spell2).image.full, function(image){
            image.addClass('matchSummonerSpell');
            image.attr('spell2id', par.spell2);
            $spells.append(image);
        });

        var wardTime = 0,
            visionWards = 0;
        for(var w in desc.wards){
            switch(desc.wards[w].wardType){
                case 'YELLOW_TRINKET':
                    wardTime += 1;
                    break;
                case 'YELLOW_TRINKET_UPGRADE':
                    wardTime += 3;
                    break;
                case 'SIGHT_WARD:':
                    wardTime += 3;
                    break;
                case 'VISION_WARD':
                    visionWards++;
                default:
                    break;
            }
        }

        var matchTime = matchData.getMatchObjectProperty('matchDuration')/60,
            wardUptime = Math.round((wardTime/matchTime).toFixed(2)*100);

        $championInfo.append('<div class="wardInfo">Placed sightwards which laster for up to ' + wardTime + ' minutes that game, that\'s one ward ' + wardUptime + '% of the matchtime if they did not overlap' + (wardUptime > 100 ? ', which they obviously did' : '') + '.</div>');
        $championInfo.find('.wardInfo').append(wardUptime > 200 ? ' Awesome!' : wardUptime > 100 ? ' Good enough!' : wardUptime > 50 ? ' Meh.' : ' Terrible!');

        $c.empty();

        $c.append($championInfo);

        $c.find('#matchInfo')
    }

    function _renderTeams($c){
        var laneOrder = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'NONE'];

        for(var l in laneOrder){
            var currentLane = laneOrder[l];
            var participants = matchData.getParticipants();
            for(var c in participants){
                if(participants[c].lane === currentLane){
                    (function(){
                        var cName = participants[c].champion.name,
                            lane = participants[c].lane,
                            participant = c,
                            $li = $('<li class="matchChampion" participant="'+participant+'">'+ cName + ' - ' + lane + '</li>');

                        imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + participants[c].champion.image.full, function(image){
                            image.addClass('teamChampionIcon');
                            image.attr('champion', c.name);
                            image.attr('championId', c.id);
                            $li.prepend(image);
                        });

                        if(participants[c].team === 100){
                            $c.find('.team1').append($li);
                        } else {
                            $c.find('.team2').append($li);
                        }
                    })();
                }
            }
        }
    }

    function _renderMatchInfo($c){
        var participants = matchData.getParticipants();
        var team1 = {
                avgWinrate : 0,
                winRates : [],
                lanes : []
            },
            team2 = {
                avgWinrate : 0,
                winRates : [],
                lanes : []
            };
        for (var p in participants){
            var pc = participants[p].champion, // Player champion
                cd = champions[pc.id]; // Champion data

            if(participants[p].team === 100){
                team1.winRates.push(cd['winrate']*100);
                team1.avgWinrate += cd['winrate']*100;
            } else{
                team2.winRates.push(cd['winrate']*100);
                team2.avgWinrate += cd['winrate']*100;
            }
        }
        team1.avgWinrate = team1.avgWinrate/5;
        team2.avgWinrate = team2.avgWinrate/5;


        $c.find('#matchInfo').append('Blue team\'s champions win on average ' + team1.avgWinrate.toFixed(2) + '% of their matches, while the champions on the red team win ' + team2.avgWinrate.toFixed(2) + '%.<br />');

        var teams = matchData.getTeams(),
            winningTeam,
            losingTeam;

        if(team1.avgWinrate > team2.avgWinrate){
            if(teams[200].winner){
                $c.find('#matchInfo').append('Purple team takes home the victory in spite of the average win rate being lower! <br />');
            }
        } else if (team1.avgWinrate < team2.avgWinrate){
            if(teams[100].winner){
                $c.find('#matchInfo').append('Blue team takes home the victory in spite of the average win rate being lower! <br />');
            }
        }
        if(teams[200].winner){
            winningTeam = 200;
            losingTeam = 100;
        } else {
            winningTeam = 100;
            losingTeam = 200;
        }

        if(teams[winningTeam].firstBlood){
            $c.find('#matchInfo').append('Firstblood went to the victorious team. <br />')
        }
        if(!teams[winningTeam].firstInhibitor){
            $c.find('#matchInfo').append('The losing team secured the first inhibitor, but lost anyway! <br />')
        }
        if(teams[losingTeam].firstBaron){
            $c.find('#matchInfo').append('First baron was secured by the losing team, but it was not enough to secure the victory. <br />')
        }
    }

    function createMatchDetailPage(){
        var $c = $('<div class="championData"></div>');

        var pTimelines = matchData.getPlayerTimelines();
        pDescriptions = {};
        for (var p in pTimelines){
            pDescriptions[p] = _eventsToDescription(pTimelines[p]);
        }

        $c.append('<div id="matchInfo"></div>')


        $c.append($('<div id="map"></div>'));

        $c.append('<div id="championsInMatch"><ol class="team1"></ol><ol class="team2"></ol></div>')

        _renderTeams($c);
        _renderMatchInfo($c);

        $('.championContent').empty();
        $('.championContent').append($c);

        var cords = matchData.getCoordinates();

        var domain = {
                min: {x: -120, y: -120},
                max: {x: 14870, y: 14980}
            },
            width = 256,
            height = 256,
            bg = "https://s3-us-west-1.amazonaws.com/riot-api/img/minimap-ig.png",
            xScale, yScale, svg;

        color = d3.scale.linear()
            .domain([0, 3])
            .range(["white", "steelblue"])
            .interpolate(d3.interpolateLab);

        xScale = d3.scale.linear()
            .domain([domain.min.x, domain.max.x])
            .range([0, width]);

        yScale = d3.scale.linear()
            .domain([domain.min.y, domain.max.y])
            .range([height, 0]);

        svg = d3.select("#map").append("svg:svg")
            .attr("width", width)
            .attr("height", height);

        svg.append('image')
            .attr('xlink:href', bg)
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', width)
            .attr('height', height);


        var frame = 0;

        var champImages = {},
            participants = matchData.getParticipants();
        for (var p in participants){
            var c = participants[p].champion;

            var pId = p;
            var cImg = svg.append('image')
                .attr('xlink:href', config.ddragonbase + config.getVersion() + '/img/champion/' + c.image.full)
                .attr('class', 'champCoord')
                .style('opacity', '0.8')
                .attr('x', xScale(cords[frame][pId][0])-13)
                .attr('y', yScale(cords[frame][pId][1])-13)
                .attr('width', 25)
                .attr('height', 25);
            champImages[pId] = cImg;
        }
        $('#map').on('click', function(){
            frame++;
            if($.isEmptyObject(cords[frame])){
                frame = 0;
            }
            for (var p in participants){
                var pId = p;
                champImages[pId].transition()
                    .attr('x', xScale(cords[frame][pId][0])-13)
                    .attr('y', yScale(cords[frame][pId][1])-13);
            }
        });
    }

    function createFrontPage(){
        var $c = $('.championContent');
        $c.empty();
        $c.append('<div class="championStatLists"></div>');
        $c.append('<div class="generalStats"></div>');
    }

    function _renderGeneralStats(){
        var $c = $('.generalStats');

        var $list = $('<ol class="generalStatList"></ol>')
        $list.append('<li class="generalStatItem">Bot lane gets first blood in ' + _fixedPercent(generalStats.botfb/generalStats.totalGames) + '% of games.</li>')
        $list.append('<li class="generalStatItem">Jungle gets first blood in ' + _fixedPercent(generalStats.jungfb/generalStats.totalGames) + '% of games.</li>')
        $list.append('<li class="generalStatItem">Top lane gets first blood in ' + _fixedPercent(generalStats.midfb/generalStats.totalGames) + '% of games.</li>')
        $list.append('<li class="generalStatItem">Mid lane gets first blood in ' + _fixedPercent(generalStats.topfb/generalStats.totalGames) + '% of games.</li>')
        $list.append('<li class="generalStatItem">Teams who get first blood win ' + _fixedPercent(generalStats.teamWithFbWins/generalStats.totalGames) + '% of games.</li>')
        $list.append('<li class="generalStatItem">Team with the first drake wins ' + _fixedPercent(generalStats.teamWithFDWins/(generalStats.teamWithFDWins+generalStats.teamWithFDLosses)) + '% of games.</li>')
        $list.append('<li class="generalStatItem">Team with the first inhibitor wins ' + _fixedPercent(generalStats.teamWithFIWins/generalStats.totalGames) + '% of games.</li>')
        $c.append($list);
    }

    function _fixedPercent(decimal){
        return (decimal*100).toFixed(2)
    }

    function _renderChampionLists(){
        var $c = $('.championStatLists');

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
                    kWin = (killers[i].winrate*100).toFixed(2),
                    dpg = (diers[i].deathsInWins+ diers[i].deathsInLosses)/(diers[i].wins+ diers[i].losses),
                    dWin = (diers[i].winrate*100).toFixed(2),
                    apg = (assisters[i].assistsInWins+ assisters[i].assistsInLosses)/(assisters[i].wins+ assisters[i].losses),
                    aWin = (assisters[i].winrate*100).toFixed(2),
                    wpg = (warders[i].wardsPlacedInWins+ warders[i].wardsPlacedInLosses)/(warders[i].wins+ warders[i].losses),
                    wWin = (warders[i].winrate*100).toFixed(2);
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[killers[i].championId].image.full, function(image){
                    $tr.find('.kills').append(image).append('<br/>'+kpg.toFixed(2) + ' ' + kWin + '%');
                });
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[assisters[i].championId].image.full, function(image){
                    $tr.find('.assists').append(image).append('<br/>'+apg.toFixed(2) + ' ' + aWin + '%');
                });
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[diers[i].championId].image.full, function(image){
                    $tr.find('.deaths').append(image).append('<br/>'+dpg.toFixed(2) + ' ' + dWin + '%');
                });
                imagehandler.getImage(config.ddragonbase + config.getVersion() + '/img/champion/' + allChampions[warders[i].championId].image.full, function(image){
                    $tr.find('.wards').append(image).append('<br/>'+wpg.toFixed(2) + ' ' + wWin + '%');
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