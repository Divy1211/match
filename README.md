# Match Details Command on stream for Age of Empires II: Definitive Edition
1. This is an API for a getting the match details for streamers for AoE2DE.
2. The code in this repository is the browser version, and only an example which can't be used on stream to get the match details.
3. The API can be used by this link: https://alian713-twitch-commands.herokuapp.com/match
# Usage
    https://alian713-twitch-commands.herokuapp.com/match/?match_params=<querystring>&id=<your steam id>&show_elo_type=<true/false>&show_map_size=<true/false>
    a) match_params: is a string that can contain three or lesser words in this order: <name of player> <1v1/tg> <previous match>
    b) show_elo_type: is a boolean that toggles showing the "(showing 1v1/tg elo)" text at the beginning of the returned string
    c) show_map_size: is a boolean that toggles showing the map size at the end of the returned string

# Usage on Twitch with Nightbot:
`!addcom !match $(urlfetch https://alian713-twitch-commands.herokuapp.com/match/?match_params=$(querystring)&id=<your steam id>&show_elo_type=<true/false>&show_map_size=<true/false>)`. Note that you need to replace `<your steam id>` with your steam id and `<true/false>` with your choice of boolean input in the url. Now if someone uses !match, it will show them your previous game. but if they do !match username then it will show them that specified player's last match. Furthermore, if any parameters require to be skipped, then just use null in its place. For example: !match null null 4 will show you your previous match but the ratings will be from the Team RM ladder.
