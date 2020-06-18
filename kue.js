var kue = require("kue");

var Queue = kue.createQueue({ redis: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });

let scheduleJob = (data) => {
  Queue.createJob(data.jobName, data.params)
    .attempts(3)
    .delay(data.time - Date.now())
    .save();
};

module.exports = { scheduleJob };
