const cron = require("cron");
const https = require("https");

const backendUrl = "https://ecommerce-project-backend-lqhu.onrender.com/";

const cronExpression = "*/14 * * * *";

const job = new cron.CronJob(cronExpression, function () {
  console.log("Restarting Server");

  https
    .get(backendUrl, (res) => {
      if (res.statusCode === 200) {
        console.log("Server Restarted");
      } else {
        console.error(
          `Failed to restart server with status code: ${res.statusCode}`
        );
      }
    })
    .on("error", (err) => {
      console.error(`Error during restart:`, err.message);
    });
});

module.exports = job;
