// // app/auth/login/page.tsx

// 'use client';

// import { useForm } from 'react-hook-form';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useState } from 'react';
// import Link from 'next/link';

// // Tipo para datos del form
// type FormData = { 
//   email: string; 
//   password: string; 
// };

// // Función principal
// export default function Login() {
//   // Inicializa form con react-hook-form y valores por defecto
//   const form = useForm<FormData>({
//     defaultValues: {
//       email: '',
//       password: ''
//     }
//   });
  
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Función de submit
//   const onSubmit = async (data: FormData) => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       // Intenta login con Supabase
//       const { error } = await supabase.auth.signInWithPassword({
//         email: data.email,
//         password: data.password,
//       });

//       if (error) {
//         setError(error.message);
//         return;
//       }

//       // Si éxito, redirige a home
//       router.push('/');
//       router.refresh(); // Fuerza refresh para que detecte la sesión
//     } catch (err) {
//       setError('Error inesperado durante el login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render del form
//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="w-full max-w-md space-y-8 p-8">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
//         </div>
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="email"
//               rules={{
//                 required: 'El email es requerido',
//                 pattern: {
//                   value: /^\S+@\S+$/i,
//                   message: 'Email inválido'
//                 }
//               }}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input 
//                       type="email" 
//                       placeholder="tu@email.com"
//                       {...field} 
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="password"
//               rules={{
//                 required: 'La contraseña es requerida',
//                 minLength: {
//                   value: 6,
//                   message: 'La contraseña debe tener al menos 6 caracteres'
//                 }
//               }}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Contraseña</FormLabel>
//                   <FormControl>
//                     <Input 
//                       type="password" 
//                       placeholder="••••••••"
//                       {...field} 
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {error && (
//               <div className="text-red-500 text-sm text-center">
//                 {error}
//               </div>
//             )}
            
//             <Button 
//               type="submit" 
//               className="w-full"
//               disabled={isLoading}
//             >
//               {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }
//-----------------------------------------------------NUEVO

// app/auth/login/page.tsx
// app/auth/login/page.tsx - Versión con debugging
// // app/auth/login/page.tsx - Versión con debugging
// 'use client';

// import { useForm } from 'react-hook-form';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useState, useEffect } from 'react';

// type FormData = { 
//   email: string; 
//   password: string; 
// };

// export default function Login() {
//   const form = useForm<FormData>({
//     defaultValues: {
//       email: '',
//       password: ''
//     }
//   });
  
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [debugInfo, setDebugInfo] = useState<string[]>([]);

//   // Función para agregar información de debug
//   const addDebugInfo = (message: string) => {
//     console.log(message);
//     setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
//   };

//   // Verificar si ya está logueado al cargar la página
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         // addDebugInfo('Verificando sesión existente...');
//         const { data: { session } } = await supabase.auth.getSession();
        
//         if (session) {
//           addDebugInfo(`Sesión encontrada para usuario: ${session.user.email}`);
//           await redirectUserByRole(session.user.id);
//         } else {
//           // addDebugInfo('No hay sesión existente');
//         }
//       } catch (error) {
//         addDebugInfo(`Error verificando sesión: ${error}`);
//       }
//     };
    
//     checkSession();
//   }, []);

//   // Función para redirigir según el rol del usuario
//   const redirectUserByRole = async (userId: string) => {
//     try {
//       addDebugInfo(`Buscando perfil para usuario ID: ${userId}`);
      
//       // Primero, intentar con el cliente regular
//       const { data: profile, error } = await supabase
//         .from('profiles')
//         .select('role, is_active, full_name')
//         .eq('id', userId)
//         .single();

//       addDebugInfo(`Resultado consulta perfil - Error: ${error?.message || 'ninguno'}`);
//       addDebugInfo(`Datos del perfil: ${JSON.stringify(profile)}`);

//       if (error) {
//         // Si falla, podría ser por RLS, intentemos con una consulta más simple
//         addDebugInfo('Intentando consulta alternativa...');
        
//         const { data: profiles, error: error2 } = await supabase
//           .from('profiles')
//           .select('*');
          
//         addDebugInfo(`Consulta general - Error: ${error2?.message || 'ninguno'}`);
//         addDebugInfo(`Perfiles encontrados: ${profiles?.length || 0}`);
        
//         if (profiles) {
//           const userProfile = profiles.find(p => p.id === userId);
//           addDebugInfo(`Perfil encontrado en lista: ${JSON.stringify(userProfile)}`);
//         }

//         setError(`Error obteniendo perfil: ${error.message}`);
//         return;
//       }

//       if (!profile) {
//         addDebugInfo('Perfil no encontrado - usuario sin perfil en la tabla');
//         setError('Perfil de usuario no encontrado. Contacta al administrador.');
//         return;
//       }

//       addDebugInfo(`Rol del usuario: ${profile.role}`);

//       // Redirigir según el rol
//       switch (profile.role) {
//         case 'admin':
//           addDebugInfo('Redirigiendo a dashboard admin');
//           router.push('/dashboard/admin');
//           break;
//         case 'supervisor':
//           addDebugInfo('Redirigiendo a dashboard supervisor');
//           router.push('/dashboard/supervisor');
//           break;
//         case 'operador':
//           addDebugInfo('Redirigiendo a dashboard operador');
//           router.push('/dashboard/operador');
//           break;
//         default:
//           addDebugInfo('Rol desconocido, redirigiendo a dashboard general');
//           router.push('/dashboard');
//       }
      
//       router.refresh();
//     } catch (err) {
//       addDebugInfo(`Error inesperado en redirección: ${err}`);
//       setError('Error procesando el login');
//     }
//   };

//   // Función de submit
//   const onSubmit = async (data: FormData) => {
//     setIsLoading(true);
//     setError(null);
//     setDebugInfo([]);
    
//     try {
//       addDebugInfo(`Intentando login con email: ${data.email}`);
      
//       // Intenta login con Supabase
//       const { data: authData, error } = await supabase.auth.signInWithPassword({
//         email: data.email,
//         password: data.password,
//       });

//       if (error) {
//         addDebugInfo(`Error de autenticación: ${error.message}`);
        
//         switch (error.message) {
//           case 'Invalid login credentials':
//             setError('Email o contraseña incorrectos');
//             break;
//           case 'Email not confirmed':
//             setError('Debes confirmar tu email antes de iniciar sesión');
//             break;
//           case 'Too many requests':
//             setError('Demasiados intentos de login. Espera unos minutos.');
//             break;
//           default:
//             setError(error.message);
//         }
//         return;
//       }

//       if (!authData.user) {
//         addDebugInfo('Login exitoso pero sin datos de usuario');
//         setError('Error inesperado al iniciar sesión');
//         return;
//       }

//       addDebugInfo(`Login exitoso - Usuario ID: ${authData.user.id}`);
//       addDebugInfo(`Email verificado: ${authData.user.email_confirmed_at ? 'Sí' : 'No'}`);
      
//       // Redirigir según el rol del usuario
//       await redirectUserByRole(authData.user.id);
      
//     } catch (err) {
//       addDebugInfo(`Error inesperado: ${err}`);
//       setError('Error inesperado durante el login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50">
//       <div className="w-full max-w-2xl space-y-8 p-8 bg-white rounded-lg shadow-lg">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900">Sistema de Inventario</h1>
//           <p className="mt-2 text-sm text-gray-600">Iniciar Sesión - Modo Debug</p>
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
//           {/* Formulario */}
//           <div>
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   rules={{
//                     required: 'El email es requerido',
//                     pattern: {
//                       value: /^\S+@\S+$/i,
//                       message: 'Email inválido'
//                     }
//                   }}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="email" 
//                           placeholder="tu@email.com"
//                           disabled={isLoading}
//                           {...field} 
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="password"
//                   rules={{
//                     required: 'La contraseña es requerida',
//                     minLength: {
//                       value: 6,
//                       message: 'La contraseña debe tener al menos 6 caracteres'
//                     }
//                   }}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Contraseña</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="password" 
//                           placeholder="••••••••"
//                           disabled={isLoading}
//                           {...field} 
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 {error && (
//                   <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
//                     {error}
//                   </div>
//                 )}
                
//                 <Button 
//                   type="submit" 
//                   className="w-full bg-blue-600 hover:bg-blue-700"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       Iniciando sesión...
//                     </div>
//                   ) : (
//                     'Iniciar Sesión'
//                   )}
//                 </Button>
//               </form>
//             </Form>
//           </div>

//           {/* Panel de Debug
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-900 mb-3">Información de Debug:</h3>
//             <div className="space-y-1 text-xs font-mono text-gray-600 max-h-80 overflow-y-auto">
//               {debugInfo.length === 0 ? (
//                 <p className="text-gray-400">Los logs aparecerán aquí...</p>
//               ) : (
//                 debugInfo.map((info, index) => (
//                   <div key={index} className="border-b border-gray-200 pb-1">
//                     {info}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div> */}

         


//         </div>

//         {/* Botón para limpiar debug */}
//         {debugInfo.length > 0 && (
//           <div className="text-center">
//             <button
//               onClick={() => setDebugInfo([])}
//               className="text-sm text-gray-500 hover:text-gray-700"
//             >
//               Limpiar logs
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// app/auth/login/page.tsx

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type FormData = { 
  email: string; 
  password: string; 
};

export default function LoginPage() {
  const form = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Verificación inicial más simple
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && mounted) {
          // Si ya hay sesión, redirigir directamente sin obtener perfil
          // El middleware se encargará de la redirección correcta
          window.location.replace('/dashboard/admin');
          return;
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        switch (authError.message) {
          case 'Invalid login credentials':
            setError('Email o contraseña incorrectos');
            break;
          case 'Email not confirmed':
            setError('Debes confirmar tu email antes de iniciar sesión');
            break;
          case 'Too many requests':
            setError('Demasiados intentos. Espera unos minutos.');
            break;
          default:
            setError('Error de autenticación: ' + authError.message);
        }
        return;
      }

      if (!authData.user || !authData.session) {
        setError('Error inesperado en la autenticación');
        return;
      }

      // Redirección simple - el middleware se encarga del resto
      window.location.replace('/dashboard/admin');
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado durante el login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Inventario Integridad</h1>
          <p className="mt-2 text-sm text-gray-600">Iniciar Sesión</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'El email es requerido',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email inválido'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="tu@email.com"
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}