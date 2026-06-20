import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      type, rut, passport, countryOfOrigin, countryFlag, 
      name, email, phone, birthDate, password, wantsPrintedQR 
    } = req.body;

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (
        user_type, rut, passport, country_of_origin, country_flag, 
        name, email, phone, birth_date, password_hash, wants_printed_qr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, rut, passport, countryOfOrigin, countryFlag, name, email, phone, birthDate, passwordHash, wantsPrintedQR || false]
    );

    const userId = result.insertId;

    res.status(201).json({ 
      id: userId, 
      type, rut, passport, countryOfOrigin, countryFlag, 
      name, email, phone, birthDate, wantsPrintedQR 
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Error en el registro del usuario' });
  }
});

// Inicio de sesión
app.post('/api/auth/login', async (req, res) => {
  try {
    const { userType, rut, passport, password } = req.body;

    let query = '';
    let queryParams = [];

    if (userType === 'chilean') {
      query = 'SELECT * FROM users WHERE rut = ? AND user_type = "chilean"';
      queryParams = [rut];
    } else {
      query = 'SELECT * FROM users WHERE passport = ? AND user_type = "foreign"';
      queryParams = [passport];
    }

    const [rows] = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      id: user.id,
      type: user.user_type,
      rut: user.rut,
      passport: user.passport,
      countryOfOrigin: user.country_of_origin,
      countryFlag: user.country_flag,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birth_date,
      wantsPrintedQR: Boolean(user.wants_printed_qr)
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
});

// Obtener declaraciones de un usuario
app.get('/api/declarations', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Se requiere userId' });
    }

    const [rows] = await pool.query('SELECT * FROM declarations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    // Mapear los resultados de snake_case a camelCase para el frontend
    const mappedRows = rows.map(row => ({
      id: row.id,
      type: row.type,
      emoji: row.emoji,
      title: row.title,
      subtitle: row.subtitle,
      date: row.date,
      status: row.status,
      qrData: row.qr_data
    }));

    res.json(mappedRows);
  } catch (error) {
    console.error('Error fetching declarations:', error);
    res.status(500).json({ message: 'Error al obtener declaraciones' });
  }
});

// Guardar/actualizar declaraciones
app.post('/api/declarations', async (req, res) => {
  try {
    const { declarations, userId } = req.body;
    if (!userId || !declarations || !Array.isArray(declarations)) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    // Usamos REPLACE INTO (equivalente a upsert para MySQL)
    for (const decl of declarations) {
      await pool.query(
        `REPLACE INTO declarations (id, user_id, type, emoji, title, subtitle, date, status, qr_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [decl.id, userId, decl.type, decl.emoji, decl.title, decl.subtitle, decl.date, decl.status, decl.qrData]
      );
    }

    res.json({ message: 'Declaraciones guardadas exitosamente' });
  } catch (error) {
    console.error('Error saving declarations:', error);
    res.status(500).json({ message: 'Error al guardar declaraciones' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
