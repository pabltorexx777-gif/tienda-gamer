const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('./db');

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor funcionando 🚀'
  });
});

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
app.post('/products', (req, res) => {

  const { nombre, precio } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({
      error: 'Nombre y precio son obligatorios'
    });
  }

  const sql = `
    INSERT INTO productos (nombre, precio)
    VALUES (?, ?)
  `;

  db.query(sql, [nombre, precio], (err, result) => {

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

  });

});

// Editar producto
app.put('/products/:id', (req, res) => {

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

// Editar producto
app.put('/products/:id', (req, res) => {

  const { id } = req.params;

  const { nombre, precio } = req.body;

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
app.delete('/products/:id', (req, res) => {

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

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});