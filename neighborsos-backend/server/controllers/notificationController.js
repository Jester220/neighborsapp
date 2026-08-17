const { pool } = require('../config/db');

// get notifications
async function getNotifications(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// put notifications=> id/read
async function markAsRead(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT user_id FROM notifications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You cannot modify another user\'s notifications.' });
    }

    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead };
