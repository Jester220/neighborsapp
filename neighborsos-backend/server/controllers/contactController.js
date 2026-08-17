const { pool } = require('../config/db');
const { isValidPhone } = require('../utils/validators');
const { createNotification } = require('../utils/notify');


// Both the requester and the accepted helper can submit their contact info.
//  then one can see other contact details
async function submitContact(req, res, next) {
  try {
    const requestId = req.params.id;
    const { phone, whatsapp, message } = req.body;

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }
    if (!phone && !whatsapp) {
      return res.status(400).json({ error: 'Please provide at least a phone number or WhatsApp number.' });
    }

    const [requestRows] = await pool.query('SELECT * FROM help_requests WHERE id = ?', [requestId]);
    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    const request = requestRows[0];

    const [acceptedOfferRows] = await pool.query(
      `SELECT helper_id FROM help_offers WHERE request_id = ? AND status = 'ACCEPTED'`,
      [requestId]
    );

    const isOwner = request.user_id === req.user.id;
    const isAcceptedHelper = acceptedOfferRows.length > 0 && acceptedOfferRows[0].helper_id === req.user.id;

    if (!isOwner && !isAcceptedHelper) {
      return res.status(403).json({ error: 'Contact info can only be shared after an offer has been accepted.' });
    }
    if (!['ACCEPTED', 'IN_PROGRESS'].includes(request.status)) {
      return res.status(400).json({ error: 'Contact exchange is not available for this request right now.' });
    }

    await pool.query(
      `INSERT INTO contacts (request_id, user_id, phone, whatsapp, message) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE phone = VALUES(phone), whatsapp = VALUES(whatsapp), message = VALUES(message)`,
      [requestId, req.user.id, phone || null, whatsapp || null, message || null]
    );

    // Move status forward once contact is shared
    if (request.status === 'ACCEPTED') {
      await pool.query('UPDATE help_requests SET status = ? WHERE id = ?', ['IN_PROGRESS', requestId]);
    }

    const otherUserId = isOwner ? acceptedOfferRows[0].helper_id : request.user_id;
    await createNotification(otherUserId, 'You can now exchange contact information.', 'CONTACT_READY', requestId);

    res.status(201).json({ message: 'Contact info shared.' });
  } catch (err) {
    next(err);
  }
}

//   (returns the OTHER party's contact info, only if both sides shared)
async function getContact(req, res, next) {
  try {
    const requestId = req.params.id;

    const [contacts] = await pool.query('SELECT * FROM contacts WHERE request_id = ?', [requestId]);
    const myContact = contacts.find((c) => c.user_id === req.user.id);
    const otherContact = contacts.find((c) => c.user_id !== req.user.id);

    if (!myContact) {
      return res.status(400).json({ error: 'Please share your own contact info first.' });
    }
    if (!otherContact) {
      return res.status(202).json({ message: 'Waiting for the other student to share their contact info.' });
    }

    res.json(otherContact);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact, getContact };
