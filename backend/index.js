require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('./db')

const app = express()

/* =========================
   MIDDLEWARE
========================= */

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

/* =========================
   JWT
========================= */

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' })
  }
}

/* =========================
   HEALTH CHECK (IMPORTANTE EN RENDER)
========================= */

app.get('/', (req, res) => {
  res.json({ ok: true, message: "API funcionando" })
})

/* =========================
   PRODUCTS
========================= */

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

app.post('/api/products', verificarToken, (req, res) => {
  const { nombre, precio, imagen } = req.body

  db.query(
    'INSERT INTO productos (nombre, precio, imagen) VALUES (?, ?, ?)',
    [nombre, precio, imagen],
    (err, result) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: err.message })
      }

      res.json({ ok: true, id: result.insertId })
    }
  )
})

/* =========================
   ORDERS
========================= */

app.post('/api/orders', verificarToken, (req, res) => {
  const { total } = req.body
  const usuario_id = req.usuario.id

  db.query(
    'INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)',
    [usuario_id, total],
    (err, result) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: err.message })
      }

      res.json({ ok: true, pedidoId: result.insertId })
    }
  )
})

/* =========================
   AUTH
========================= */

app.post('/login', (req, res) => {
  const { email, password } = req.body

  db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0)
        return res.status(401).json({ error: 'No existe' })

      const user = results[0]

      const ok = await bcrypt.compare(password, user.password)
      if (!ok)
        return res.status(401).json({ error: 'Contraseña incorrecta' })

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.json({ token, user })
    }
  )
})

app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body

  const hash = await bcrypt.hash(password, 10)

  db.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, hash],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })

      res.json({ mensaje: 'Usuario registrado' })
    }
  )
})

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en puerto ${PORT}`)
})