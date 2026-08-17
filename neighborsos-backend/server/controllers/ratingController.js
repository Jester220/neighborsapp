const { pool } = require('../config/db');
const { isValidRating } = require('../utils/validators');
const { createNotification } = require('../utils/notify');

//   (requester can  rate the helper after completion and option to leave a review)
async function createRating(req, res, next) {
  try {
    const { request_id, rating, review } = req.body;

    if (!request_id) {
      return res.status(400).json({ error: 'request_id is required.' });
    }
    if (!isValidRating(rating)) {
      return res.status(400).json({ error: 'Rating must be a whole number between 1 and 5.' });
    }

    const [requestRows] = await pool.query('SELECT * FROM help_requests WHERE id = ?', [request_id]);
    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    const request = requestRows[0];

    if (request.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can rate the helper.' });
    }
    if (request.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'You can only rate after the request is marked completed.' });
    }

    const [offerRows] = await pool.query(
      `SELECT helper_id FROM help_offers WHERE request_id = ? AND status = 'ACCEPTED'`,
      [request_id]
    );
    if (offerRows.length === 0) {
      return res.status(400).json({ error: 'No accepted helper found for this request.' });
    }
    const helperId = offerRows[0].helper_id;

    const [existingRating] = await pool.query('SELECT id FROM ratings WHERE request_id = ?', [request_id]);
    if (existingRating.length > 0) {
      return res.status(409).json({ error: 'You have already rated this request.' });
    }

    await pool.query(
      'INSERT INTO ratings (request_id, helper_id, requester_id, rating, review) VALUES (?, ?, ?, ?, ?)',
      [request_id, helperId, req.user.id, rating, review || null]
    );

    // Recalculate the helper's average rating
    const [avgRows] = await pool.query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM ratings WHERE helper_id = ?',
      [helperId]
    );
    const avgRating = Number(avgRows[0].avg_rating).toFixed(2);

    await pool.query(
      'UPDATE users SET rating = ?, total_ratings = ?, people_helped = people_helped + 1 WHERE id = ?',
      [avgRating, avgRows[0].total, helperId]
    );

    await createNotification(helperId, 'You received a new rating.', 'NEW_RATING', request_id);

    res.status(201).json({ message: 'Thanks for your rating!' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRating };
