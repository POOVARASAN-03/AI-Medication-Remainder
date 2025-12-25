const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const serviceWorkerAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.purpose !== 'update_reminder_status') {
        return res.status(403).json({ message: 'Forbidden: Invalid token purpose' });
      }

      req.user = { _id: decoded.id }; // Attach user ID
      req.reminderHistoryId = decoded.reminderHistoryId; // Attach reminder history ID

      next();
    } catch (error) {
      console.error('Service worker token error:', error);
      return res.status(401).json({ message: 'Not authorized, service worker token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no service worker token' });
  }
};

module.exports = { protect, serviceWorkerAuth };
