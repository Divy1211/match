const fetch = require('node-fetch');

async function getSteamID(username) {
    var player_info = ``;
    try {
        for(var id = 0; id < 5; id++) {
            let url = `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=`+
            `${id}&start=1&count=100&search=${username}`;
            let res = await fetch(url);
            player_info = await res.json();
            if(player_info.count > 0)
                break;
        }
    } catch (error) {
        console.error(error);
    }
    if(player_info.count > 0) {
        for(var i = 0; i < player_info.leaderboard.length; i++) {
            if(player_info.leaderboard[i].name == username)
                return player_info.leaderboard[i].steam_id;
        }
        return player_info.leaderboard[0].steam_id;
    }
    return -1
}

async function getRating(username, leaderboard_id) {
    let url = `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=`+
    `${leaderboard_id}&start=1&count=100&search=${username}`;
    var player_info = ``;
    try {
        let res = await fetch(url);
        player_info = await res.json();
    } catch (error) {
        console.error(error);
    }
    if (player_info.count > 0) {
        for(var i = 0; i < player_info.leaderboard.length; i++) {
            if(player_info.leaderboard[i].name == username)
                return player_info.leaderboard[i].rating;
        }
    }
    return `???`;
}

async function getGameInfo() {
    let url = `https://aoe2.net/api/strings?game=aoe2de&language=en`;
    var game_info = ``;
    try {
        let res = await fetch(url);
        game_info = await res.json();
    } catch (error) {
        console.error(error);
    }
    return game_info;
}

