// // src/app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  FileText, 
  Eye, 
  ChevronRight,
  LogIn,
  UserPlus,
  Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
export default function LandingPage() {
  const router = useRouter();
const [session, setSession] = useState<Session | null>(null);
const [userProfile, setUserProfile] = useState<{ role: string } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const handleGotoDashboard = () => {
    if (userProfile?.role === 'admin') {
      router.push('/dashboard/admin');
    } else if (userProfile?.role === 'supervisor') {
      router.push('/dashboard/supervisor');
    } else if (userProfile?.role === 'operador') {
      router.push('/dashboard/operador');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Inventario Integridad</h1>
            </div>
            
            {/* Botones dinámicos según estado de autenticación */}
            <div className="flex space-x-3">
              {session && userProfile ? (
                // Usuario autenticado
                <>
                  <span className="text-sm text-gray-600 flex items-center">
                    Bienvenido, {session.user.email}
                  </span>
                  <button
                    onClick={handleGotoDashboard}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ir al Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                // Usuario no autenticado
                <>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center space-x-2 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrarse</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Inventario
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Solución integral para el control y supervisión del inventario universitario, 
            implementando los componentes del Sistema de Control Interno (SCI) para garantizar 
            la integridad de los datos y la protección de los recursos del Estado.
          </p>
          
          <div className="flex justify-center space-x-4">
            {session && userProfile ? (
              <button
                onClick={handleGotoDashboard}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-lg font-medium transition-colors"
              >
                <span>Ir al Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-lg font-medium transition-colors"
              >
                <span>Comenzar Ahora</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Componentes del Sistema de Control Interno
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Eje Cultura Organizacional */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Cultura Organizacional</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Sistema de roles y permisos basado en segregación de funciones para promover 
                una cultura de honestidad y comunicación efectiva.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Gestión de usuarios por roles</li>
                <li>• Controles de acceso</li>
                <li>• Comunicación segura</li>
              </ul>
            </div>

            {/* Eje Gestión de Riesgos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-green-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Gestión de Riesgos</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Validaciones automáticas y alertas en tiempo real para prevenir errores 
                y proteger los recursos del Estado.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Validaciones automáticas</li>
                <li>• Alertas de stock bajo</li>
                <li>• Controles preventivos</li>
              </ul>
            </div>

            {/* Eje Supervisión */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-purple-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Supervisión</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Módulo de auditoría completo que registra todas las acciones para garantizar 
                la rendición de cuentas y supervisión efectiva.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Registro de auditoría</li>
                <li>• Trazabilidad completa</li>
                <li>• Reportes de supervisión</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white rounded-lg shadow-lg mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Diseñado para Entidades Públicas
            </h3>
            <p className="text-gray-600">
              Cumple con los estándares de control interno para el sector público
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Trazabilidad</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Monitoreo</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">3 Roles</div>
              <div className="text-gray-600">Segregación</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-lg font-semibold">Inventario Integridad</span>
            </div>
            <p className="text-gray-400">
              Sistema desarrollado para la Facultad de Ingeniería - 
              Escuela de Formación Profesional de Sistemas y Computación
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

