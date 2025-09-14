// // src/app/dashboard/admin/usuarios/page.tsx
// "use client";
// import React, { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import { useRouter } from 'next/navigation';
// import { 
//   Users, 
//   Plus, 
//   Trash2, 
//   Search, 
//   Shield, 
//   Mail,
//   Eye,
//   EyeOff,
//   Save,
//   X,
//   ArrowLeft,
//   UserCheck,
//   UserX
// } from 'lucide-react';

// // Interfaces
// interface User {
//   id: string;
//   email: string;
//   created_at: string;
//   role: 'admin' | 'supervisor' | 'operador';
//   is_active: boolean;
//   full_name: string;
//   last_sign_in_at?: string;
// }

// interface UserFormData {
//   email: string;
//   password: string;
//   role: 'admin' | 'supervisor' | 'operador';
//   full_name: string;
// }

// export default function UserManagement() {
//   const router = useRouter();
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
  
//   const [formData, setFormData] = useState<UserFormData>({
//     email: '',
//     password: '',
//     role: 'operador',
//     full_name: ''
//   });

//   useEffect(() => {
//     checkAuthAndLoadUsers();
//   }, []);

//   const checkAuthAndLoadUsers = async () => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (!session) {
//         router.push('/auth/login');
//         return;
//       }

//       // Verificar que sea admin
//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('role')
//         .eq('id', session.user.id)
//         .single();

//       if (profile?.role !== 'admin') {
//         router.push('/dashboard');
//         return;
//       }

//       setIsAuthenticated(true);
//       await loadUsers();
//     } catch (error) {
//       console.error('Error verificando auth:', error);
//       router.push('/auth/login');
//     }
//   };

//   // Función para obtener el token de autorización
//   const getAuthToken = async () => {
//     const { data: { session } } = await supabase.auth.getSession();
//     return session?.access_token;
//   };

//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const token = await getAuthToken();
      
//       const response = await fetch('/api/users', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Error cargando usuarios');
//       }

//       const data = await response.json();
//       setUsers(data.users || []);
//     } catch (error) {
//       console.error('Error cargando usuarios:', error);
//       alert('Error al cargar usuarios');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Crear nuevo usuario
//   const handleCreateUser = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
    
//     try {
//       const token = await getAuthToken();
      
//       const response = await fetch('/api/users', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Error creando usuario');
//       }

//       setShowModal(false);
//       setFormData({
//         email: '',
//         password: '',
//         role: 'operador',
//         full_name: ''
//       });
      
//       await loadUsers();
//       alert('Usuario creado exitosamente');
//     } catch (error: any) {
//       console.error('Error creando usuario:', error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Actualizar rol de usuario
//   const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'supervisor' | 'operador') => {
//     try {
//       const token = await getAuthToken();
//       const user = users.find(u => u.id === userId);
      
//       const response = await fetch('/api/users', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           userId,
//           role: newRole,
//           is_active: user?.is_active,
//           full_name: user?.full_name
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Error actualizando rol');
//       }

//       await loadUsers();
//       alert('Rol actualizado correctamente');
//     } catch (error) {
//       console.error('Error actualizando rol:', error);
//       alert('Error al actualizar el rol');
//     }
//   };

//   // Activar/desactivar usuario
//   const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
//     try {
//       const token = await getAuthToken();
//       const user = users.find(u => u.id === userId);
      
//       const response = await fetch('/api/users', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           userId,
//           role: user?.role,
//           is_active: !currentStatus,
//           full_name: user?.full_name
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Error cambiando estado');
//       }

//       await loadUsers();
//       alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
//     } catch (error) {
//       console.error('Error cambiando estado:', error);
//       alert('Error al cambiar el estado del usuario');
//     }
//   };

//   // Eliminar usuario
//   const handleDeleteUser = async (userId: string) => {
//     if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
//       return;
//     }

//     try {
//       const token = await getAuthToken();
      
//       const response = await fetch(`/api/users?userId=${userId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Error eliminando usuario');
//       }

//       await loadUsers();
//       alert('Usuario eliminado correctamente');
//     } catch (error) {
//       console.error('Error eliminando usuario:', error);
//       alert('Error al eliminar el usuario');
//     }
//   };

