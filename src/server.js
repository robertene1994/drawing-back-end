const express = require("express"),
    app = express(),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    mongo = require("mongodb"),
    dotenv = require('dotenv'),
    crypto = require("crypto"),
    http = require("http"),
    jwt = require("jsonwebtoken"),
    uuid = require('uuid/v4'),
    WebSocketServer = require('ws').Server,
    server = http.createServer(app),
    wss = new WebSocketServer({
        server: server,
        path: "/draw"
    }),
    port = process.env.PORT || '4201';


// Dotenv
dotenv.config();

// Variables
app.set("port", port);
app.set("dbUri", process.env.DB_URI);
app.set("mongo", mongo);
app.set("sessionSecret", process.env.SESSION_SECRET);
app.set("crypto", crypto);
app.set("jwt", jwt);
app.set("uuid", uuid);
app.set("wss", wss);

// Dependencies config
app.use(cors());
app.use(bodyParser.json());

// Routers
require("./routers/user-token")(app, express);

// Routes
require("./routes/user")(app);
require("./routes/draw")(app);

// Error handler
require("./error-handler/error-handler")(app);

server.listen(app.get("port"), () => {
    console.log(`Server started on port ${app.get("port")}.`);
});
