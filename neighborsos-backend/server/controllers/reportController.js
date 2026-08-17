const { pool } = require('../config/db');
const { isNonEmptyString } = require('../utils/validators');

const VALID_REASONS = ['Spam', 'Inappropriate content', 'Harassment', 'Suspicious activity', 'Other'];

// post reports
async function createReport(req, res, next) {
  try {
    const { reported_user_id, request_id, reason, description } = req.body;

    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({ error: 'Please choose a valid report reason.' });
    }
    if (!reported_user_id && !request_id) {
      return res.status(400).json({ error: 'A report must reference a user or a request.' });
    }

    await pool.query(
      `INSERT INTO reports (reporter_id, reported_user_id, request_id, reason, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, reported_user_id || null, request_id || null, reason, description || null]
    );

    res.status(201).json({ message: 'Report submitted. Our team will review it shortly.' });
  } catch (err) {
    next(err);
  }
}

// GET (basic admin view)   
async function getAllReports(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, reporter.name AS reporter_name, reported.name AS reported_name
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       LEFT JOIN users reported ON r.reported_user_id = reported.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// update the report status (admin only)
async function updateReportStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['OPEN', 'REVIEWED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Report status updated.' });
  } catch (err) {
    next(err);
  }
}

// block a user (admin only)
async function blockUser(req, res, next) {
  try {
    await pool.query('UPDATE users SET is_blocked = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'User blocked.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport, getAllReports, updateReportStatus, blockUser };
