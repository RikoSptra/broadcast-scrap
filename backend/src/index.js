const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./config/database');

const app = express();

// Enable CORS
app.use(cors());

// Body parser with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/broadcast', require('./routes/broadcastRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to WA Broadcast API' });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    await initializeDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 