const express = require(`express`);
const app = express();
const port = process.env.PORT || 3000;
const match = require(`./match.js`);
app.get(`/match`, async function(req, res) {
    const result = await match.getMatchInfo(req.query.match_params, req.query.id, req.query.show_elo_type, req.query.show_map_size);
    res.send(result);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});