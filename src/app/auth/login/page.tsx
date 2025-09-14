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
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';

// Tipo para datos del form
type FormData = { 
  email: string; 
  password: string; 
};

// Función principal
export default function Login() {
  // Inicializa form con react-hook-form y valores por defecto
  const form = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función de submit
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Intenta login con Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Si éxito, redirige a home
      router.push('/');
      router.refresh(); // Fuerza refresh para que detecte la sesión
    } catch (_) {
      setError('Error inesperado durante el login');
    } finally {
      setIsLoading(false);
    }
  };

  // Render del form
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
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
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}