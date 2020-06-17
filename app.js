const { MongoClient } = require("mongodb");
var kue = {};
require("./worker");

const RedisServer = require("redis-server");

const server = new RedisServer(6370);

server.open((err) => {
  if (err === null) {
    kue = require("./kue");
    main().catch(console.error);
  }
});

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

// async function getAllNotifications(client) {
//   const cursor = client.db("NotificationQueue").collection("Data").find();
//   const results = await cursor.toArray();
//   if (results.length > 0) {
//     console.log(results);
//   } else {
//     console.log("Found Nun");
//   }
// }

// async function observe(client) {
//   cursor = client
//     .db("NotificationQueue")
//     .collection("Data")
//     .changes([
//       {
//         $match: {
//           operationType: { $in: ["insert", "replace"] },
//         },
//       },
//       {
//         $match: {
//           "newDocument.n": { $gte: 1 },
//         },
//       },
//     ]);
//   const results = await cursor.toArray();

//   // # Loops forever.
//   for (var i = 0; i < cursor.length; i++) {
//     print(change[i]["newDocument"]);
//   }
// }

// async function listDatabases(client) {
//   databasesList = await client.db().admin().listDatabases();

//   console.log("Databases:");
//   databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
// }
