require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./db');

const app = express();

/* ===================================================
   MIDDLEWARES GLOBALES
=================================================== */

app.use(cors());
app.use(express.json());

// 🔥 LOG DE REQUESTS (DEBE IR DESPUÉS DE app)
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

console.log("🔥 BACKEND CARGADO - INDEX.JS ACTIVO");

/* ===================================================
   MIDDLEWARE JWT
=================================================== */

function verificarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token requerido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;

    next();

  } catch (error) {

    return res.status(403).json({
      error: 'Token inválido'
    });

  }
}

/* ===================================================
   RUTA PRINCIPAL
=================================================== */

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando 🚀' });
});

/* ===================================================
   REGISTER
=================================================== */

app.post('/register', async (req, res) => {

  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });
  }

  try {

    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO usuarios (nombre, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [nombre, email, passwordHash], (err) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Error al registrar usuario'
        });
      }

      res.status(201).json({
        mensaje: 'Usuario registrado correctamente'
      });

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error del servidor'
    });

  }

});

/* ===================================================
   LOGIN
=================================================== */

app.post('/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });
  }

  const sql = `SELECT * FROM usuarios WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login correcto',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  });

});

/* ===================================================
   PRODUCTOS
=================================================== */

app.get('/products', (req, res) => {

  db.query('SELECT * FROM productos', (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }

    res.json(results);

  });

});

app.post('/products', verificarToken, (req, res) => {

  const { nombre, precio, imagen } = req.body;

  const sql = `
    INSERT INTO productos (nombre, precio, imagen)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [nombre, precio, imagen], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al agregar producto' });
    }

    res.status(201).json({
      mensaje: 'Producto agregado correctamente',
      id: result.insertId
    });

  });

});

/* ===================================================
   ORDERS
=================================================== */

app.post('/orders', verificarToken, (req, res) => {

  console.log("🔥 ORDERS CON TOKEN EJECUTADO");
  console.log("USER:", req.usuario);
  console.log("BODY:", req.body);

  const { total, items } = req.body;
  const usuario_id = req.usuario.id;

  const sql = `
    INSERT INTO pedidos (usuario_id, total)
    VALUES (?, ?)
  `;

  db.query(sql, [usuario_id, total], (err, result) => {

    if (err) {
      console.error("❌ ERROR SQL:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("✅ PEDIDO GUARDADO:", result);

    res.json({
      ok: true,
      pedidoId: result.insertId
    });

  });

});

/* ===================================================
   INICIAR SERVIDOR
=================================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});