const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleControllers");

router.get("/", scheduleController.getAllSchedule);
router.post("/", scheduleController.createSchedule);
router.patch("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
