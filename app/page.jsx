'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function Home() {
  // 1. Estados de React:
  // cursos guarda la lista que viene de Supabase.
  // nombre, modalidad y horas guardan lo escrito en el formulario.
  // cargando, guardando y mensaje ayudan a mostrar el estado de la pantalla.
  const [cursos, setCursos] = useState([])
  const [nombre, setNombre] = useState('')
  const [modalidad, setModalidad] = useState('presencial')
  const [horas, setHoras] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // 2. useEffect se ejecuta una vez cuando abre la pagina.
  // Aqui pedimos a Supabase el listado inicial de cursos.
  useEffect(() => {
    cargarCursos()
  }, [])

  // 3. Funcion READ:
  // Lee todos los cursos de la tabla cursos y los ordena por fecha de creacion.
  async function cargarCursos() {
    setCargando(true)
    setMensaje('')

    const { data, error } = await supabase
      .from('cursos')
      .select('id, nombre, modalidad, horas, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      // Si Supabase devuelve error, mostramos el mensaje y dejamos la lista vacia.
      setMensaje(`Error al cargar cursos: ${error.message}`)
      setCursos([])
    } else {
      // Si todo va bien, guardamos los cursos en el estado.
      // Al cambiar el estado, React vuelve a pintar la tabla automaticamente.
      setCursos(data ?? [])
    }

    setCargando(false)
  }

  // 4. Funcion CREATE:
  // Se ejecuta al enviar el formulario y crea un curso nuevo en Supabase.
  async function crearCurso(event) {
    // Evita que el navegador recargue la pagina al enviar el formulario.
    event.preventDefault()
    setMensaje('')

    // El input devuelve texto, por eso convertimos horas a numero.
    const horasNumero = Number(horas)

    // Validacion sencilla antes de enviar datos a la base de datos.
    if (!nombre.trim() || !modalidad || !horasNumero || horasNumero < 1) {
      setMensaje('Completa nombre, modalidad y horas con valores validos.')
      return
    }

    setGuardando(true)

    // insert() anade una fila nueva en la tabla cursos.
    // No enviamos id ni created_at porque PostgreSQL los crea automaticamente.
    const { error } = await supabase.from('cursos').insert({
      nombre: nombre.trim(),
      modalidad,
      horas: horasNumero,
    })

    if (error) {
      setMensaje(`Error al insertar curso: ${error.message}`)
    } else {
      // Si se crea bien, limpiamos el formulario.
      setNombre('')
      setModalidad('presencial')
      setHoras('')
      setMensaje('Curso insertado correctamente.')

      // Volvemos a cargar la lista para ver el curso nuevo en pantalla.
      await cargarCursos()
    }

    setGuardando(false)
  }

  // 5. Funcion DELETE:
  // Recibe el id del curso y borra esa fila concreta de Supabase.
  async function eliminarCurso(id) {
    setMensaje('')

    const { error } = await supabase
      .from('cursos')
      .delete()
      // eq('id', id) significa: borra solo donde la columna id sea igual a este id.
      .eq('id', id)

    if (error) {
      setMensaje(`Error al eliminar curso: ${error.message}`)
    } else {
      // Quitamos el curso de la pantalla sin tener que recargar toda la tabla.
      setCursos((cursosActuales) =>
        cursosActuales.filter((curso) => curso.id !== id)
      )
      setMensaje('Curso eliminado correctamente.')
    }
  }

  // 6. Funcion auxiliar:
  // Convierte fechas de Supabase a un formato mas facil de leer.
  function formatearFecha(fecha) {
    if (!fecha) return 'Sin cambios'
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Examen practico
          </p>
          <h1 className="mt-2 text-3xl font-bold">CRUD de cursos con Supabase</h1>
        </div>

        {/* 7. Formulario para crear cursos nuevos. */}
        <form
          onSubmit={crearCurso}
          className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_180px_140px_auto]"
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nombre
            <input
              className="rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="React desde cero"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Modalidad
            <select
              className="rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={modalidad}
              onChange={(event) => setModalidad(event.target.value)}
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Horas
            <input
              className="rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="number"
              min="1"
              value={horas}
              onChange={(event) => setHoras(event.target.value)}
              placeholder="40"
            />
          </label>

          <button
            className="self-end rounded-md bg-emerald-700 px-5 py-2 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            type="submit"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Anadir'}
          </button>
        </form>

        {/* 8. Mensaje de error o confirmacion para el usuario. */}
        {mensaje && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {mensaje}
          </p>
        )}

        {/* 9. Tabla donde se muestra el listado completo de cursos. */}
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-xl font-semibold">Listado completo de cursos</h2>
          </div>

          {cargando ? (
            <p className="px-5 py-6 text-zinc-600">Cargando cursos...</p>
          ) : cursos.length === 0 ? (
            <p className="px-5 py-6 text-zinc-600">Todavia no hay cursos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-zinc-100 text-zinc-700">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Nombre</th>
                    <th className="px-5 py-3 font-semibold">Modalidad</th>
                    <th className="px-5 py-3 font-semibold">Horas</th>
                    <th className="px-5 py-3 font-semibold">Creado</th>
                    <th className="px-5 py-3 font-semibold">Actualizado</th>
                    <th className="px-5 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 10. map recorre el array cursos y crea una fila por cada curso. */}
                  {cursos.map((curso) => (
                    <tr key={curso.id} className="border-t border-zinc-200">
                      <td className="px-5 py-4">{curso.id}</td>
                      <td className="px-5 py-4 font-medium">{curso.nombre}</td>
                      <td className="px-5 py-4 capitalize">{curso.modalidad}</td>
                      <td className="px-5 py-4">{curso.horas}</td>
                      <td className="px-5 py-4">{formatearFecha(curso.created_at)}</td>
                      <td className="px-5 py-4">{formatearFecha(curso.updated_at)}</td>
                      <td className="px-5 py-4">
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                          type="button"
                          // Al pulsar Eliminar, mandamos el id del curso a eliminarCurso.
                          onClick={() => eliminarCurso(curso.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