//   // Filtrar usuarios
//   const filteredUsers = users.filter(user => 
//     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Función para obtener el color del rol
//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case 'admin': return 'bg-red-100 text-red-800';
//       case 'supervisor': return 'bg-blue-100 text-blue-800';
//       case 'operador': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (!isAuthenticated || loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center">
//               <button
//                 onClick={() => router.push('/dashboard/admin')}
//                 className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//                   <Users className="w-8 h-8 text-blue-600 mr-3" />
//                   Gestión de Usuarios
//                 </h1>
//                 <p className="text-gray-600 mt-1">Administra usuarios y permisos del sistema</p>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 setFormData({
//                   email: '',
//                   password: '',
//                   role: 'operador',
//                   full_name: ''
//                 });
//                 setShowModal(true);
//               }}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
//             >
//               <Plus className="w-4 h-4" />
//               <span>Nuevo Usuario</span>
//             </button>
//           </div>
//         </div>

//         {/* Buscador */}
//         <div className="p-6">
//           <div className="relative max-w-md">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Buscar usuarios..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Estadísticas rápidas */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <div className="flex items-center">
//             <Users className="h-8 w-8 text-blue-600 mr-3" />
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
//               <p className="text-2xl font-bold text-gray-900">{users.length}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <div className="flex items-center">
//             <Shield className="h-8 w-8 text-red-600 mr-3" />
//             <div>
//               <p className="text-sm font-medium text-gray-600">Admins</p>
//               <p className="text-2xl font-bold text-red-600">
//                 {users.filter(u => u.role === 'admin').length}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <div className="flex items-center">
//             <Eye className="h-8 w-8 text-blue-600 mr-3" />
//             <div>
//               <p className="text-sm font-medium text-gray-600">Supervisores</p>
//               <p className="text-2xl font-bold text-blue-600">
//                 {users.filter(u => u.role === 'supervisor').length}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <div className="flex items-center">
//             <UserCheck className="h-8 w-8 text-green-600 mr-3" />
//             <div>
//               <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
//               <p className="text-2xl font-bold text-green-600">
//                 {users.filter(u => u.is_active).length}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabla de Usuarios */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Usuario
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Rol
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estado
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Último acceso
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Acciones
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUsers.map((user) => (
//                 <tr key={user.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10">
//                         <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
//                           <Users className="h-6 w-6 text-gray-600" />
//                         </div>
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {user.full_name || 'Sin nombre'}
//                         </div>
//                         <div className="text-sm text-gray-500 flex items-center">
//                           <Mail className="w-3 h-3 mr-1" />
//                           {user.email}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <select
//                       value={user.role}
//                       onChange={(e) => handleUpdateUserRole(user.id, e.target.value as any)}
//                       className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)} border-none outline-none cursor-pointer`}
//                     >
//                       <option value="operador">Operador</option>
//                       <option value="supervisor">Supervisor</option>
//                       <option value="admin">Admin</option>
//                     </select>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <button
//                       onClick={() => handleToggleUserStatus(user.id, user.is_active)}
//                       className={`flex items-center px-2 py-1 text-xs rounded-full transition-colors ${
//                         user.is_active 
//                           ? 'bg-green-100 text-green-800 hover:bg-green-200' 
//                           : 'bg-red-100 text-red-800 hover:bg-red-200'
//                       }`}
//                     >
//                       {user.is_active ? (
//                         <>
//                           <UserCheck className="w-3 h-3 mr-1" />
//                           Activo
//                         </>
//                       ) : (
//                         <>
//                           <UserX className="w-3 h-3 mr-1" />
//                           Inactivo
//                         </>
//                       )}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {user.last_sign_in_at 
//                       ? new Date(user.last_sign_in_at).toLocaleDateString('es-PE') 
//                       : 'Nunca'
//                     }
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => handleDeleteUser(user.id)}
//                       className="text-red-600 hover:text-red-900 transition-colors"
//                       title="Eliminar usuario"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {filteredUsers.length === 0 && (
//             <div className="text-center py-12">
//               <Users className="mx-auto h-12 w-12 text-gray-400" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'Comienza creando un nuevo usuario.'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal para Crear Usuario */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   Crear Nuevo Usuario
//                 </h3>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleCreateUser} className="p-6 space-y-4">
//               {/* Nombre completo */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Nombre Completo *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.full_name}
//                   onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Nombre completo del usuario"
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="usuario@ejemplo.com"
//                 />
//               </div>

//               {/* Contraseña */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Contraseña *
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     required
//                     minLength={6}
//                     value={formData.password}
//                     onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
//                     placeholder="Mínimo 6 caracteres"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               {/* Rol */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Rol *
//                 </label>
//                 <select
//                   value={formData.role}
//                   onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="operador">Operador</option>
//                   <option value="supervisor">Supervisor</option>
//                   <option value="admin">Administrador</option>
//                 </select>
//               </div>

//               {/* Botones */}
//               <div className="flex justify-end space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   disabled={submitting}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
//                 >
//                   {submitting ? (
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   ) : (
//                     <Save className="w-4 h-4" />
//                   )}
//                   <span>{submitting ? 'Creando...' : 'Crear Usuario'}</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Información sobre permisos */}
//       <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
//         <div className="flex">
//           <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
//           <div>
//             <h3 className="text-sm font-medium text-blue-800">
//               Información sobre Roles y Permisos
//             </h3>
//             <div className="mt-2 text-sm text-blue-700">
//               <ul className="list-disc list-inside space-y-1">
//                 <li><strong>Admin:</strong> Acceso completo al sistema, gestión de usuarios</li>
//                 <li><strong>Supervisor:</strong> Supervisión y aprobación de operaciones</li>
//                 <li><strong>Operador:</strong> Operaciones básicas de inventario</li>
//               </ul>
//               <p className="mt-2 text-xs">
//                 Los cambios de rol se aplican inmediatamente. Los usuarios inactivos no pueden acceder al sistema.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/app/dashboard/admin/usuarios/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  Shield, 
  Mail,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowLeft,
  UserCheck,
  UserX
} from 'lucide-react';

