
// // src/lib/supabase.ts
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// // Cliente regular para uso en el frontend (con clave anónima)
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  // Configuración específica para producción
  global: {
    headers: {
      'X-Client-Info': 'inventario-integridad@1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Función helper para verificar conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error conectando a Supabase:', error)
    return { success: false, error }
  }
}

// Función helper para debug de autenticación (solo desarrollo)
export const debugAuth = async () => {
  if (process.env.NODE_ENV !== 'development') return
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Debug Auth:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    })
    return { session, error }
  } catch (error) {
    console.error('Error en debug auth:', error)
    return { session: null, error }
  }
}

// Función para limpiar sesión en caso de errores
export const cleanupSession = async () => {
  try {
    await supabase.auth.signOut()
    // Limpiar cualquier storage local si es necesario
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  } catch (error) {
    console.error('Error limpiando sesión:', error)
  }
}