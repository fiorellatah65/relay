// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const redirectToCorrectDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Obtener perfil del usuario
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error obteniendo perfil:', error);
          router.push('/auth/login');
          return;
        }

        setUserInfo({
          email: session.user.email || '',
          role: profile?.role || 'operador'
        });

        // Pequeño delay para mostrar la información antes de redirigir
        setTimeout(() => {
          switch (profile?.role) {
            case 'admin':
              router.push('/dashboard/admin');
              break;
            case 'supervisor':
              router.push('/dashboard/supervisor');
              break;
            case 'operador':
              router.push('/dashboard/operador');
              break;
            default:
              router.push('/dashboard/operador');
          }
        }, 2000);

      } catch (error) {
        console.error('Error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    redirectToCorrectDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          {userInfo && (
            <div className="space-y-1 text-gray-600">
              <p className="text-sm">{userInfo.email}</p>
              <p className="text-sm">
                <span className="font-medium">Rol:</span>{' '}
                <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {userInfo.role}
                </span>
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500">
            Redirigiendo a tu panel de control...
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>Sistema de Inventario - Integridad</p>
        </div>
      </div>
    </div>
  );
}