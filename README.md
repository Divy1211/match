# Match Details Command on stream for Age of Empires II: Definitive Edition
1. This is an API for a getting the match details for streamers for AoE2DE.
2. The code in this repository is the browser version, and only an example which can't be used on stream to get the match details.
3. The API can be used by this link: https://alian713-twitch-commands.herokuapp.com/match
# Usage
1. The url for calling the API can take any combination of the following 4 parameters:
  a) name: Name of the player whoes match info is being requested. (If unspecified, defaults to: Alian713)
  b) previous: Specifies which match's details in the match history is being requested.
  for example, 0: ongoing/last played match, 1: match before the match 0, 2: match before the match 1, and so on...
  (if unspecified, defaults to 0)
  c) ranked: Specifies which ladder's rating of the players to show. 0: UR (Don't Show Ratings), 1: DM, 2: Team DM, 3: RM, 4: Team RM (If unspecified, defaults to 3)
  d) id: Steam ID of the player whoes match info is being requested. (If both the name and the id are specified, then the name is used to obtain the match details)

# Usage on Twitch with Nightbot:
`!addcom !match $(urlfetch https://alian713-twitch-commands.herokuapp.com/match?name=$(1)&previous=$(2)&ranked=$(3)&id=<your steam id here>)`. Now if someone uses !match, it will show them your previous game. but if they do !match <username> then it will show them that specified player's last match. Furthermore, if any parameters require to be skipped, then just use null in its place. For example: !match null null 4 will show you your previous match but the ratings will be from the Team RM ladder.
