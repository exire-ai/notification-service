const { MongoClient } = require("mongodb");
const RedisServer = require("redis-server");

var kue = require("./kue");
var kue = require("./kue");
require("./worker");
console.log(process.env.REDIS_URL);
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("port", port);

app.get("/", (req, res) => res.send("Hello World!"));
app.post("/add", (req, res) => {
  var data = {};
  if (req.body.data != undefined) {
    data = req.body.data;
  }
  if (
    req.body.title != undefined &&
    req.body.time != undefined &&
    req.body.tokens != undefined
  ) {
    let args = {
      jobName: "sendNotification",
      time: req.body.time * 1000,
      params: {
        tokens: req.body.tokens,
        title: req.body.title,
        body: req.body.body,
        data: data,
      },
    };
    kue.scheduleJob(args);
    res.send(true);
  } else {
    res.send(false);
  }
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
