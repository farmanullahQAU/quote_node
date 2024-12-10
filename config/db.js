const mongoose = require('mongoose');
require('dotenv').config();
// const mongoUri =process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST : process.env.MONGO_LIVE; /

const mongoUri ="mongodb://localhost:27017/quotesdb";




const connectDB = async () => {
  //CONNECTION TO 
  try {
    await mongoose.connect(mongoUri);
    console.log('connected to ');///
    console.log('Connected to:', mongoose.connection.name); //
  } catch (err) {
    console.error('MongoDB  error:', err.message);//
    process.exit(1);
  }
};


module.exports = connectDB;