
const AWS = require('aws-sdk');
require('dotenv').config();
const multer = require('multer');

const s3 = new AWS.S3({
  // accessKeyId: process.env.ACCESS_KEY,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1', // Replace with your S3 region
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = {
  s3,
  upload
};
