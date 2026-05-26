import { useState, useEffect } from "react"
import axios from "axios"
import { Routes, Route, useNavigate } from "react-router-dom"
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

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
          <div className="relative mb-4">
            <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 text-white py-3 pl-10 pr-4 rounded-lg outline-none border border-slate-700"
            />
          </div>

          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 text-white py-3 pl-10 pr-12 rounded-lg outline-none border border-slate-700"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg">
            Iniciar sesión
          </button>
        </form>

        {mensaje && (
          <p className="text-center mt-4 text-white">{mensaje}</p>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || {}
    } catch {
      return {}
    }
  })()

  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("carrito")) || []
    } catch {
      return []
    }
  })

  const [nombreProducto, setNombreProducto] = useState("")
  const [precioProducto, setPrecioProducto] = useState("")
  const [imagenProducto, setImagenProducto] = useState("")

  useEffect(() => {
    obtenerProductos()
  }, [])

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito))
  }, [carrito])

  if (!token) {
    return (
      <div className="text-white p-5">
        Sesión expirada o no autorizada
      </div>
    )
  }

  async function obtenerProductos() {
    try {
      const response = await axios.get(`${API}/api/products`)
      setProductos(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  async function agregarProducto(e) {
    e.preventDefault()

    try {
      await axios.post(
        `${API}/products`,
        {
          nombre: nombreProducto,
          precio: precioProducto,
          imagen: imagenProducto
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setNombreProducto("")
      setPrecioProducto("")
      setImagenProducto("")
      obtenerProductos()

    } catch (error) {
      console.error(error)
    }
  }

  async function eliminarProducto(id) {
    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      obtenerProductos()

    } catch (error) {
      console.error(error)
    }
  }

  function agregarAlCarrito(producto) {
    setCarrito([...carrito, producto])
  }

  function eliminarDelCarrito(index) {
    setCarrito(carrito.filter((_, i) => i !== index))
  }

  const total = carrito
    .reduce((acc, item) => acc + Number(item.precio), 0)
    .toFixed(2)

  async function finalizarCompra() {
    try {
      if (carrito.length === 0) {
        alert("El carrito está vacío")
        return
      }

      await axios.post(
        `${API}/orders`,
        { total },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Compra realizada correctamente")
      setCarrito([])

    } catch (error) {
      console.error(error)
      alert("❌ Error al realizar compra")
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
          className="bg-red-500 px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      <button
        onClick={finalizarCompra}
        className="w-full bg-green-500 py-3 rounded mb-6"
      >
        Finalizar compra
      </button>

      <h2 className="text-2xl font-bold mb-4">Productos</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {productos.map((p) => (
          <div key={p.id} className="bg-slate-900 p-4 rounded">
            <img src={p.imagen} className="h-40 w-full object-cover" />
            <h3>{p.nombre}</h3>
            <p>${p.precio}</p>

            <button
              onClick={() => agregarAlCarrito(p)}
              className="bg-cyan-500 w-full mt-2"
            >
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