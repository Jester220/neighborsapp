const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { acceptOffer, declineOffer, getMyOffers } = require('../controllers/offerController');

router.get('/mine', requireAuth, getMyOffers);
router.put('/:id/accept', requireAuth, acceptOffer);
router.put('/:id/decline', requireAuth, declineOffer);

module.exports = router;
