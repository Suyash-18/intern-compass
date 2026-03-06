/**
 * Admin Authorization Middleware
 * Must be used AFTER auth middleware
 * Checks if the authenticated user has admin role
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};

module.exports = admin;
