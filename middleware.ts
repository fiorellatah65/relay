// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Excluir completamente estas rutas del middleware
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') && !pathname.endsWith('/') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    );

    // Rutas específicas que no requieren autenticación
    const publicPaths = [
      '/',
      '/auth/login', 
      '/auth/register'
    ];

    // Solo verificar autenticación para rutas específicas
    const needsAuth = pathname.startsWith('/dashboard');
    const isPublicPath = publicPaths.includes(pathname);
    
    if (!needsAuth && !isPublicPath) {
      return response;
    }

    // Obtener sesión con manejo de errores simple
    let session = null;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      // Si hay error obteniendo sesión y es ruta protegida, redirigir a login
      if (needsAuth) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    // Manejar rutas protegidas sin sesión
    if (needsAuth && !session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Manejar rutas de auth con sesión activa
    if ((pathname === '/auth/login' || pathname === '/auth/register') && session) {
      // Obtener rol del usuario con manejo simple de errores
      let userRole = 'admin'; // Default fallback
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Verificar si está activo
          if (profile.is_active === false) {
            // Usuario inactivo, sign out y redirigir a login
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL('/auth/login', request.url));
          }
          
          userRole = profile.role || 'admin';
        }
      } catch (error) {
        console.error('Error obteniendo perfil:', error);
        // Continuar con role por defecto
      }

      // Redirigir según el rol
      let dashboardPath = '/dashboard/admin'; // Default
      
      switch (userRole) {
        case 'supervisor':
          dashboardPath = '/dashboard/supervisor';
          break;
        case 'operador':
          dashboardPath = '/dashboard/operador';
          break;
        case 'admin':
        default:
          dashboardPath = '/dashboard/admin';
          break;
      }

      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Verificar permisos de rol para rutas específicas
    if (session && needsAuth) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Verificar si está activo
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL('/auth/login', request.url));
          }

          const userRole = profile.role;

          // Verificar acceso según la ruta y rol
          if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
            // Redirigir al dashboard apropiado para su rol
            if (userRole === 'supervisor') {
              return NextResponse.redirect(new URL('/dashboard/supervisor', request.url));
            } else if (userRole === 'operador') {
              return NextResponse.redirect(new URL('/dashboard/operador', request.url));
            }
          } else if (pathname.startsWith('/dashboard/supervisor') && !['admin', 'supervisor'].includes(userRole)) {
            return NextResponse.redirect(new URL('/dashboard/operador', request.url));
          }
        }
      } catch (error) {
        console.error('Error verificando permisos:', error);
        // En caso de error, permitir el acceso pero loguear
      }
    }

    return response;
  } catch (error) {
    console.error('Error general en middleware:', error);
    // En caso de error crítico, permitir continuar
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match solo las rutas que realmente necesitan middleware:
     * - / (página principal)
     * - /auth/* (páginas de autenticación) 
     * - /dashboard/* (páginas protegidas)
     */
    '/((?!_next/static|_next/image|favicon|public|api).*)',
  ],
}