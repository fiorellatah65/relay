
// // app/dashboard/operador/page.tsx
// "use client"
// import React, { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import { 
//   Package, 
//   TrendingUp, 
//   AlertTriangle, 
//   Plus,
//   Search,
//   Edit,
//   LogOut
// } from 'lucide-react';

// export default function OperadorDashboard() {
//   const [stats, setStats] = useState({
//     totalArticulos: 0,
//     stockBajo: 0,
//     movimientosHoy: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//   const loadData = async () => {
//     try {
//       // Cargar estadísticas
//       const [articulos, movimientos] = await Promise.all([
//         supabase.from('articulos').select('id, stock_actual, stock_minimo'),
//         supabase.from('movimientos_inventario')
//           .select('*')
//           .gte('created_at', new Date().toISOString().split('T')[0])
//       ]);

//       if (articulos.data) {
//         const stockBajo = articulos.data.filter(
//           item => item.stock_actual <= item.stock_minimo
//         ).length;
        
//         setStats({
//           totalArticulos: articulos.data.length,
//           stockBajo,
//           movimientosHoy: movimientos.data?.length || 0
//         });
//       }
//     } catch (error) {
//       console.error('Error cargando datos:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     // me aparece en rojo  router
//     router.push('/auth/login');
//   };

//   // Mostrar loading si no está autenticado
//     // me aparece en rojo  isAuthenticated 

//   if (!isAuthenticated || loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="px-6 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Dashboard Operador</h1>
//     {/* // me aparece en rojo email */}

//               <p className="text-gray-600">Bienvenido, {user?.email}</p>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
//             >
//               <LogOut className="w-4 h-4" />
//               <span>Cerrar Sesión</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="p-6">
//         {/* Estadísticas */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <Package className="h-8 w-8 text-blue-600" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Total Artículos</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalArticulos}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <AlertTriangle className="h-8 w-8 text-red-600" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
//                 <p className="text-2xl font-bold text-red-600">{stats.stockBajo}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <TrendingUp className="h-8 w-8 text-green-600" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Movimientos Hoy</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.movimientosHoy}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Acciones Disponibles */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-lg font-medium text-gray-900">Mis Funciones</h3>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <button 
//                 onClick={() => window.location.href = '/dashboard/operador/consultar-stock'}
//                 className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
//               >
//                 <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-900">Consultar Stock</p>
//                 <p className="text-xs text-gray-500 mt-1">Ver inventario disponible</p>
//               </button>
              
//               <button 
//                 onClick={() => window.location.href = '/dashboard/operador/actualizar-stock'}
//                 className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
//               >
//                 <Edit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-900">Actualizar Stock</p>
//                 <p className="text-xs text-gray-500 mt-1">Registrar entradas/salidas</p>
//               </button>
              
//               <button 
//                 onClick={() => window.location.href = '/dashboard/operador/solicitar-movimiento'}
//                 className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
//               >
//                 <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-900">Solicitar Movimiento</p>
//                 <p className="text-xs text-gray-500 mt-1">Pedir autorización para cambios</p>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Nota sobre permisos */}
//         <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-blue-800">
//                 Información sobre Permisos
//               </h3>
//               <div className="mt-2 text-sm text-blue-700">
//                 <p>Como operador, puedes:</p>
//                 <ul className="list-disc list-inside mt-1">
//                   <li>Consultar el inventario completo</li>
//                   <li>Actualizar stock de artículos existentes</li>
//                   <li>Solicitar movimientos que requieren autorización</li>
//                 </ul>
//                 <p className="mt-2">Para funciones administrativas, contacta a un supervisor o administrador.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/app/dashboard/operador/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // Agregado import faltante
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Search,
  Edit,
  LogOut,
  User
} from 'lucide-react';

// Interfaces para TypeScript
interface Stats {
  totalArticulos: number;
  stockBajo: number;
  movimientosHoy: number;
}

interface UserProfile {
  id: string;
  email?: string;
  role?: string;
}

export default function OperadorDashboard() {
  const router = useRouter(); // Inicializar router
  const [stats, setStats] = useState<Stats>({
    totalArticulos: 0,
    stockBajo: 0,
    movimientosHoy: 0
  });
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

      setUser({
        id: session.user.id,
        email: session.user.email
      });
      setIsAuthenticated(true);

      // Cargar datos del dashboard
      await loadData();
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      router.push('/auth/login');
    }
  };

  const loadData = async () => {
    try {
      // Cargar estadísticas
      const [articulos, movimientos] = await Promise.all([
        supabase.from('articulos').select('id, stock_actual, stock_minimo'),
        supabase.from('movimientos_inventario')
          .select('*')
          .gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      if (articulos.data) {
        const stockBajo = articulos.data.filter(
          item => item.stock_actual <= item.stock_minimo
        ).length;
        
        setStats({
          totalArticulos: articulos.data.length,
          stockBajo,
          movimientosHoy: movimientos.data?.length || 0
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
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

  // Mostrar loading si no está autenticado
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Operador</h1>
              <p className="text-gray-600 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Bienvenido, {user?.email || 'Usuario'}
              </p>
            </div>
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

      <div className="p-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Artículos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalArticulos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{stats.stockBajo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Movimientos Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.movimientosHoy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Disponibles */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Mis Funciones</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => navigateTo('/dashboard/operador/consultar-stock')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Consultar Stock</p>
                <p className="text-xs text-gray-500 mt-1">Ver inventario disponible</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/operador/actualizar-stock')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Actualizar Stock</p>
                <p className="text-xs text-gray-500 mt-1">Registrar entradas/salidas</p>
              </button>
              
              <button 
                onClick={() => navigateTo('/dashboard/operador/solicitar-movimiento')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Solicitar Movimiento</p>
                <p className="text-xs text-gray-500 mt-1">Pedir autorización para cambios</p>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de actividad reciente */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resumen de Hoy</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Movimientos Registrados</h4>
                <p className="text-2xl font-bold text-green-900">{stats.movimientosHoy}</p>
                <p className="text-xs text-green-600">Entradas y salidas de hoy</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-orange-800 mb-2">Artículos con Stock Bajo</h4>
                <p className="text-2xl font-bold text-orange-900">{stats.stockBajo}</p>
                <p className="text-xs text-orange-600">Requieren reposición</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota sobre permisos */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información sobre Permisos
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Como operador, puedes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Consultar el inventario completo</li>
                  <li>Actualizar stock de artículos existentes</li>
                  <li>Solicitar movimientos que requieren autorización</li>
                  <li>Ver reportes básicos de inventario</li>
                </ul>
                <p className="mt-2 text-xs">
                  Para funciones administrativas, contacta a un supervisor o administrador.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos adicionales */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Accesos Rápidos</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigateTo('/dashboard/operador/historial')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Ver Mi Historial
              </button>
              <button
                onClick={() => navigateTo('/dashboard/operador/reportes')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Reportes Básicos
              </button>
              <button
                onClick={() => navigateTo('/dashboard/operador/ayuda')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                Centro de Ayuda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}