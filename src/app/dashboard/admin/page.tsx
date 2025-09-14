// src/app/dashboard/admin/page.tsx
// src/app/dashboard/admin/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Users, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Eye, 
  Download,
  Plus,
  Search,
  Settings,
  Shield,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';

// Interfaces para TypeScript
interface Alert {
  id: string;
  tipo: string;
  mensaje: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

interface AuditActivity {
  id: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  tabla_afectada: string;
  timestamp: string;
}

interface Stats {
  totalArticulos: number;
  stockBajo: number;
  movimientosHoy: number;
  alertasPendientes: number;
  totalUsuarios: number;
  reportesPendientes: number;
}

interface UserProfile {
  id: string;
  email?: string;
  role?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalArticulos: 0,
    stockBajo: 0,
    movimientosHoy: 0,
    alertasPendientes: 0,
    totalUsuarios: 0,
    reportesPendientes: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<AuditActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar autenticación
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Verificar que sea admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        // Redirigir según su rol real
        if (profile?.role === 'supervisor') {
          router.push('/dashboard/supervisor');
        } else if (profile?.role === 'operador') {
          router.push('/dashboard/operador');
        } else {
          router.push('/');
        }
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email,
        role: profile.role
      });
      setIsAuthenticated(true);

      // Cargar datos del dashboard
      await loadDashboardData();
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      router.push('/auth/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Cargar estadísticas principales
      const [articulos, alertas, movimientos, usuarios, reportes] = await Promise.all([
        supabase.from('articulos').select('id, stock_actual, stock_minimo'),
        supabase.from('alertas').select('*').eq('estado', 'PENDIENTE'),
        supabase.from('movimientos_inventario')
          .select('*')
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('profiles').select('id'),
        supabase.from('reportes').select('*').eq('estado', 'PENDIENTE')
      ]);

      if (articulos.data) {
        const stockBajo = articulos.data.filter(
          item => item.stock_actual <= item.stock_minimo
        ).length;
        
        setStats({
          totalArticulos: articulos.data.length,
          stockBajo,
          movimientosHoy: movimientos.data?.length || 0,
          alertasPendientes: alertas.data?.length || 0,
          totalUsuarios: usuarios.data?.length || 0,
          reportesPendientes: reportes.data?.length || 0
        });
      }

      // Corregir tipos
      setAlerts((alertas.data as Alert[]) || []);

      // Cargar actividad reciente de auditoría
      const { data: auditoria } = await supabase
        .from('auditoria_logs')
        .select(`
          *,
          profiles:usuario_id (
            id
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      // Corregir tipos
      setRecentActivity((auditoria as AuditActivity[]) || []);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (tipo: string) => {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .insert({
          tipo_reporte: tipo,
          parametros: { fecha_generacion: new Date() },
          usuario_solicita: user?.id
        });

      if (error) throw error;
      
      alert('Reporte solicitado. Se generará en segundo plano.');
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                Sistema Inventario Integridad
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <User className="w-4 h-4 mr-2" />
                Panel de Administración - {user?.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => generateReport('INVENTARIO_GENERAL')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Generar Reporte</span>
              </button>
              <button 
                onClick={() => navigateTo('/dashboard/admin/articulos')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Artículo</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Estadísticas Principales - Eje Gestión de Riesgos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Artículos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalArticulos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{stats.stockBajo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Movimientos Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.movimientosHoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.alertasPendientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reportes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reportesPendientes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alertas Críticas - Eje Gestión de Riesgos */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Alertas Críticas
              </h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay alertas pendientes</p>
              ) : (
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.prioridad === 'CRITICA' ? 'bg-red-50 border-red-400' :
                      alert.prioridad === 'ALTA' ? 'bg-orange-50 border-orange-400' :
                      'bg-yellow-50 border-yellow-400'
                    }`}>
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{alert.tipo.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600 mt-1">{alert.mensaje}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.prioridad === 'CRITICA' ? 'bg-red-100 text-red-800' :
                          alert.prioridad === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.prioridad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actividad Reciente - Eje Supervisión */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Eye className="w-5 h-5 text-blue-500 mr-2" />
                Actividad Reciente (Auditoría)
              </h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        activity.accion === 'INSERT' ? 'bg-green-400' :
                        activity.accion === 'UPDATE' ? 'bg-blue-400' :
                        'bg-red-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.accion}</span> en {activity.tabla_afectada}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString('es-PE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Acciones Rápidas - Eje Cultura Organizacional */}
        <div className="mt-8 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Funciones Principales</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigateTo('/dashboard/admin/articulos')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Gestionar Artículos</p>
                <p className="text-xs text-gray-500 mt-1">CRUD completo</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/admin/usuarios')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Gestionar Usuarios</p>
                <p className="text-xs text-gray-500 mt-1">Roles y permisos</p>
              </button>
              
              <button 
                onClick={() => generateReport('AUDITORIA')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Reporte Auditoría</p>
                <p className="text-xs text-gray-500 mt-1">Generar reporte</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/admin/auditoria')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Buscar en Logs</p>
                <p className="text-xs text-gray-500 mt-1">Explorar auditoría</p>
              </button>
            </div>
          </div>
        </div>

        {/* Accesos adicionales para administrador */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigateTo('/dashboard/admin/configuracion')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
              <button
                onClick={() => navigateTo('/dashboard/admin/categorias')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Categorías
              </button>
              <button
                onClick={() => navigateTo('/dashboard/admin/proveedores')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                Proveedores
              </button>
              <button
                onClick={() => navigateTo('/dashboard/admin/ubicaciones')}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
              >
                Ubicaciones
              </button>
              <button
                onClick={() => navigateTo('/dashboard/admin/reportes')}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
              >
                Centro de Reportes
              </button>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Sistema de Control Interno Activo
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>El sistema está monitoreando continuamente:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Todas las operaciones son auditadas automáticamente</li>
                  <li>Alertas en tiempo real para situaciones críticas</li>
                  <li>Validaciones de integridad de datos activas</li>
                  <li>Segregación de funciones implementada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}