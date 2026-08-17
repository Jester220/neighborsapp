const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const {
  createRequest,
  getMyRequests,
  getNearbyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  completeRequest
} = require('../controllers/requestController');

const { makeOffer, getOffersForRequest } = require('../controllers/offerController');
const { submitContact, getContact } = require('../controllers/contactController');

// Static routes first so they aren't swallowed by /:id
router.get('/nearby', requireAuth, getNearbyRequests);

router.get('/', requireAuth, getMyRequests);
router.post('/', requireAuth, createRequest);

router.get('/:id', requireAuth, getRequestById);
router.put('/:id', requireAuth, updateRequest);
router.delete('/:id', requireAuth, deleteRequest);
router.put('/:id/complete', requireAuth, completeRequest);

router.post('/:id/offer', requireAuth, makeOffer);
router.get('/:id/offers', requireAuth, getOffersForRequest);

router.post('/:id/contact', requireAuth, submitContact);
router.get('/:id/contact', requireAuth, getContact);

module.exports = router;
