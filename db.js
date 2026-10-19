require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbFile = path.resolve(__dirname, process.env.DB_FILE || './products.db');
const db = new Database(dbFile);

// Create the table if it does not exist
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// Insert the sample records only when the table is empty
const { total } = db.prepare('SELECT COUNT(*) AS total FROM products').get();
if (total === 0) {
  db.exec(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  console.log('Seeded 10 sample products.');
}

module.exports = db;
