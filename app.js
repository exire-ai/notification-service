const { MongoClient } = require("mongodb");
var kue = require("./kue");
require("./worker");

const RedisServer = require("redis-server");
main().catch(console.error);

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
