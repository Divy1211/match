async function getSteamID(username) {
    var player_info = ``;
    try {
        for(var id = 0; id < 5; id++) {
            let url = `https://cors-anywhere.herokuapp.com/`+
            `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=`+
            `${id}&start=1&count=1&search=${username}`;
            let res = await fetch(url);
            player_info = await res.json();
            if(player_info.count > 0)
                break;
        }
    } catch (error) {
        console.error(error);
    }
    if(player_info.count > 0)
        return player_info.leaderboard[0].steam_id;
    return -1
}

async function getRating(username, leaderboard_id) {
    let url = `https://cors-anywhere.herokuapp.com/`+
    `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=`+
    `${leaderboard_id}&start=1&count=1&search=${username}`;
    var player_info = ``;
    try {
        let res = await fetch(url);
        player_info = await res.json();
    } catch (error) {
        console.error(error);
    }
    if (player_info.count > 0)
        return player_info.leaderboard[0].rating;
    return `???`;
}

async function getGameInfo() {
    let url = `https://cors-anywhere.herokuapp.com/`+
    `https://aoe2.net/api/strings?game=aoe2de&language=en`;
    var game_info = ``;
    try {
        let res = await fetch(url);
        game_info = await res.json();
    } catch (error) {
        console.error(error);
    }
    return game_info;
}

async function getMatchInfo() {
    var querystring = window.location.search;
    var urlparams = new URLSearchParams(querystring);
    var previous = parseInt(urlparams.get(`previous`));
    var count = 1;
    var username = urlparams.get(`name`);
    if(username == `null`)
        username = null;
    var leaderboard_id = urlparams.get(`ranked`);
    if(leaderboard_id == `null`)
        leaderboard_id = null;
    var l_id = 3;
    var steam_id = `76561198276345085`;
    if(leaderboard_id)
        l_id = leaderboard_id;
    if(username)
        var steam_id = await getSteamID(username);
    if(steam_id == -1) {
        document.write(`Player Not Found`);
        return;
    }
    var id = urlparams.get(`id`);
    if(!isNaN(previous) && previous >= 0)
        count = previous+1;
    if(id)
     steam_id = id;

     var match = ``;
    let url = `https://cors-anywhere.herokuapp.com/`+
    `https://aoe2.net/api/player/matches?game=aoe2de&steam_id=${steam_id}`+
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
    var map = match[count-1].rms;
    var def_map = match[count-1].map_type;
    var size = match[count-1].map_size;
    var cs = match[count-1].scenario;
    var teams = [];
    for(var i = 0; i < 5; i++)
        teams[i] = ``;
    var game_info = await getGameInfo();
    var civs = game_info.civ;
    var game_type = match[count-1].game_type
    var game_type_list = ["RM", "RG", "DM", "CS", "", "", "KoTH", "WR", "DW", "TRM", "CTR", "SD", "EW"]
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
        var colour = players[i].color;
        coop[colour]++;
        var team = players[i].team;
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
                temp = teams[team-1];
                teams[team-1] = temp.substring(0, temp.indexOf(colour)) + `${colour} ${name} (${rating}) + ${colour} `+temp.substring(temp.indexOf(colour)+2,temp.length);
            }
            else {
                temp = teams[4];
                teams[4] = temp.substring(0, temp.indexOf(colour)) + `${colour} ${name} (${rating}) + ${colour} `+temp.substring(temp.indexOf(colour)+2,temp.length);
            }
        }
        else {
            var civ = civs[players[i].civ].string;
            if(name === null) {
                if(team > -1)
                    teams[team-1] += ` + ${colour} AI as ${civ}`;
                else
                    teams[4] += ` vs ${colour} AI as ${civ}`;
            }
            else {
                if(team > -1)
                    teams[team-1] += ` + ${colour} ${name} (${rating}) as ${civ}`;
                else
                    teams[4] += ` vs ${colour} ${name} (${rating}) as ${civ}`;
            }
        }
    }
    var output = ``;
    for(var i = 0; i < 5; i++) {
        if(!teams[i] == ``)
            output = output+teams[i].substring(3)+` vs `;
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
    
    output = `Game ID: ${roomid}: ${type}`+output;
    output = output.substring(0, output.length-4);
    if(def_map != 59)
        output += ` on ${def_map}, ${size}`;
    else if(cs)
        output += ` on ${cs.substring(0,cs.length-13)}`;
    else
        output += ` on ${map.substring(0,map.length-4)}, ${size}`;
    document.write(output);
    return output;
}

getMatchInfo();