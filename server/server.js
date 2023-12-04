const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(require("./routes/user"));
app.use(require("./routes/mapping"));
app.use(require("./routes/table"));
// get driver connection
const dbo = require("./db/conn");
const path = require("path");

const https = require('https');
const http = require('http');
const fs = require('fs');
const key = fs.readFileSync(__dirname + '/../certs/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/../certs/selfsigned.crt');

options = {
  key: key,
  cert: cert
}

//const frontend = express();
//frontend.use(cors());
//frontend.use(express.json());
app.use(express.static(path.join(__dirname, "../client", "build")));
// app.use(express.static(path.join(__dirname, "../client", "public")));

//const server = http.createServer(app);
const server = https.createServer(options, app);

server.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
   });
  console.log(`Server is running on port: ${port}`);
});

//server.listen(443);
module.exports = server
