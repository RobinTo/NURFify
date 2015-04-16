var matchdata = function(matchData){
    var participants = {},
        playerTimelines = {},
        cords = {},
        teamData = {},
        rawMatchData = matchData;

    function _extractData(){

        _extractTimelinedata();
        _extractParticipants();
        _extractTeamData();
    }

    function _extractTeamData(){
        for (var t in matchData.teams){
            var team = matchData.teams[t],
                teamObject = team;

            teamData[team.teamId] = teamObject;
        }
    }

    function _extractParticipants(){
        for(var i = 0; i < matchData.participants.length; i++){
            var newPo = {};
            var p = matchData.participants[i];
            newPo.team = p.teamId;
            newPo.spell1 = p.spell1Id;
            newPo.spell2 = p.spell2Id;
            newPo.champion = staticdatahandler.getChampion(p.championId);
            newPo.tier = p.highestAchievedSeasonTier;
            newPo.lane = p.timeline.lane;
            newPo.role = p.timeline.role;
            participants[p.participantId] = newPo;
        }
        console.log(participants);
    }

    function _addEvent(pId, event){
        if(!(pId in playerTimelines)){
            playerTimelines[pId] = [];
        }
        playerTimelines[pId].push(event);
    }

    function _extractTimelinedata(){
        for(var i = 0; i < matchData.timeline.frames.length; i++){
            var frame = matchData.timeline.frames[i];
            cords[i] = {};

            for(var p in frame.participantFrames){
                if(typeof frame.participantFrames[p].position !== 'undefined'){
                    var point = [frame.participantFrames[p].position.x, frame.participantFrames[p].position.y];
                    cords[i][frame.participantFrames[p].participantId] = point;
                    console.log(frame.participantFrames[p].participantId);
                }
            }

            for(var e in frame.events){
                var event = frame.events[e];
                var pEvent = {
                    type: event.eventType
                }
                switch(event.eventType){
                    case 'ITEM_PURCHASED':
                        pEvent.item = event.itemId;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.participantId, pEvent);
                        break;
                    case 'ITEM_UNDO':
                        pEvent.itemBefore = event.itemBefore;
                        pEvent.itemAfter = event.itemAfter;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.participantId, pEvent);
                        break;
                    case 'SKILL_LEVEL_UP':
                        pEvent.skill = event.skillSlot;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.participantId, pEvent);
                        break;
                    case 'ITEM_DESTROYED':
                        pEvent.item = event.itemId;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.participantId, pEvent);
                        break;
                    case 'WARD_PLACED':
                        pEvent.wardType = event.wardType;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.creatorId, pEvent);
                        break;
                    case 'ELITE_MONSTER_KILL':
                        // According to forums this will dissapear, so just ignore them.
                        break;
                    case 'CHAMPION_KILL':
                        pEvent.timestamp = event.timestamp;
                        pEvent.victimId = event.victimId;
                        pEvent.assists = event.assistingParticipantIds;
                        _addEvent(event.killerId, pEvent);
                        var deathEvent = {
                            type: 'CHAMPION_DEATH',
                            timestamp: event.timestamp,
                            killerId: event.killerId,
                            assists: event.assistingParticipantIds
                        }
                        _addEvent(event.victimId, deathEvent);
                        for(var assist in event.assistingParticipantIds){
                            var assistEvent = {
                                type: 'CHAMPION_ASSIST',
                                timestamp: event.timestamp,
                                killerId: event.killerId,
                                victimId: event.victimId
                            }
                            _addEvent(event.assistingParticipantIds[assist], assistEvent);
                        }
                        break;
                    case 'BUILDING_KILL':
                        pEvent.timestamp = event.timestamp;
                        pEvent.lane = event.laneType;
                        pEvent.teamId = event.teamId;
                        pEvent.buildingType = event.buildingType;
                        pEvent.towerType = event.towerType;
                        _addEvent(event.killerId, pEvent);
                        break;
                    case 'ITEM_SOLD':
                        pEvent.item = event.itemId;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.participantId, pEvent);
                        break;
                    case 'WARD_KILL':
                        pEvent.wardType = event.wardType;
                        pEvent.timestamp = event.timestamp;
                        _addEvent(event.killerId, pEvent);
                        break;
                    default:
                        console.log('Unknowne event type: ' + event.eventType);
                        break;
                }
            }
        }
    }

    _extractData();

    return{
        getRawMatchObject : function(){
            return rawMatchData;
        },
        getMatchObjectProperty : function(prop){
            if(prop in rawMatchData){
                return rawMatchData[prop];
            } else{
                return false;
            }
        },
        getTeams : function(){
            return teamData;
        },
        getCoordinates : function(){
            return cords;
        },
        getParticipants : function(){
            return participants;
        },
        getPlayerTimelines : function(){
            return playerTimelines;
        }
    }
}