// Interfaces
interface User {
  id: string;
  email: string;
  created_at: string;
  role: 'admin' | 'supervisor' | 'operador';
  is_active: boolean;
  full_name: string;
  last_sign_in_at?: string;
}

interface UserFormData {
  email: string;
  password: string;
  role: 'admin' | 'supervisor' | 'operador';
  full_name: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    role: 'operador',
    full_name: ''
  });

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, []);

  const checkAuthAndLoadUsers = async () => {
    try {
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
        router.push('/dashboard');
        return;
      }

      setIsAuthenticated(true);
      await loadUsers();
    } catch (error) {
      console.error('Error verificando auth:', error);
      router.push('/auth/login');
    }
  };

  // Función para obtener el token de autorización
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error cargando usuarios');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando usuario');
      }

      setShowModal(false);
      setFormData({
        email: '',
        password: '',
        role: 'operador',
        full_name: ''
      });
      
      await loadUsers();
      alert('Usuario creado exitosamente');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error creando usuario:', errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Actualizar rol de usuario
  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'supervisor' | 'operador') => {
    try {
      const token = await getAuthToken();
      const user = users.find(u => u.id === userId);
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          role: newRole,
          is_active: user?.is_active,
          full_name: user?.full_name
        })
      });

      if (!response.ok) {
        throw new Error('Error actualizando rol');
      }

      await loadUsers();
      alert('Rol actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error al actualizar el rol');
    }
  };

  // Activar/desactivar usuario
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = await getAuthToken();
      const user = users.find(u => u.id === userId);
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          role: user?.role,
          is_active: !currentStatus,
          full_name: user?.full_name
        })
      });

      if (!response.ok) {
        throw new Error('Error cambiando estado');
      }

      await loadUsers();
      alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = await getAuthToken();
      
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error eliminando usuario');
      }

      await loadUsers();
      alert('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener el color del rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'operador': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/admin')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 mt-1">Administra usuarios y permisos del sistema</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({
                  email: '',
                  password: '',
                  role: 'operador',
                  full_name: ''
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Supervisores</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'supervisor').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value as 'admin' | 'supervisor' | 'operador')}
                      className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)} border-none outline-none cursor-pointer`}
                    >
                      <option value="operador">Operador</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      className={`flex items-center px-2 py-1 text-xs rounded-full transition-colors ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.is_active ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('es-PE') 
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'Comienza creando un nuevo usuario.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Crear Nuevo Usuario
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {/* Nombre completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre completo del usuario"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'supervisor' | 'operador' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="operador">Operador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Creando...' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Información sobre permisos */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre Roles y Permisos
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Admin:</strong> Acceso completo al sistema, gestión de usuarios</li>
                <li><strong>Supervisor:</strong> Supervisión y aprobación de operaciones</li>
                <li><strong>Operador:</strong> Operaciones básicas de inventario</li>
              </ul>
              <p className="mt-2 text-xs">
                Los cambios de rol se aplican inmediatamente. Los usuarios inactivos no pueden acceder al sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}