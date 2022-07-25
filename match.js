const fetch = require("node-fetch");

const leaderboard_ids = [3, 4, 0, 13, 14, 1, 2];
const game_type_acronyms = {
    0: "RM",
    1: "RG",
    2: "DM",
    3: "CS",
    6: "KotH",
    7: "WR",
    8: "DtW",
    9: "TRM",
    10: "CtR",
    11: "SD",
    12: "BR",
    13: "EW",
    15: "Co-Op",
};
const coop_map_names = {
    35319: "HB: Tours (732)",
    35321: "HB: Hastings (1066)",
    35612: "HB: Honfoglalás (895)",
    35613: "HB: Kurikara (1183)",
    35615: "HB: Bapheus (1302)",
    34959: "S: An Arabian Knight",
    34960: "S: Lord of Arabia",
    34961: "S: The Horns of Hattin",
    34962: "S: The Siege of Jerusalem",
    34963: "S: Jihad!",
    34964: "S: The Lion and the Demon",
    35229: "AtH: The Scourge of God",
    35230: "AtH: The Great Ride",
    35231: "AtH: The Walls of Constantinople",
    35232: "AtH: A Barbarian Betrothal",
    35233: "AtH: The Catalaunian Fields",
    35234: "AtH: The Fall of Rome",
    35429: "A: The Battle of the Frigidus",
    35430: "A: Razing Hellas",
    35431: "A: The Belly of the Beast",
    35432: "A: The Giant Falls",
    35433: "A: A Kingdom of Our Own",
    35618: "TiZ: The Battle of Guadalete",
    35619: "TiZ: Consolidation and Subjugation",
    35620: "TiZ: Divide and Conquer",
    35621: "TiZ: Crossing the Pyrenees",
    35622: "TiZ: Razzia",
    73405: "SI: Usurpation",
    73406: "SI: Quelling the Rebellion",
    73407: "SI: A Dangerous Mission",
    73408: "SI: Challenging a Thalassocracy",
    73409: "SI: Nirvanapada",
    73421: "T: Amir of Transoxiana",
    73422: "T: Gurkhan of Persia",
    73423: "T: Harbinger of Destruction",
    73424: "T: Sultan of Hindustan",
    73425: "T: Scourge of the Levant",
    73426: "T: A Titan Amongst Mortals",
};
const colour_map = {
    1: `🔵`,
    2: `🔴`,
    3: `🟢`,
    4: `🟡`,
    5: `Ⓜ️`,
    6: `🟣`,
    7: `⚫`,
    8: `🟠`,
};
const game_type_map = {
    0: `UR REPLACE_GAME_TYPE`,
    1: `DM`,
    2: `TDM`,
    3: `RM`,
    4: `TRM`,
    13: `EW`,
    14: `TEW`,
};
const leaderboard_id_map = {
    "1v1": 3,
    "1V1": 3,
    "tg": 4,
    "TG": 4,
    "tG": 4,
    "Tg": 4,
};

async function fetchjson(url) {
    return (await fetch(encodeURI(url))).json();
}

async function getSteamID(username) {
    var player_info = {};

    for (const id of leaderboard_ids) {
        const url = `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=${id}&start=1&count=100&search=${username}`;
        player_info[id] = await fetchjson(url);

        for (const player of player_info[id].leaderboard) {
            if (player.name == username && player.steam_id)
                return player.steam_id;
        }
    }

    for (const id of leaderboard_ids) {
        for (const player of player_info[id].leaderboard) {
            if (player.steam_id)
                return player.steam_id;
        }
    }

    return -1;
}

async function getRating(username, leaderboard_id) {
    const url = `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=${leaderboard_id}&start=1&count=100&search=${username}`;
    const player_info = await fetchjson(url);

    for (const player of player_info.leaderboard) {
        if (player.name == username)
            return player.rating;
    }
    return `???`;
}

async function getGameInfo() {
    const url = `https://aoe2.net/api/strings?game=aoe2de&language=en`;
    const game_info = await fetchjson(url);
    return game_info;
}

async function getMatchJSON(steam_id, count) {
    const url = `https://aoe2.net/api/player/matches?game=aoe2de&steam_id=${steam_id}` + `&count=${count+1}`;
    const match = await fetchjson(url);
    return match;
}

