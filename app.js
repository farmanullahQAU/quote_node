const express = require('express');
const connectDB = require('./config/db');
const quoteRoutes = require('./routes/quoteRoutes');
require('dotenv').config();


const app = express();

console.log("EVVS");
console.log(process.env);
console.log(process.env.NODE_ENV);
console.log(process.env.PORT);
console.log(process.env.MONGO_LIVE);
console.log(process.env.ACCESS_KEY);

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', quoteRoutes);
app.get('/', (req, res) => {
  // Handle the request here
  res.send('Welcome here !');
});

const port =process.env.NODE_ENV === 'test' ?3000: process.env.PORT || 8081;
console.log('PORT')
console.log(port);



const server = app.listen(port, () => {

  console.log(`Server running on: ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;port ${server.address().port}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(0); // This will find an available port
    }, 1000);
  }
});