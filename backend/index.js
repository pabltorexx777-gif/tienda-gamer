const express = require('express');
const cors = require('cors'); // ✅ FALTABA ESTO
const app = express();

// Conexión a la base de datos
const db = require('./db');

// Middleware
app.use(express.json());
app.use(cors()); // ✅ ahora sí funciona

// Ruta principal
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

// Obtener productos desde MySQL
app.get('/products', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});

// Agregar producto a MySQL
app.post('/products', (req, res) => {
  const { nombre, precio } = req.body;

  const sql = 'INSERT INTO productos (nombre, precio) VALUES (?, ?)';

  db.query(sql, [nombre, precio], (err, result) => {
    if (err) {
      console.error('Error al insertar:', err);
      res.status(500).send('Error al insertar producto');
      return;
    }

    res.send('Producto agregado correctamente 🚀');
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});