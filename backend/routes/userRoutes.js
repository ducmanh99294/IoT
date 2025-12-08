const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// AUTH
router.post('/register', userController.register);
router.post('/login', userController.login);

// CRUD
router.get('/:id', userController.getById);
router.put('/:id', userController.updateById);
router.delete('/:id', userController.deleteById);

// LOCK / UNLOCK
router.put('/lock/:id', userController.lockById);
router.put('/unlock/:id', userController.unlockById);

module.exports = router;
