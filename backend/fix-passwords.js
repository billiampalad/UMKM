// fix-passwords.js
// Script untuk update password users dengan hash yang benar

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPasswords() {
  let connection;
  
  try {
    console.log('🔧 Fixing user passwords...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const employeePassword = await bcrypt.hash('employee123', 12);
    
    console.log('🔐 Generated password hashes');
    
    // Check if users exist
    const [existingUsers] = await connection.execute(
      'SELECT email FROM users WHERE email IN (?, ?)',
      ['admin@ecommerce.com', 'employee@ecommerce.com']
    );
    
    console.log('👥 Existing users:', existingUsers.map(u => u.email));
    
    // Update or insert admin
    const [adminResult] = await connection.execute(`
      INSERT INTO users (nama, email, pass, role, created_at) 
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
      pass = VALUES(pass), 
      nama = VALUES(nama),
      role = VALUES(role)
    `, ['Administrator', 'admin@ecommerce.com', adminPassword, 'admin']);
    
    // Update or insert employee
    const [employeeResult] = await connection.execute(`
      INSERT INTO users (nama, email, pass, role, created_at) 
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
      pass = VALUES(pass), 
      nama = VALUES(nama),
      role = VALUES(role)
    `, ['John Employee', 'employee@ecommerce.com', employeePassword, 'employee']);
    
    console.log('✅ Admin user:', adminResult.affectedRows > 0 ? 'updated' : 'unchanged');
    console.log('✅ Employee user:', employeeResult.affectedRows > 0 ? 'updated' : 'unchanged');
    
    // Verify users
    const [users] = await connection.execute(
      'SELECT id_user, nama, email, role, created_at FROM users ORDER BY id_user'
    );
    
    console.log('\n👥 All users in database:');
    users.forEach(user => {
      console.log(`   ${user.id_user}. ${user.nama} (${user.email}) - ${user.role}`);
    });
    
    // Test password verification
    console.log('\n🧪 Testing password verification:');
    
    const [adminUser] = await connection.execute(
      'SELECT pass FROM users WHERE email = ?', 
      ['admin@ecommerce.com']
    );
    
    if (adminUser.length > 0) {
      const adminMatch = await bcrypt.compare('admin123', adminUser[0].pass);
      console.log('   Admin password test:', adminMatch ? '✅ PASS' : '❌ FAIL');
    }
    
    const [empUser] = await connection.execute(
      'SELECT pass FROM users WHERE email = ?', 
      ['employee@ecommerce.com']
    );
    
    if (empUser.length > 0) {
      const empMatch = await bcrypt.compare('employee123', empUser[0].pass);
      console.log('   Employee password test:', empMatch ? '✅ PASS' : '❌ FAIL');
    }
    
    console.log('\n🎉 Password fix completed!');
    console.log('🚀 Now test login in Postman with:');
    console.log('   Admin: admin@ecommerce.com / admin123');
    console.log('   Employee: employee@ecommerce.com / employee123');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixPasswords();