const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { isValidDiuEmail, isNonEmptyString } = require('../utils/validators');
require('dotenv').config();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}


async function register(req, res, next) {
  try {
    const { name, student_id, email, password, department, batch, profile_image } = req.body;

    if (!isNonEmptyString(name, 2)) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }
    if (!isNonEmptyString(student_id)) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }
    if (!isValidDiuEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid DIU email address.' });
    }
    if (!isNonEmptyString(password, 6)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!isNonEmptyString(department) || !isNonEmptyString(batch)) {
      return res.status(400).json({ error: 'Department and batch are required.' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR student_id = ?',
      [email, student_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email or student ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, student_id, email, password, department, batch, profile_image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, student_id, email, hashedPassword, department, batch, profile_image || null]
    );

    const token = generateToken(result.insertId);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: result.insertId,
        name,
        student_id,
        email,
        department,
        batch
      }
    });
  } catch (err) {
    next(err);
  }
}


async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (user.is_blocked) {
      return res.status(403).json({ error: 'This account has been blocked. Contact admin support.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    delete user.password;

    res.json({ message: 'Logged in successfully.', token, user });
  } catch (err) {
    next(err);
  }
}


async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, student_id, email, department, batch, profile_image, phone,
              rating, total_ratings, people_helped, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
