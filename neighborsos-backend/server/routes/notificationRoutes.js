const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.get('/', requireAuth, getNotifications);
router.put('/:id/read', requireAuth, markAsRead);

module.exports = router;
