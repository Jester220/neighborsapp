// Run with: npm run seed
// Populates the database with sample DIU students and help requests
// so the app looks alive during a demo. Safe to run multiple times
// on a fresh database (uses INSERT IGNORE where relevant).

const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
require('dotenv').config();

// A rough center point around DIU's Daffodil Smart City campus (Ashulia).
// Sample points are offset slightly from this so distances vary.
const BASE_LAT = 23.9083;
const BASE_LNG = 90.3512;

const students = [
  { name: 'Tanzid Hasan', student_id: '221-15-4501', email: 'tanzid.15@diu.edu.bd', department: 'Software Engineering', batch: 'Batch 58' },
  { name: 'Rahim Ahmed', student_id: '221-15-4502', email: 'rahim.15@diu.edu.bd', department: 'CSE', batch: 'Batch 57' },
  { name: 'Nusrat Jahan', student_id: '221-15-4503', email: 'nusrat.15@diu.edu.bd', department: 'Software Engineering', batch: 'Batch 59' },
  { name: 'Mahi Uddin', student_id: '221-15-4504', email: 'mahi.15@diu.edu.bd', department: 'Software Engineering', batch: 'Batch 42' },
  { name: 'Farhana Akter', student_id: '221-15-4505', email: 'farhana.15@diu.edu.bd', department: 'CSE', batch: 'Batch 58' }
];

const requestTemplates = [
  { title: 'Need a Type-C charger', description: 'Type-C charger needed for approximately 20 minutes, phone is about to die before class.', category: 'Borrow', help_type: 'Charger', urgency: 'high', duration: '20 minutes' },
  { title: 'Need help understanding Java', description: 'Stuck on a NullPointerException in my assignment, could use a second pair of eyes.', category: 'Personal Help', help_type: 'Technical help', urgency: 'medium', duration: '30 minutes' },
  { title: 'Anyone has a calculator?', description: 'Forgot my scientific calculator for the stats quiz in 15 minutes.', category: 'Borrow', help_type: 'Calculator', urgency: 'high', duration: '1 hour' },
  { title: 'Need help printing a document', description: 'Need to print a 5-page report before my 3pm class, printer near me is out of toner.', category: 'Personal Help', help_type: 'Printing/scanning', urgency: 'medium', duration: '15 minutes' },
  { title: 'Looking for a USB cable', description: 'Need a USB-A to USB-C cable to transfer files for a presentation.', category: 'Borrow', help_type: 'Cable', urgency: 'low', duration: '10 minutes' },
  { title: 'Can someone help carry a box?', description: 'Moving some project materials from the lab to the seminar room, could use an extra hand.', category: 'Personal Help', help_type: 'Physical help', urgency: 'low', duration: '15 minutes' }
];

function offset() {
  // Roughly +/- 500m jitter in degrees
  return (Math.random() - 0.5) * 0.01;
}

async function seed() {
  try {
    console.log('Seeding demo data...');

    const passwordHash = await bcrypt.hash('password123', 10);
    const studentIds = [];

    for (const s of students) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [s.email]);
      if (existing.length > 0) {
        studentIds.push(existing[0].id);
        continue;
      }
      const [result] = await pool.query(
        `INSERT INTO users (name, student_id, email, password, department, batch, latitude, longitude, rating, total_ratings, people_helped)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.name, s.student_id, s.email, passwordHash, s.department, s.batch,
          BASE_LAT + offset(), BASE_LNG + offset(),
          (Math.random() * 1.5 + 3.5).toFixed(2), Math.floor(Math.random() * 20) + 3, Math.floor(Math.random() * 20) + 3]
      );
      studentIds.push(result.insertId);
    }

    for (let i = 0; i < requestTemplates.length; i++) {
      const t = requestTemplates[i];
      const ownerId = studentIds[i % studentIds.length];
      await pool.query(
        `INSERT INTO help_requests (user_id, title, description, category, help_type, latitude, longitude, radius, urgency, duration, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
        [ownerId, t.title, t.description, t.category, t.help_type,
          BASE_LAT + offset(), BASE_LNG + offset(), 1000, t.urgency, t.duration]
      );
    }

    console.log(`Seeded ${students.length} students and ${requestTemplates.length} requests.`);
    console.log('Demo login: any seeded email above with password "password123"');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