async function getMatchInfo(query = null, id = null, show_elo_type = true, show_map_size = true) {
    if(show_elo_type == `false`)
        show_elo_type = false
    if(show_map_size == `false`)
        show_map_size = false
    var previous = null, username = null, leaderboard_id = null
    if(query) {
        query = query.toLowerCase()
        var pattern = /^\s*(.+?)??(?:(?:^|\s)+(1v1|tg))?(?:(?:^|\s)+(\d+))?\s*$/;
        var args = query.match(pattern)
        username = args[1]
        leaderboard_id = (args[2] == "1v1") ? 3 : (args[2] == "tg") ? 4 : 3
        previous = (args[3]) ? parseInt(args[3]) : null
    }
    // previous = parseInt(previous);
    // if(username == `null`)
    //     username = null;
    // if(leaderboard_id == `null`)
    //     leaderboard_id = null;
    var l_id = 3;
    var steam_id = `76561198276345085`;
    console.log(args)
    if(id)
        steam_id = id;
    if(username)
        steam_id = await getSteamID(username);
    if(leaderboard_id)
        l_id = leaderboard_id;
    if(steam_id == -1)
        return `Player Not Found`;
    var count = 1
    if(!isNaN(previous) && previous >= 0)
        count = previous+1;
    var match = ``;
    let url = `https://aoe2.net/api/player/matches?game=aoe2de&steam_id=${steam_id}`+
    `&count=${count}`;
    try {
        let res = await fetch(url);
        match = await res.json();
    } catch (error) {
        console.error(error);
    }
    var players = match[count-1].players;
    var roomid = match[count-1].match_id;
    var rated = match[count-1].leaderboard_id;
    if(0 < rated && rated <= 2)
        l_id-=2
    var map = match[count-1].rms;
    var def_map = match[count-1].map_type;
    var size = match[count-1].map_size;
    var cs = match[count-1].scenario;
    var teams = [];
    var count_num_teams = [];
    for(var i = 0; i < 5; i++) {
        teams[i] = ``;
        count_num_teams[i] = 0;
    }
    var game_info = await getGameInfo();
    var civs = game_info.civ;
    var game_type = match[count-1].game_type
    var game_type_list = ["RM", "RG", "DM", "CS", "", "", "KoTH", "WR", "DW", "TRM", "CTR", "SD", "BR", "EW"]
    game_type = game_type_list[game_type]
    if(def_map != 59) {
        map_list = game_info.map_type;
        for(var gmap of map_list) {
            if(gmap.id == def_map) {
                def_map = gmap.string
                break;
            }
        }
    }
    size = game_info.map_size[size].string;
    var coop = [];
    for(var i = 0; i < 9; i++)
        coop[i] = 0;
    for(var i = 0; i < players.length; i++) {
        var name = players[i].name;
        var rating = await getRating(name, l_id);
        if(leaderboard_id == 0)
            rating = `REPLACE_ME_1234567890`
        var colour = players[i].color;
        coop[colour]++;
        var team = players[i].team-1;
        count_num_teams[team]++;
        switch(parseInt(colour)) {
            case 1 :
                colour = `🔵`;
                break;
            case 2 :
                colour = `🔴`;
                break;
            case 3 :
                colour = `🟢`;
                break;
            case 4 :
                colour = `🟡`;
                break;
            case 5 :
                colour = `Ⓜ️`;
                break;
            case 6 :
                colour = `🟣`;
                break;
            case 7 :
                colour = `⚫`;
                break;
            case 8 :
                colour = `🟠`;
                break;        
        }
        if(coop[players[i].color] > 1) {
            var temp = ``;
            if(team > -1) {
                temp = teams[team];
                teams[team] = temp.substring(0, temp.indexOf(colour)) + `${colour}${name} (${rating}) + ${colour}`+temp.substring(temp.indexOf(colour)+2,temp.length);
            }
            else {
                temp = teams[4];
                teams[4] = temp.substring(0, temp.indexOf(colour)) + `${colour}${name} (${rating}) + ${colour}`+temp.substring(temp.indexOf(colour)+2,temp.length);
            }
        }
        else {
            var civ = civs[players[i].civ].string;
            if(name === null) {
                if(team > -1)
                    teams[team] += ` + ${colour}AI – ${civ}`;
                else
                    teams[4] += ` VS ${colour}AI – ${civ}`;
            }
            else {
                if(team > -1)
                    teams[team] += ` + ${colour}${name} (${rating}) – ${civ}`;
                else
                    teams[4] += ` VS ${colour}${name} (${rating}) – ${civ}`;
            }
        }
    }
    var output = ``;
    for(var i = 0; i < 5; i++) {
        if(!teams[i] == ``)
            output = output+teams[i].substring(3)+` VS `;
    }
    var type = ``;
    switch(rated) {
        case 0 :
            type = `UR ${game_type}`;
            break;
        case 1 :
            type = `DM`;
            break;
        case 2 :
            type = `DM`;
            break;
        case 3 :
            type = `RM`;
            break;
        case 4 :
            type = `RM`;
            break;
    }
    output = output.substring(0, output.length-4);
    if(cs)
        output += ` on ${cs.substring(0,cs.length-13)}`;
    else if(def_map != 59) {
        if(show_map_size)
            output += ` on ${def_map}, ${size}`;
        else
            output += ` on ${def_map}`;
    }
    else {
        if(show_map_size)
            output += ` on ${map.substring(0,map.length-4)}, ${size}`;
        else
            output += ` on ${map.substring(0,map.length-4)}`;
    }
    var elo_type = ``;
    var vs_type = ``;
    for(var i = 0; i < 5; i++) {
        if(i < 4 && count_num_teams[i] > 0)
            vs_type += `${count_num_teams[i]}v`;
        else if(i == 4 && count_num_teams[i] > 0) {
            for(var j = 0; j < i; j++)
                vs_type +=`1v`;
        }
    }
    vs_type = vs_type.substring(0,vs_type.length-1);
    if(!vs_type)
        vs_type = `FFA`
    if(show_elo_type) {
        if (l_id == 2 || l_id == 4)
            elo_type = `(showing TG elo) `;
        else if(l_id == 1 || l_id == 3)
            elo_type = `(showing 1v1 elo) `;
    }
    output = `${type} ${vs_type} ${elo_type}`+output+` ID: ${roomid}`;
    output = output.split(` (REPLACE_ME_1234567890)`).join(``);
    return output;
}

exports.getMatchInfo = getMatchInfo;