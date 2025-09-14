
// app/auth/login/page.tsx 
"use client"

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useEffect } from 'react';

type FormData = { 
  email: string; 
  password: string; 
};

export default function Login() {
  const form = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si ya está logueado al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await redirectUserByRole(session.user.id);
        }
      } catch (error) {
        console.log('Error verificando sesión existente:', error);
      }
    };
    
    checkSession();
  }, []);

  // Función para redirigir según el rol del usuario
  const redirectUserByRole = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuario:', userId);
      
      // Consulta simple solo el rol
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      console.log('Resultado consulta:', { profile, error });

      if (error) {
        console.error('Error obteniendo perfil:', error);
        setError(`Error obteniendo información del usuario: ${error.message}`);
        return;
      }

      if (!profile) {
        setError('Perfil de usuario no encontrado. Contacta al administrador.');
        return;
      }

      console.log('Rol del usuario:', profile.role);

      // Redirigir según el rol
      switch (profile.role) {
        case 'admin':
          console.log('Redirigiendo a dashboard admin');
          router.push('/dashboard/admin');
          break;
        case 'supervisor':
          console.log('Redirigiendo a dashboard supervisor');
          router.push('/dashboard/supervisor');
          break;
        case 'operador':
          console.log('Redirigiendo a dashboard operador');
          router.push('/dashboard/operador');
          break;
        default:
          console.log('Rol desconocido, redirigiendo a dashboard general');
          router.push('/dashboard');
      }
      
      router.refresh();
    } catch (err) {
      console.error('Error inesperado en redirección:', err);
      setError('Error procesando el login');
    }
  };

  // Función de submit
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Intentando login con:', data.email);
      
      // Intenta login con Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Error de autenticación:', error);
        
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Email o contraseña incorrectos');
            break;
          case 'Email not confirmed':
            setError('Debes confirmar tu email antes de iniciar sesión');
            break;
          case 'Too many requests':
            setError('Demasiados intentos de login. Espera unos minutos.');
            break;
          default:
            setError(error.message);
        }
        return;
      }

      if (!authData.user) {
        setError('Error inesperado al iniciar sesión');
        return;
      }

      console.log('Login exitoso, usuario ID:', authData.user.id);
      
      // Redirigir según el rol del usuario
      await redirectUserByRole(authData.user.id);
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado durante el login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Inventario</h1>
          <p className="mt-2 text-sm text-gray-600">Iniciar Sesión en tu cuenta</p>
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
                      className="w-full"
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
                      className="w-full"
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
          <div className="text-sm text-gray-500">
            <p>¿Problemas para acceder?</p>
            <p className="mt-1">Contacta al administrador del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}