// src/app/dashboard/supervisor/page.tsx

// src/app/dashboard/supervisor/page.tsx
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
  BarChart3,
  Shield,
  CheckCircle,
  Clock,
  LogOut,
  User,
  Settings,
  Search
} from 'lucide-react';

// Interfaces para TypeScript
interface Alert {
  id: string;
  tipo: string;
  mensaje: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

interface PendingApproval {
  id: string;
  tipo: string;
  solicitante: string;
  descripcion: string;
  fecha_solicitud: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}

interface Stats {
  totalArticulos: number;
  stockBajo: number;
  movimientosHoy: number;
  alertasPendientes: number;
  operadoresActivos: number;
  solicitudesPendientes: number;
  reportesGenerados: number;
  auditoriasRealizadas: number;
}

interface UserProfile {
  id: string;
  email?: string;
  role?: string;
}

export default function SupervisorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalArticulos: 0,
    stockBajo: 0,
    movimientosHoy: 0,
    alertasPendientes: 0,
    operadoresActivos: 0,
    solicitudesPendientes: 0,
    reportesGenerados: 0,
    auditoriasRealizadas: 0
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
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

      // Verificar que sea supervisor
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'supervisor') {
        // Redirigir según su rol real
        if (profile?.role === 'admin') {
          router.push('/dashboard/admin');
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
      const [articulos, alertas, movimientos, operadores, solicitudes, reportes, auditorias] = await Promise.all([
        supabase.from('articulos').select('id, stock_actual, stock_minimo'),
        supabase.from('alertas').select('*').eq('estado', 'PENDIENTE'),
        supabase.from('movimientos_inventario')
          .select('*')
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('profiles').select('id').eq('role', 'operador'),
        supabase.from('solicitudes_movimiento').select('*').eq('estado', 'PENDIENTE'),
        supabase.from('reportes').select('*')
          .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString()),
        supabase.from('auditoria_logs').select('*')
          .gte('timestamp', new Date(Date.now() - 30*24*60*60*1000).toISOString())
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
          operadoresActivos: operadores.data?.length || 0,
          solicitudesPendientes: solicitudes.data?.length || 0,
          reportesGenerados: reportes.data?.length || 0,
          auditoriasRealizadas: auditorias.data?.length || 0
        });
      }

      // Cargar alertas y solicitudes pendientes
      setAlerts((alertas.data as Alert[]) || []);
      setPendingApprovals((solicitudes.data as PendingApproval[]) || []);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, action: 'APROBAR' | 'RECHAZAR') => {
    try {
      const { error } = await supabase
        .from('solicitudes_movimiento')
        .update({ 
          estado: action === 'APROBAR' ? 'APROBADO' : 'RECHAZADO',
          aprobado_por: user?.id,
          fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Recargar datos
      await loadDashboardData();
      alert(`Solicitud ${action === 'APROBAR' ? 'aprobada' : 'rechazada'} correctamente`);
    } catch (error) {
      console.error('Error procesando aprobación:', error);
      alert('Error al procesar la solicitud');
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
                <Shield className="w-8 h-8 text-green-600 mr-3" />
                Panel de Supervisión
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <User className="w-4 h-4 mr-2" />
                Supervisor - {user?.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigateTo('/dashboard/supervisor/reportes')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Ver Reportes</span>
              </button>
              <button 
                onClick={() => navigateTo('/dashboard/supervisor/auditoria')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Auditoría</span>
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
        {/* Estadísticas Principales */}
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
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Operadores Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.operadoresActivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.solicitudesPendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Pendientes</p>
                <p className="text-2xl font-bold text-red-600">{stats.alertasPendientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Movimientos Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.movimientosHoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reportes (30 días)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reportesGenerados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Auditorías (30 días)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.auditoriasRealizadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.stockBajo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solicitudes Pendientes de Aprobación */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="w-5 h-5 text-orange-500 mr-2" />
                Solicitudes Pendientes
              </h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              {pendingApprovals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes</p>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.slice(0, 5).map((approval) => (
                    <div key={approval.id} className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{approval.tipo}</p>
                          <p className="text-sm text-gray-600 mt-1">{approval.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Solicitado por: {approval.solicitante} - {new Date(approval.fecha_solicitud).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproval(approval.id, 'APROBAR')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleApproval(approval.id, 'RECHAZAR')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alertas del Sistema */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Alertas del Sistema
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
        </div>

        {/* Funciones de Supervisión */}
        <div className="mt-8 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Funciones de Supervisión</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigateTo('/dashboard/supervisor/inventario')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Supervisar Inventario</p>
                <p className="text-xs text-gray-500 mt-1">Vista completa del inventario</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/supervisor/usuarios')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Supervisar Operadores</p>
                <p className="text-xs text-gray-500 mt-1">Actividad de usuarios</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/supervisor/reportes')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Generar Reportes</p>
                <p className="text-xs text-gray-500 mt-1">Reportes avanzados</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/supervisor/auditoria')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Auditoría</p>
                <p className="text-xs text-gray-500 mt-1">Logs y trazabilidad</p>
              </button>
            </div>
          </div>
        </div>

        {/* Herramientas Adicionales */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Herramientas de Análisis</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigateTo('/dashboard/supervisor/analisis')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Análisis de Tendencias</span>
              </button>
              <button
                onClick={() => navigateTo('/dashboard/supervisor/validaciones')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Validar Operaciones
              </button>
              <button
                onClick={() => navigateTo('/dashboard/supervisor/alertas')}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
              >
                Gestionar Alertas
              </button>
              <button
                onClick={() => navigateTo('/dashboard/supervisor/configuracion')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
            </div>
          </div>
        </div>

        {/* Información sobre la Supervisión */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <Shield className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Panel de Supervisión Activo
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Como supervisor, puedes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Aprobar o rechazar solicitudes de movimientos</li>
                  <li>Supervisar actividades de los operadores</li>
                  <li>Generar reportes avanzados del sistema</li>
                  <li>Auditar todas las operaciones del inventario</li>
                  <li>Gestionar alertas y configuraciones del sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}