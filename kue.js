var kue = require("kue");
var Queue = kue.createQueue({ redis: process.env.REDIS_URL });

let scheduleJob = (data) => {
  Queue.createJob(data.jobName, data.params)
    .attempts(3)
    .delay(data.time - Date.now())
    .save();
};

module.exports = { scheduleJob };
