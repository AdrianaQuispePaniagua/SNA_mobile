import mysql from 'mysql2/promise';

// Configura la conexión a tu base de datos XAMPP
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Usuario por defecto de XAMPP
  password: '', // Contraseña por defecto de XAMPP
  database: 'aduanas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
