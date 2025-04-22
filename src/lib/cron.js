import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
    https.get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) console.log("GET request sent succesfully");
        else console.log("GET request failed", res.statusCode);

    }).on("error", (e) => console.error("Error while sending request", e));


});


export default job;


//* 14 * * * * - Every 14 min
// * 0 0 * * 0 - at midnigh on every sunday
// * 30 3 15 * * - at 3:30 AM on the 15 of every month
// * 0 0 1 1 * - at midnight on january 1st
// * 0 * * * * - every hour