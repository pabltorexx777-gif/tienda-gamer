import { useState, useEffect } from "react"

import axios from "axios"

import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom"

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTrash
} from "react-icons/fa"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mensaje, setMensaje] = useState("")

  async function handleLogin(e) {

    e.preventDefault()

    try {

      const response = await axios.post(
  `${import.meta.env.VITE_API_URL}/login`,
  {
    email,
    password
  }
)

      localStorage.setItem(
        "token",
        response.data.token
      )

      localStorage.setItem(
        "usuario",
        JSON.stringify(response.data.usuario)
      )

      setMensaje("✅ Login correcto")

      setTimeout(() => {

        navigate("/dashboard")

      }, 1000)

    } catch (error) {

      console.error(error)

      setMensaje("❌ Error al iniciar sesión")

    }

  }

  return (

    <div className="
      min-h-screen
      bg-slate-950
      flex
      items-center
      justify-center
      px-4
    ">

      <div className="
        bg-white/10
        backdrop-blur-lg
        border
        border-white/20
        p-8
        rounded-2xl
        w-full
        max-w-md
        shadow-2xl
      ">

        <h1 className="
          text-white
          text-3xl
          font-bold
          text-center
          mb-6
        ">
          TIENDA GAMER
        </h1>

        <form onSubmit={handleLogin}>

          <div className="relative mb-4">

            <FaEnvelope className="
              absolute
              left-3
              top-4
              text-gray-400
            "/>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="
                w-full
                bg-slate-900
                text-white
                py-3
                pl-10
                pr-4
                rounded-lg
                outline-none
                border
                border-slate-700
              "
            />

          </div>

          <div className="relative mb-4">

            <FaLock className="
              absolute
              left-3
              top-4
              text-gray-400
            "/>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Contraseña"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="
                w-full
                bg-slate-900
                text-white
                py-3
                pl-10
                pr-12
                rounded-lg
                outline-none
                border
                border-slate-700
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="
                absolute
                right-3
                top-3
                text-gray-400
              "
            >

              {
                showPassword
                  ? <FaEyeSlash />
                  : <FaEye />
              }

            </button>

          </div>

          <button
            type="submit"
            className="
              w-full
              bg-cyan-500
              hover:bg-cyan-400
              transition
              text-black
              font-bold
              py-3
              rounded-lg
            "
          >
            Iniciar sesión
          </button>

        </form>

        {

          mensaje && (

            <p className="
              text-center
              mt-4
              text-white
            ">
              {mensaje}
            </p>

          )

        }

      </div>

    </div>

  )

}

