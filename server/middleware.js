const verifyAdminToken = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token === 'eclipsera-admin-secure-session-token') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: You do not have permissions to access this administrative feature.' });
  }
};

module.exports = { verifyAdminToken };
