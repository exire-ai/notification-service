var kue = require("kue");

var Queue = kue.createQueue({ redis: {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST
}});

let scheduleJob = (data) => {
  Queue.createJob(data.jobName, data.params)
    .attempts(3)
    .delay(data.time - Date.now())
    .save();
};

module.exports = { scheduleJob };
