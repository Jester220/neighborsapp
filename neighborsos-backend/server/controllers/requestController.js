const { pool } = require('../config/db');
const { distanceInMeters, formatDistance } = require('../utils/haversine');
const { isNonEmptyString, isValidRadius } = require('../utils/validators');

const VALID_URGENCY = ['low', 'medium', 'high'];

// login user can create a request for help which will be visible to nearby users 

async function createRequest(req, res, next) {
  try {
    const {
      title, description, category, help_type,
      latitude, longitude, radius, urgency, duration, image
    } = req.body;

    if (!isNonEmptyString(title, 3)) {
      return res.status(400).json({ error: 'Request title must be at least 3 characters.' });
    }
    if (!isNonEmptyString(description, 10)) {
      return res.status(400).json({ error: 'Please add a short description (at least 10 characters).' });
    }
    if (!isNonEmptyString(category) || !isNonEmptyString(help_type)) {
      return res.status(400).json({ error: 'Category and help type are required.' });
    }
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Location permission is required to create a request.' });
    }
    if (!isValidRadius(radius)) {
      return res.status(400).json({ error: 'Radius must be one of 500m, 1km, 2km, or 5km.' });
    }
    if (urgency && !VALID_URGENCY.includes(urgency)) {
      return res.status(400).json({ error: 'Invalid urgency level.' });
    }

    const [result] = await pool.query(
      `INSERT INTO help_requests
       (user_id, title, description, category, help_type, latitude, longitude, radius, urgency, duration, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, category, help_type, latitude, longitude,
        radius, urgency || 'medium', duration || null, image || null]
    );

    res.status(201).json({ message: 'Request created.', requestId: result.insertId });
  } catch (err) {
    next(err);
  }
}

// login user can view their own request
async function getMyRequests(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM help_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// nearby users can view and open their nearby requests

async function getNearbyRequests(req, res, next) {
  try {
    const [userRows] = await pool.query('SELECT latitude, longitude FROM users WHERE id = ?', [req.user.id]);
    const me = userRows[0];

    if (!me || me.latitude === null || me.longitude === null) {
      return res.status(400).json({ error: 'Please enable location sharing to see nearby requests.' });
    }

    const { category, urgency, help_type, search } = req.query;

    let query = `
      SELECT hr.*, u.name AS requester_name, u.rating AS requester_rating
      FROM help_requests hr
      JOIN users u ON hr.user_id = u.id
      WHERE hr.status = 'OPEN' AND hr.user_id != ?
    `;
    const params = [req.user.id];

    if (category) { query += ' AND hr.category = ?'; params.push(category); }
    if (urgency) { query += ' AND hr.urgency = ?'; params.push(urgency); }
    if (help_type) { query += ' AND hr.help_type = ?'; params.push(help_type); }
    if (search) { query += ' AND (hr.title LIKE ? OR hr.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY hr.created_at DESC';

    const [rows] = await pool.query(query, params);

    // map each request to include distance and filter by radius

    const nearby = rows
      .map((r) => {
        const distance = distanceInMeters(me.latitude, me.longitude, r.latitude, r.longitude);
        return { ...r, distanceMeters: Math.round(distance), distanceLabel: formatDistance(distance) };
      })
      .filter((r) => r.distanceMeters <= r.radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    // Never send exact location  to the client
    nearby.forEach((r) => {
      delete r.latitude;
      delete r.longitude;
    });

    res.json(nearby);
  } catch (err) {
    next(err);
  }
}

// GET  request by id (any user can view a request, but only the owner can see exact location)
async function getRequestById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT hr.*, u.name AS requester_name, u.rating AS requester_rating, u.department, u.batch
       FROM help_requests hr
       JOIN users u ON hr.user_id = u.id
       WHERE hr.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const request = rows[0];

    // Only the owner can see the exact coordinates
    if (request.user_id !== req.user.id) {
      delete request.latitude;
      delete request.longitude;
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
}

// edit request (only the owner can edit their request)
async function updateRequest(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT user_id, status FROM help_requests WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own requests.' });
    }
    if (rows[0].status !== 'OPEN') {
      return res.status(400).json({ error: 'Only open requests can be edited.' });
    }

    const { title, description, category, help_type, urgency, duration } = req.body;
    const fields = [];
    const values = [];

    if (title) { fields.push('title = ?'); values.push(title); }
    if (description) { fields.push('description = ?'); values.push(description); }
    if (category) { fields.push('category = ?'); values.push(category); }
    if (help_type) { fields.push('help_type = ?'); values.push(help_type); }
    if (urgency) { fields.push('urgency = ?'); values.push(urgency); }
    if (duration !== undefined) { fields.push('duration = ?'); values.push(duration); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE help_requests SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Request updated.' });
  } catch (err) {
    next(err);
  }
}

// delete request (owner only)
async function deleteRequest(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT user_id FROM help_requests WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own requests.' });
    }

    await pool.query('DELETE FROM help_requests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Request deleted.' });
  } catch (err) {
    next(err);
  }
}

// complete request (owner only)
async function completeRequest(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT user_id, status FROM help_requests WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can mark this as completed.' });
    }
    if (rows[0].status !== 'IN_PROGRESS' && rows[0].status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'This request cannot be completed from its current status.' });
    }

    await pool.query('UPDATE help_requests SET status = ? WHERE id = ?', ['COMPLETED', req.params.id]);
    res.json({ message: 'Request marked as completed. You can now rate your helper.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getMyRequests,
  getNearbyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  completeRequest
};
