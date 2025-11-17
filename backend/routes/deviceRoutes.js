const express = require("express");
const deviceController = require('../controllers/deviceController');
const router = express.Router();

router.post('/light/schedule/:id', deviceController.scheduleLight);
router.post("/command", deviceController.sendCommand);
router.post('/light/:id', deviceController.controlLight);

module.exports = router;
