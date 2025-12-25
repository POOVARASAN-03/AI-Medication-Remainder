const dotenv = require('dotenv');
dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('ERROR: JWT_SECRET must be set and at least 32 characters long');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI must be set');
    process.exit(1);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cron = require('node-cron');
const authRoutes = require('./routes/authRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cronRoutes = require('./routes/cronRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet()); // Security headers

// CORS - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ai-medicationremainder.onrender.com',
  'https://ai-medicationremainder-gasx.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRoutes = require('./routes/userRoutes'); // Import user routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', userRoutes); // Mount user routes for FCM token storage
app.use('/api/cron', cronRoutes); // Mount cron trigger routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));



// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
