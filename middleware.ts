// middleware.ts (en la raíz del proyecto, al mismo nivel que package.json)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Verificar sesión
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const pathname = req.nextUrl.pathname;

    // Rutas que están SIEMPRE permitidas sin autenticación
    const publicRoutes = [
      '/',           // Página principal
      '/auth/login',
      '/auth/register'
    ];

    // Rutas protegidas que requieren autenticación
    const protectedRoutes = ['/dashboard'];

    // Verificar si la ruta actual está protegida
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    const isPublicRoute = publicRoutes.includes(pathname);

    // Si es ruta protegida y no hay sesión, redirigir a login
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Solo redirigir desde páginas de auth si ya está autenticado
    // NO redirigir desde la página principal
    const authOnlyRoutes = ['/auth/login', '/auth/register'];
    const isAuthOnlyRoute = authOnlyRoutes.includes(pathname);
    
    if (isAuthOnlyRoute && session) {
      try {
        // Obtener rol del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const redirectUrl = req.nextUrl.clone();
        
        if (profile?.role === 'admin') {
          redirectUrl.pathname = '/dashboard/admin';
        } else if (profile?.role === 'supervisor') {
          redirectUrl.pathname = '/dashboard/supervisor';
        } else if (profile?.role === 'operador') {
          redirectUrl.pathname = '/dashboard/operador';
        } else {
          redirectUrl.pathname = '/dashboard';
        }
        
        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        console.error('Error obteniendo perfil:', error);
        // Si hay error obteniendo el perfil, permitir continuar
      }
    }

    return res;
  } catch (error) {
    console.error('Error en middleware:', error);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}