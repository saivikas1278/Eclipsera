const jwt = require('jsonwebtoken');

/**
 * Generate a JSON Web Token (JWT)
 * @param {ObjectId} id - The MongoDB user ID
 * @returns {String} Signed JWT token
 */
const generateToken = (id) => {
  // jwt.sign takes the payload (data we want to embed in the token),
  // the secret key from our .env file,
  // and an options object (here, we set it to expire in 30 days)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
