const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_book_library';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Local MongoDB not active (${error.message}). Using In-Memory Database Fallback.`);
  }
};

module.exports = connectDB;
