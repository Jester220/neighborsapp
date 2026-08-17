const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createRating } = require('../controllers/ratingController');

router.post('/', requireAuth, createRating);

module.exports = router;
