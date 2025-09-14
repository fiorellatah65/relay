// app/dashboard/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('No hay sesión válida, redirigiendo a login');
          router.push('/auth/login');
          return;
        }

        // Verificar que el perfil existe y está activo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.error('Error obteniendo perfil:', profileError);
          await supabase.auth.signOut();
          router.push('/auth/login');
          return;
        }

        if (!profile.is_active) {
          console.log('Usuario inactivo');
          await supabase.auth.signOut();
          router.push('/auth/login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // No mostrar nada mientras redirige
  }

  return <>{children}</>;
}