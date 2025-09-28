const express = require("express");
const cron = require("node-cron");

const router = express.Router();

router.post("/schedule", (req, res, next) => {
  try {
    const { message } = req.body;

    const task = cron.schedule("* * * * *", () => {
      console.log(`Task: ${message}`);
    });

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
