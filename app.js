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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

main().catch(console.error);

app.set("port", port);

async function main() {
  const uri =
    "mongodb+srv://fpinnola:F55server-e@cluster0-w3lve.mongodb.net/NotificationQueue?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();

    const collection = client.db("NotificationQueue").collection("Data");
    const changeStream = collection.watch(
      [{ $match: { operationType: "insert" } }],
      { fullDocument: "updateLookup" }
    );
    changeStream.on("change", (next) => {
      //UPDATE switch token to array, for sending same notif to group of users
      let args = {
        jobName: "sendNotification",
        time: next.fullDocument.time * 1000,
        params: {
          token: next.fullDocument.token,
          title: next.fullDocument.title,
          body: next.fullDocument.body,
        },
      };
      kue.scheduleJob(args);
    });
  } catch (e) {
    console.log(e);
  }
}

app.get("/", (req, res) => res.send("Hello World!"));
app.post("/add", (req, res) => {
  if (
    req.body.title != undefined &&
    req.body.time != undefined &&
    req.body.token != undefined
  ) {
    let args = {
      jobName: "sendNotification",
      time: req.body.time * 1000,
      params: {
        token: req.body.token,
        title: req.body.title,
        body: req.body.body,
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
