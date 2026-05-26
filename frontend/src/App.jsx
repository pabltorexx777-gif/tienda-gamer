import { useState, useEffect } from "react"
import axios from "axios"
import { Routes, Route, useNavigate } from "react-router-dom"
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"

// 🔥 FIX IMPORTANTE: siempre apuntar a /api
const API = import.meta.env.VITE_API_URL || "https://tienda-gamer-1.onrender.com/api"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mensaje, setMensaje] = useState("")

  async function handleLogin(e) {
    e.preventDefault()

    try {
      const response = await axios.post(`${API}/login`, {
        email,
        password
      })

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("usuario", JSON.stringify(response.data.user))

      setMensaje("✅ Login correcto")

      setTimeout(() => navigate("/dashboard"), 800)

    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al iniciar sesión")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl">

        <h1 className="text-white text-3xl font-bold text-center mb-6">
          TIENDA GAMER
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full mb-3 p-2"
          />

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full mb-3 p-2"
          />

          <button className="w-full bg-cyan-500 py-2">
            Iniciar sesión
          </button>
        </form>

        {mensaje && <p className="text-white mt-3">{mensaje}</p>}
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState(() => {
    return JSON.parse(localStorage.getItem("carrito")) || []
  })

  useEffect(() => {
    obtenerProductos()
  }, [])

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito))
  }, [carrito])

  if (!token) {
    return <div className="text-white p-5">Sesión no válida</div>
  }

  async function obtenerProductos() {
    try {
      const response = await axios.get(`${API}/products`)
      setProductos(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  function agregarAlCarrito(producto) {
    setCarrito([...carrito, producto])
  }

  const total = carrito
    .reduce((acc, item) => acc + Number(item.precio), 0)
    .toFixed(2)

  async function finalizarCompra() {
    try {
      await axios.post(`${API}/orders`, { total }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      alert("Compra realizada")
      setCarrito([])

    } catch (error) {
      console.error(error)
      alert("Error al realizar compra")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="flex justify-between mb-10">
        <h1 className="text-4xl font-bold">Dashboard 🎮</h1>

        <button
          onClick={() => {
            localStorage.clear()
            navigate("/")
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <button onClick={finalizarCompra}>
        Finalizar compra
      </button>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {productos.map((p) => (
          <div key={p.id} className="bg-slate-900 p-4">
            <img src={p.imagen} />
            <h3>{p.nombre}</h3>
            <p>${p.precio}</p>

            <button onClick={() => agregarAlCarrito(p)}>
              Agregar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}