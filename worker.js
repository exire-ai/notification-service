var kue = require("kue");
var Queue = kue.createQueue({
  redis: process.env.REDIS_URL ? process.env.REDIS_URL : "127.0.0.1",
});
const { pushNotifs } = require("./expo");

Queue.process("sendNotification", async function (job, done) {
  let { data } = job;
  pushNotifs(data);
  done();
});
