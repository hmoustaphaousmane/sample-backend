const express = require("express");
const cron = require("node-cron");

const router = express.Router();

router.post("/schedule", (req, res, next) => {
  try {
    const { message, date } = req.body;

    let task;
    if (date) {
      const theDate = new Date(date); // => 2025-09-28T12:24:05.675Z

      // Extract key features from the date
      const seconds = theDate.getSeconds();
      const minutes = theDate.getMinutes();
      const hour = theDate.getHours();
      const dayOfTheMonth = theDate.getDate();
      const month = theDate.getMonth() + 1;
      const dayOfTheWeek = theDate.getDay(); // 0, 7 => Sunday, 1 => Monday, 2 => Tuesday, ...
      console.log(
        `${seconds}sec ${minutes}min ${hour}hr ${dayOfTheMonth}day of the month ${month} ${dayOfTheWeek}(Day of the week) *`
      );

      task = cron.schedule(
        `${seconds} ${minutes} ${hour} ${dayOfTheMonth} ${month} *`,
        () => {
          console.log(`Task: ${message}`);
        }
      );
    } else {
      task = cron.schedule("* * * * *", () => {
        console.log(`Task: ${message}`);
      });
    }

    console.log(task.id);

    res.send({
      message: "Cron job set successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send("An errer occured.");
  }
});

router.put("/action/:action", (req, res, next) => {
  try {
    const { taskId } = req.body;
    const { action } = req.params;

    const task = cron.getTask(taskId);

    if (!task)
      return res.status(404).send({
        message: "Task not found.",
      });

    if (action == "start") {
      task.start();
    } else if (action == "stop") {
      task.stop();
    } else {
      return res.status(400).send({
        message: "Invalid action.",
      });
    }

    res.send({
      message: "Task stopped successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send("An errer occured.");
  }
});

module.exports = router;
