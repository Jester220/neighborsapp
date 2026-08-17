const { pool } = require('../config/db');
const { isValidPhone, isNonEmptyString } = require('../utils/validators');

// get user by ID (public profile - no email/phone exposed)
async function getUserById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, department, batch, profile_image, rating, total_ratings, people_helped, created_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// update profile (only the login user can update their own profile)
async function updateProfile(req, res, next) {
  try {
    const { name, department, batch, profile_image, phone } = req.body;

    if (name && !isNonEmptyString(name, 2)) {
      return res.status(400).json({ error: 'Please enter a valid name.' });
    }
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }

    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (department) { fields.push('department = ?'); values.push(department); }
    if (batch) { fields.push('batch = ?'); values.push(batch); }
    if (profile_image !== undefined) { fields.push('profile_image = ?'); values.push(profile_image); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/location  (called from browser geolocation on the frontend)
async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }
    await pool.query('UPDATE users SET latitude = ?, longitude = ? WHERE id = ?', [
      latitude, longitude, req.user.id
    ]);
    res.json({ message: 'Location updated.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserById, updateProfile, updateLocation };
