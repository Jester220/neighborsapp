const { pool } = require('../config/db');

// Inserts a notification row for a user. Call this anywhere something happens
// that the user should be told about (offer received, offer accepted, etc.)
async function createNotification(userId, message, type, relatedRequestId = null) {
  await pool.query(
    'INSERT INTO notifications (user_id, message, type, related_request_id) VALUES (?, ?, ?, ?)',
    [userId, message, type, relatedRequestId]
  );
}

module.exports = { createNotification };
