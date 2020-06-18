var kue = require("kue");

var Queue = kue.createQueue({ redis: {
  port: process.env.REDIS_PORT || process.env.REDIS_PORT,
  host: process.env.REDIS_HOST || 'redis//127.0.0.1'
}});

let scheduleJob = (data) => {
  Queue.createJob(data.jobName, data.params)
    .attempts(3)
    .delay(data.time - Date.now())
    .save();
};

module.exports = { scheduleJob };
