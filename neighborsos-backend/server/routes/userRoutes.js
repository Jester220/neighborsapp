const express = require('express');
const router = express.Router();
const { getUserById, updateProfile, updateLocation } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.put('/profile', requireAuth, updateProfile);
router.put('/location', requireAuth, updateLocation);
router.get('/:id', requireAuth, getUserById);

module.exports = router;
