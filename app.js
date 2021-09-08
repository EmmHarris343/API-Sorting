import express from 'express';
import postsAPI from './postsAPI.js';
const app = express();
var port = 8000;

const router = express.Router();

var data = {
    "Ping API" : "/api/ping",
    "Tag API" : "/api/posts"
}

app.get('/', (req, res) => {
    return res.send(data);
});

// If page /api/ping is called return success true and response status of 200
app.get('/api/ping', (req,res) => {
    console.log("--- [Notice] - API /api/ping CALLED")
    res.status(200).json({ "success": true } )
});

app.use('/api/posts', postsAPI);

app.listen(port, () =>
    console.log("Started ; Listening @port: " + port)
);