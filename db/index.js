const mongoose = require('mongoose');
const uri = process.env.DB_URI;
const password = process.env.DB_PASSWORD;
const user = process.env.DB_USERNAME;

async function connectToDatabase() {
  try {
    await mongoose.connect(uri, { user:user, pass: password, useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connection OK.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

module.exports = connectToDatabase;