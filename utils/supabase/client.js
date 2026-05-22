import { createClient } from '@supabase/supabase-js'

// 1. Estas variables vienen del archivo .env.local.
// En Next.js, las variables que empiezan por NEXT_PUBLIC_ se pueden usar en el navegador.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Si falta alguna credencial, paramos la app con un error claro.
// Asi es mas facil saber que hay que revisar el .env.local.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 3. Creamos y exportamos el cliente de Supabase.
// Este objeto se usa despues para hacer select, insert y delete en la tabla cursos.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
