const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  createReport,
  getAllReports,
  updateReportStatus,
  blockUser
} = require('../controllers/reportController');

router.post('/', requireAuth, createReport);

// Basic admin routes. In production, add an isAdmin check to requireAuth
// (e.g. an `is_admin` column on users) before trusting these.
router.get('/', requireAuth, getAllReports);
router.put('/:id/status', requireAuth, updateReportStatus);
router.put('/user/:id/block', requireAuth, blockUser);

module.exports = router;
