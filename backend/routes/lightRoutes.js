const express = require('express');
const router = express.Router();
const lightController = require('../controllers/lightController');

router.get('/lights', lightController.getAllLights);

module.exports = router;
