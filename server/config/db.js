const mongoose = require('mongoose');

/**
 * Asynchronous function to connect to MongoDB
 * We use async/await because connecting to a database takes time.
 */
const connectDB = async () => {
  try {
    // Attempt to connect using the connection string stored in .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If successful, log the host to confirm we are connected
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If there's an error (e.g., wrong password, network issue), log it
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit the Node.js process with a 'failure' code (1)
    // This stops the server from running if there's no database connection
    process.exit(1); 
  }
};

// Export the function so it can be called in server.js
module.exports = connectDB;
