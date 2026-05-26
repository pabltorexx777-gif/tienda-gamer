require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();

const db = require('./db');

/* ===================================================
   MIDDLEWARE JWT
=================================================== */

function verificarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  // Verificar si existe token
  if (!authHeader) {

    return res.status(401).json({
      error: 'Token requerido'
    });

  }

  // Formato: Bearer TOKEN
  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = decoded;

    next();

  } catch (error) {

    return res.status(403).json({
      error: 'Token inválido'
    });

  }

}

// Middlewares
app.use(cors());
app.use(express.json());

/* ===================================================
   RUTA PRINCIPAL
=================================================== */

app.get('/', (req, res) => {

  res.json({
    mensaje: 'Servidor funcionando 🚀'
  });

});

/* ===================================================
   REGISTER
=================================================== */

app.post('/register', async (req, res) => {

  const { nombre, email, password } = req.body;

  // Validar campos
  if (!nombre || !email || !password) {

    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });

  }

  try {

    // Encriptar password
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO usuarios (nombre, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [nombre, email, passwordHash], (err, result) => {

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

  // Validar campos
  if (!email || !password) {

    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });

  }

  const sql = `
    SELECT * FROM usuarios
    WHERE email = ?
  `;

  db.query(sql, [email], async (err, results) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        error: 'Error del servidor'
      });

    }

    // Usuario no existe
    if (results.length === 0) {

      return res.status(401).json({
        error: 'Usuario no encontrado'
      });

    }

    const usuario = results[0];

    // Comparar password
    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {

      return res.status(401).json({
        error: 'Contraseña incorrecta'
      });

    }

    // Generar token
    const token = jwt.sign(

      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '24h'
      }

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

// Obtener productos
app.get('/products', (req, res) => {

  const sql = 'SELECT * FROM productos';

  db.query(sql, (err, results) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        error: 'Error al obtener productos'
      });

    }

    res.json(results);

  });

});

// Agregar producto
app.post('/products', verificarToken, (req, res) => {

  const {
    nombre,
    precio,
    imagen
  } = req.body;

  if (!nombre || !precio) {

    return res.status(400).json({
      error: 'Nombre y precio son obligatorios'
    });

  }

  const sql = `
    INSERT INTO productos (
      nombre,
      precio,
      imagen
    )
    VALUES (?, ?, ?)
  `;

  db.query(

    sql,

    [
      nombre,
      precio,
      imagen
    ],

    (err, result) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          error: 'Error al agregar producto'
        });

      }

      res.status(201).json({
        mensaje: 'Producto agregado correctamente',
        id: result.insertId
      });

    }

  );

});

// Editar producto
app.put('/products/:id', verificarToken, (req, res) => {

  const { id } = req.params;

  const { nombre, precio } = req.body;

  if (!nombre || !precio) {

    return res.status(400).json({
      error: 'Nombre y precio son obligatorios'
    });

  }

  const sql = `
    UPDATE productos
    SET nombre = ?, precio = ?
    WHERE id = ?
  `;

  db.query(sql, [nombre, precio, id], (err, result) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        error: 'Error al actualizar producto'
      });

    }

    res.json({
      mensaje: 'Producto actualizado correctamente'
    });

  });

});

// Eliminar producto
app.delete('/products/:id', verificarToken, (req, res) => {

  const { id } = req.params;

  const sql = 'DELETE FROM productos WHERE id = ?';

  db.query(sql, [id], (err, result) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        error: 'Error al eliminar producto'
      });

    }

    res.json({
      mensaje: 'Producto eliminado correctamente'
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