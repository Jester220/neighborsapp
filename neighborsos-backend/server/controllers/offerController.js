const { pool } = require('../config/db');
const { createNotification } = require('../utils/notify');

// post offers  (any student can offer to help with an open request)
async function makeOffer(req, res, next) {
  try {
    const requestId = req.params.id;

    const [requestRows] = await pool.query('SELECT * FROM help_requests WHERE id = ?', [requestId]);
    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    const request = requestRows[0];

    if (request.user_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot offer to help with your own request.' });
    }
    if (request.status !== 'OPEN') {
      return res.status(400).json({ error: 'This request is no longer open for offers.' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM help_offers WHERE request_id = ? AND helper_id = ?',
      [requestId, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already offered to help with this request.' });
    }

    await pool.query(
      'INSERT INTO help_offers (request_id, helper_id, status) VALUES (?, ?, ?)',
      [requestId, req.user.id, 'PENDING']
    );

    await pool.query('UPDATE help_requests SET status = ? WHERE id = ?', ['HELP_OFFERED', requestId]);

    await createNotification(
      request.user_id,
      'Someone offered to help with your request.',
      'OFFER_RECEIVED',
      requestId
    );

    res.status(201).json({ message: 'Your offer to help has been sent.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/requests/:id/offers  (owner views offers on their request)
async function getOffersForRequest(req, res, next) {
  try {
    const [requestRows] = await pool.query('SELECT user_id FROM help_requests WHERE id = ?', [req.params.id]);
    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    if (requestRows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can view offers.' });
    }

    const [offers] = await pool.query(
      `SELECT ho.*, u.name, u.department, u.batch, u.rating, u.profile_image
       FROM help_offers ho
       JOIN users u ON ho.helper_id = u.id
       WHERE ho.request_id = ?
       ORDER BY ho.created_at ASC`,
      [req.params.id]
    );

    res.json(offers);
  } catch (err) {
    next(err);
  }
}

// accept  (requester only)
async function acceptOffer(req, res, next) {
  try {
    const [offerRows] = await pool.query(
      `SELECT ho.*, hr.user_id AS request_owner_id
       FROM help_offers ho
       JOIN help_requests hr ON ho.request_id = hr.id
       WHERE ho.id = ?`,
      [req.params.id]
    );

    if (offerRows.length === 0) {
      return res.status(404).json({ error: 'Offer not found.' });
    }
    const offer = offerRows[0];

    if (offer.request_owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can accept an offer.' });
    }

    if (offer.status !== 'PENDING') {
      return res.status(400).json({ error: 'This offer has already been responded to.' });
    }
    await pool.query('UPDATE help_offers SET status = ? WHERE id = ?', ['ACCEPTED', offer.id]);

    // Decline all other pending offers on this request
    await pool.query(
      'UPDATE help_offers SET status = ? WHERE request_id = ? AND id != ? AND status = ?',
      ['DECLINED', offer.request_id, offer.id, 'PENDING']
    );

    await pool.query('UPDATE help_requests SET status = ? WHERE id = ?', ['ACCEPTED', offer.request_id]);

    await createNotification(
      offer.helper_id,
      'Your help offer was accepted! You can now exchange contact information.',
      'OFFER_ACCEPTED',
      offer.request_id
    );

    res.json({ message: 'Offer accepted. Contact details can now be exchanged.' });
  } catch (err) {
    next(err);
  }
}

// requester can decline an offer, which will reopen the request if no other offers remain
async function declineOffer(req, res, next) {
  try {
    const [offerRows] = await pool.query(
      `SELECT ho.*, hr.user_id AS request_owner_id
       FROM help_offers ho
       JOIN help_requests hr ON ho.request_id = hr.id
       WHERE ho.id = ?`,
      [req.params.id]
    );
    if (offerRows.length === 0) {
      return res.status(404).json({ error: 'Offer not found.' });
    }
    const offer = offerRows[0];

    if (offer.request_owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can decline an offer.' });
    }

    await pool.query('UPDATE help_offers SET status = ? WHERE id = ?', ['DECLINED', offer.id]);

    // If no pending offers remain, reopen the request
    const [remaining] = await pool.query(
      'SELECT id FROM help_offers WHERE request_id = ? AND status = ?',
      [offer.request_id, 'PENDING']
    );
    if (remaining.length === 0) {
      await pool.query('UPDATE help_requests SET status = ? WHERE id = ?', ['OPEN', offer.request_id]);
    }

    await createNotification(offer.helper_id, 'Your help offer was declined.', 'OFFER_DECLINED', offer.request_id);

    res.json({ message: 'Offer declined.' });
  } catch (err) {
    next(err);
  }
}

// (login user can view all offer they have made, along with status and request details)
async function getMyOffers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ho.id AS offer_id, ho.status AS offer_status, ho.created_at AS offered_at,
              hr.id, hr.title, hr.category, hr.help_type, hr.status, hr.created_at, hr.urgency, hr.duration,
              u.name AS requester_name
       FROM help_offers ho
       JOIN help_requests hr ON ho.request_id = hr.id
       JOIN users u ON hr.user_id = u.id
       WHERE ho.helper_id = ?
       ORDER BY ho.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { makeOffer, getOffersForRequest, acceptOffer, declineOffer, getMyOffers };
