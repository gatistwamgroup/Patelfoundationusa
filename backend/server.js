const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet()); // Security
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging in dev mode

// Routes
const testRoutes = require('./routes/testRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const settingRoutes = require('./routes/settingRoutes');
const emailLogRoutes = require('./routes/emailLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Mount routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/logs', emailLogRoutes);
app.use('/api/notifications', notificationRoutes);
// Alias for clients that use the singular donation endpoint path
app.use('/api/donation', donationRoutes);

// Error Handling (Basic)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Setup HTTP server and Socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

// Configure Socket.IO connection
io.on('connection', (socket) => {
    console.log('[Socket.io] Admin client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('[Socket.io] Admin client disconnected:', socket.id);
    });
});

// Export io globally for controllers to use
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
