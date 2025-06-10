const mysql = require('mysql2');

// Create connection pool with proper MySQL2 configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Valid MySQL2 configuration options
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Additional recommended settings
  charset: 'utf8mb4',
  timezone: '+00:00'
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection function with better error handling
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'ecommerce_db'}`);
    console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    
    // Test a simple query
    await connection.execute('SELECT 1');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    // Provide helpful error messages
    switch (error.code) {
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('   💡 Check your database username and password');
        break;
      case 'ECONNREFUSED':
        console.error('   💡 Make sure MySQL server is running');
        break;
      case 'ER_BAD_DB_ERROR':
        console.error('   💡 Database does not exist. Please create it first');
        break;
      default:
        console.error('   💡 Check your database configuration');
    }
    
    // Don't exit the process, let the app handle it gracefully
    // process.exit(1);
  }
};

// Test connection on module load
testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Database connection was closed. Reconnecting...');
  } else {
    throw err;
  }
});

module.exports = {
  pool,
  promisePool,
  testConnection
};