async function getMatchInfo(
    query = null,
    arg_steam_id = null,
    show_elo_type = true,
    show_map_size = true,
    show_victory = false
) {
    if (show_elo_type == `false`) show_elo_type = false;
    if (show_map_size == `false`) show_map_size = false;
    if (show_victory == `true`) show_victory = true;

    var arg_previous = null;
    var arg_username = null;
    var arg_leaderboard_id = null;

    // the query can be of the form "<username> 1v1/tg <previousCount>"
    if (query) {
        var pattern = /^\s*(.+?)??(?:(?:^|\s)+(1v1|tg|TG|tG|Tg))?(?:(?:^|\s)+(\d+))?\s*$/;
        var args = query.match(pattern);
        arg_username = args[1];
        arg_leaderboard_id = leaderboard_id_map[args[2]];
        arg_previous = args[3] ? parseInt(args[3]) : null;
    }

    var leaderboard_id = arg_leaderboard_id ?? 3;
    var steam_id = `76561198276345085`;
    var count = 0;

    if (arg_steam_id)
        steam_id = arg_steam_id;
    if (arg_username)
        steam_id = await getSteamID(arg_username);

    if (steam_id == -1)
        return `Player Not Found`;

    if (arg_previous && !isNaN(arg_previous) && arg_previous >= 0)
        count = arg_previous;
    const match = await getMatchJSON(steam_id, count);

    // extract info into variables
    var players = match[count].players;
    var lobby_id = match[count].match_id;

    var ladder_id = match[count].leaderboard_id ?? 0;
    if (1 <= ladder_id && ladder_id <= 2)
        leaderboard_id -= 2;
    else if (13 <= ladder_id && ladder_id <= 14)
        leaderboard_id += 10;

    var map_name = match[count].rms;
    var default_map = match[count].map_type;
    var size = match[count].map_size;
    var cs = match[count].scenario;

    var teams = [];
    var count_num_teams = [];
    for (var i = 0; i < 5; i++) {
        teams[i] = ``;
        count_num_teams[i] = 0;
    }

    // get a bunch of dicts that map IDs to human readable strings
    const game_info = await getGameInfo();

    size = `, ` + game_info.map_size[size].string;
    const game_type = game_type_acronyms[match[count].game_type];
    if (game_type == "Co-Op")
        cs = coop_map_names[cs] + ".aoe2scenario";

    // 59 is the ID used for custom, non standard maps so their names aren't present in the dict
    if (default_map != 59) {
        for (const map_type of game_info.map_type) {
            if (map_type.id == default_map) {
                default_map = map_type.string;
                break;
            }
        }
    }

    var coop = [];

    for (var i = 0; i < 9; i++)
        coop[i] = 0;

    for (const player of players) {
        player_rating = `RATING_PLACEHOLDER`;
        if (player.name)
        var player_rating = await getRating(player.name, leaderboard_id);
        
        if(player.team < 1 || player.team > 5) player.team = 5;
        count_num_teams[player.team - 1]++;
        
        if(player.color < 1 || player.color > 8) player.color = 1;
        coop[player.color]++;
        var colour = colour_map[player.color];
        
        var won = ` `;
        if (show_victory && player.won)
        won = ` (w) `;
        
        const team_index = player.team - 1;

        // temporarily, coop players aren't put together because aoe2.net needs to fix their damned API

        // if (coop[player.color] > 1) {
        //     const split_index = teams[team_index].indexOf(colour);

        //     // part of the string before colour is shown + additional colour info + part of string after colour
        //     teams[team_index] =
        //         teams[team_index].substring(0, split_index) +
        //         `${colour} ${player.name}${won}(${player_rating}) + ${colour}` +
        //         teams[team_index].substring(split_index + 2, teams[team_index].length);
        // } else {
            var civ = "Unknown";
            if (player.civ !== null && player.civ < game_info.civ.length)
            civ = game_info.civ[player.civ-1].string;
            teams[team_index] += ` ${player.team > 0 ? `+` : `VS`} ${colour} ${player.name ?? `AIs`} (${player_rating})${won}– ${civ}`;
        // }
    }

    teams[4] = teams[4].replace(/^\sVS\s/, '')
    
    var output = ``;
    for (var i = 0; i < 5; i++) {
        if (!teams[i] == ``)
            output = output +
                teams[i]
                .replace(/^(\s\+\s)/, '')
                .replace(/(\+\s(?:🔵|🔴|🟢|🟡|Ⓜ️|🟣|⚫|🟠)\s?)\s(?=\+)/, '')
                .replace(/(\+\s(?:🔵|🔴|🟢|🟡|Ⓜ️|🟣|⚫|🟠)\s?)$/, '') +
                ` VS `;
    }

    output = output.substring(0, output.length - 4);
    var type = game_type_map[ladder_id].replace("REPLACE_GAME_TYPE", `${game_type}`);

    if (cs)
        output += ` on ${cs.substring(0, cs.length - 13)}`;
    else
        output += ` on ${default_map != 59 ? default_map : map_name.substring(0, map_name.length - 4)}${show_map_size ? size : ``}`;

    var elo_type = ``;
    var vs_type = ``;
    for (var i = 0; i < 5; i++) {
        if (i < 4 && count_num_teams[i] > 0)
            vs_type += `${count_num_teams[i]}v`;
        else if(count_num_teams[i] > 0)
            vs_type += '1v'.repeat(count_num_teams[i]);
    }

    vs_type = vs_type.substring(0, vs_type.length - 1);
    if (!vs_type) vs_type = `FFA`;

    if (show_elo_type) {
        if ([2, 4, 14].includes(leaderboard_id)) elo_type = `(TG elo) `;
        else if ([1, 3, 13].includes(leaderboard_id)) elo_type = `(1v1 elo) `;
    }
    
    output = `${type} ${vs_type} ${elo_type}` + output + `, ID: ${lobby_id}`;
    output = output.split(` (RATING_PLACEHOLDER)`).join(``);
    
    return output;
}

exports.getMatchInfo = getMatchInfo;