function Dashboard() {

  const navigate = useNavigate()

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  )

  const [productos, setProductos] = useState([])

  const [carrito, setCarrito] = useState(

  JSON.parse(
    localStorage.getItem("carrito")
  ) || []

)

  const [nombreProducto, setNombreProducto] = useState("")
  const [precioProducto, setPrecioProducto] = useState("")
  const [imagenProducto, setImagenProducto] = useState("")

  useEffect(() => {

    obtenerProductos()

  }, [])

  useEffect(() => {

  localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
  )

}, [carrito])

  async function obtenerProductos() {

    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`
        `${import.meta.env.VITE_API_URL}/orders`
      )

      setProductos(response.data)

    } catch (error) {

      console.error(error)

    }

  }

  async function agregarProducto(e) {

    e.preventDefault()

    try {

      const token = localStorage.getItem("token")

      await axios.post(

        "http://localhost:3000/products",

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

      const token = localStorage.getItem("token")

      await axios.delete(

        `http://localhost:3000/products/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )

      obtenerProductos()

    } catch (error) {

      console.error(error)

    }

  }

  function agregarAlCarrito(producto) {

    setCarrito([
      ...carrito,
      producto
    ])

  }

  function eliminarDelCarrito(index) {

    const nuevoCarrito =
      carrito.filter((_, i) => i !== index)

    setCarrito(nuevoCarrito)

  }

  async function finalizarCompra() {
  try {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:3000/orders",
      {
        total: Number(total),
        items: carrito   // 👈 ESTE ES EL CAMBIO CLAVE
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log(response.data);

    alert("✅ Compra realizada correctamente");

    setCarrito([]);

  } catch (error) {
    console.error(error);
    console.log(error.response?.data);
    alert("❌ Error al realizar compra");
  }
}


  function cerrarSesion() {

    localStorage.removeItem("token")
    localStorage.removeItem("usuario")

    navigate("/")

  }

  const total = carrito.reduce(

  (acc, item) => {

    return acc + Number(item.precio)

  },

  0

).toFixed(2)

  return (

    <div className="
      min-h-screen
      bg-slate-950
      text-white
      p-10
    ">

      <button

  onClick={finalizarCompra}

  className="
    w-full
    mt-4
    bg-green-500
    hover:bg-green-400
    text-black
    font-bold
    py-3
    rounded-xl
  "
>
  Finalizar compra
</button>

      <div className="
        flex
        justify-between
        items-center
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">
            Dashboard Gamer 🎮
          </h1>

          <p className="text-gray-400">
            Bienvenido:
            {" "}
            {usuario?.nombre}
          </p>

          <p className="text-cyan-400">
            Rol:
            {" "}
            {usuario?.rol}
          </p>

        </div>

        <button
          onClick={cerrarSesion}
          className="
            bg-red-500
            hover:bg-red-400
            px-4
            py-2
            rounded-lg
            font-bold
          "
        >
          Cerrar sesión
        </button>

      </div>

      {

        usuario?.rol === "admin" && (

          <div className="
            bg-slate-900
            p-6
            rounded-2xl
            mb-10
          ">

            <h2 className="
              text-2xl
              font-bold
              mb-4
            ">
              Panel Admin ⚙️
            </h2>

            <form
              onSubmit={agregarProducto}
              className="
                grid
                md:grid-cols-3
                gap-4
              "
            >

              <input
                type="text"
                placeholder="Nombre producto"
                value={nombreProducto}
                onChange={(e) =>
                  setNombreProducto(e.target.value)
                }
                className="
                  bg-slate-800
                  p-3
                  rounded-lg
                  outline-none
                "
              />

              <input
                type="number"
                placeholder="Precio"
                value={precioProducto}
                onChange={(e) =>
                  setPrecioProducto(e.target.value)
                }
                className="
                  bg-slate-800
                  p-3
                  rounded-lg
                  outline-none
                "
              />
            <input
  type="text"
  placeholder="URL imagen"

  value={imagenProducto}

  onChange={(e) =>
    setImagenProducto(e.target.value)
  }

  className="
    bg-slate-800
    p-3
    rounded-lg
    outline-none
  "
/>

              <button
                type="submit"
                className="
                  bg-green-500
                  hover:bg-green-400
                  text-black
                  font-bold
                  rounded-lg
                "
              >
                Agregar producto
              </button>

            </form>

          </div>

        )

      }

      <h2 className="
        text-2xl
        font-bold
        mb-6
      ">
        Productos
      </h2>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-6
      ">

        {

          productos.map((producto) => (

            <div
              key={producto.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >
               <img

  src={producto.imagen}

  alt={producto.nombre}

  className="
    w-full
    h-48
    object-cover
    rounded-xl
    mb-4
  "

/>

              <h3 className="
                text-2xl
                font-bold
                mb-2
              ">
                {producto.nombre}
              </h3>

              <p className="
                text-cyan-400
                text-xl
                mb-4
              ">
                ${producto.precio}
              </p>

              <button

                onClick={() =>
                  agregarAlCarrito(producto)
                }

                className="
                  w-full
                  bg-cyan-500
                  hover:bg-cyan-400
                  text-black
                  font-bold
                  py-2
                  rounded-lg
                "
              >
                Agregar al carrito
              </button>

              {

                usuario?.rol === "admin" && (

                  <button

                    onClick={() =>
                      eliminarProducto(producto.id)
                    }

                    className="
                      w-full
                      mt-3
                      bg-red-500
                      hover:bg-red-400
                      text-white
                      font-bold
                      py-2
                      rounded-lg
                    "
                  >
                    Eliminar producto
                  </button>

                )

              }

            </div>

          ))

        }

      </div>

      <div className="mt-12">

        <h2 className="
          text-2xl
          font-bold
          mb-4
        ">
          Carrito 🛒
        </h2>

        {

          carrito.length === 0

          ? (

            <p className="text-gray-400">
              El carrito está vacío
            </p>

          )

          : (

            <div className="space-y-4">

              {

                carrito.map((item, index) => (

                  <div

                    key={index}

                    className="
                      bg-slate-900
                      p-4
                      rounded-xl
                      flex
                      justify-between
                      items-center
                    "
                  >

                    <div>

                      <h3 className="font-bold">
                        {item.nombre}
                      </h3>

                      <p className="text-cyan-400">
                        ${item.precio}
                      </p>

                    </div>

                    <button

                      onClick={() =>
                        eliminarDelCarrito(index)
                      }

                      className="
                        bg-red-500
                        hover:bg-red-400
                        p-3
                        rounded-lg
                      "
                    >

                      <FaTrash />

                    </button>

                  </div>

                ))

              }

              <div className="
                bg-slate-800
                p-4
                rounded-xl
                text-xl
                font-bold
              ">

                Total:
                {" "}
                ${total}

              </div>

            </div>

          )

        }

      </div>

    </div>

  )

}

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

    </Routes>

  )

}

export default App