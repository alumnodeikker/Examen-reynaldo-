# Pasos del examen: CRUD de cursos con Supabase y Next.js

## 1. Crear las variables de entorno

En el archivo `.env.local` van las credenciales de Supabase:

```txt
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

En este proyecto ahora apuntan a Supabase local:

```txt
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

Si usas un proyecto de supabase.com, cambia esos valores por los de tu proyecto remoto.

## 2. Crear el cliente de Supabase

Archivo:

```txt
utils/supabase/client.js
```

Ese archivo hace tres cosas:

1. Importa `createClient` desde `@supabase/supabase-js`.
2. Lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Exporta `supabase`, que es el objeto usado para consultar la base de datos.

Ejemplo:

```js
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 3. Crear la tabla cursos en Supabase

Abre Supabase, entra en **SQL Editor** y ejecuta el SQL del archivo:

```txt
supabase/snippets/cursos_updated_at.sql
```

La tabla tiene estos campos:

```txt
id
nombre
modalidad
horas
created_at
updated_at
```

## 4. Crear el listado de cursos

En `app/page.jsx` se usa:

```js
useEffect(() => {
  cargarCursos()
}, [])
```

Eso significa:

1. Cuando la pagina abre, React ejecuta `useEffect`.
2. `useEffect` llama a `cargarCursos`.
3. `cargarCursos` hace un `select` a Supabase.
4. Los datos se guardan en el estado `cursos`.
5. React pinta la tabla con esos cursos.

Consulta usada:

```js
supabase
  .from('cursos')
  .select('id, nombre, modalidad, horas, created_at, updated_at')
```

## 5. Insertar un curso

El formulario guarda lo escrito en estos estados:

```js
nombre
modalidad
horas
```

Cuando pulsas **Anadir**, se ejecuta `crearCurso`.

Dentro de esa funcion se usa:

```js
supabase.from('cursos').insert({
  nombre: nombre.trim(),
  modalidad,
  horas: horasNumero,
})
```

Eso crea una fila nueva en la tabla `cursos`.

## 6. Eliminar un curso

Cada fila tiene un boton **Eliminar**.

Cuando pulsas el boton, se ejecuta:

```js
eliminarCurso(curso.id)
```

Dentro de esa funcion se usa:

```js
supabase
  .from('cursos')
  .delete()
  .eq('id', id)
```

La parte importante es:

```js
.eq('id', id)
```

Eso indica que solo se borra el curso cuyo `id` coincide.

## 7. Crear updated_at con una funcion y un trigger

En PostgreSQL, el trigger sirve para hacer algo automaticamente.

En este examen queremos que `updated_at` cambie solo cada vez que se modifica un curso.

Primero se crea la funcion:

```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

Despues se crea el trigger:

```sql
create trigger cursos_set_updated_at
before update on cursos
for each row
execute function set_updated_at();
```

Explicacion:

1. `before update` se ejecuta antes de actualizar.
2. `for each row` se ejecuta por cada fila modificada.
3. `set_updated_at()` cambia `updated_at` a la fecha actual.

## 8. Comprobar que funciona

En Supabase SQL Editor puedes ejecutar el bloque final de:

```txt
supabase/snippets/cursos_updated_at.sql
```

Ese bloque:

1. Inserta un curso de prueba.
2. Actualiza su nombre.
3. Devuelve `updated_at`.

Si `updated_at` tiene una fecha, el trigger funciona.

## 9. Probar la app

Ejecuta:

```bash
npm run dev
```

Abre:

```txt
http://127.0.0.1:3000
```

Prueba estos pasos:

1. Escribe un nombre de curso.
2. Elige modalidad.
3. Escribe las horas.
4. Pulsa **Anadir**.
5. Comprueba que aparece en la tabla.
6. Pulsa **Eliminar**.
7. Comprueba que desaparece.
