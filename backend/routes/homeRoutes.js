const express = require("express");
const deviceController = require('../controllers/homeController');
const router = express.Router();

router.post('/lights/schedule/:id', deviceController.scheduleLight);
router.post('/lights/schedule-delay/:id', deviceController.scheduleDelay);
router.post("/command", deviceController.sendCommand);
router.post('/lights/:id', deviceController.controlLight);

router.get('/lights', deviceController.getAllLights);
router.get('/system-chat', deviceController.getSystemChat);
router.post('/system-comfirm', deviceController.confirmChat);

module.exports = router;
