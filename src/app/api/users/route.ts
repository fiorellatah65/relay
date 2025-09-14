
// // src/app/api/users/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// // Cliente admin solo disponible en el servidor
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// });

// // Cliente regular para verificaciones básicas
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabaseRegular = createClient(supabaseUrl, supabaseAnonKey);

// // Verificar si el usuario actual es admin
// async function verifyAdmin(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('Authorization');
//     console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       console.log('Invalid auth header format');
//       return false;
//     }

//     const token = authHeader.replace('Bearer ', '');
    
//     // Verificar el token usando el cliente admin
//     const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
//     if (error || !user) {
//       console.log('Error getting user:', error?.message || 'No user found');
//       return false;
//     }

//     console.log('User verified:', user.id);

//     // Verificar rol usando el cliente admin (sin RLS)
//     const { data: profile, error: profileError } = await supabaseAdmin
//       .from('profiles')
//       .select('role')
//       .eq('id', user.id)
//       .single();

//     if (profileError) {
//       console.log('Error getting profile:', profileError.message);
//       return false;
//     }

//     console.log('User role:', profile?.role);
//     return profile?.role === 'admin';
//   } catch (error) {
//     console.error('Error in verifyAdmin:', error);
//     return false;
//   }
// }

// // GET - Obtener todos los usuarios
// export async function GET(request: NextRequest) {
//   try {
//     console.log('GET /api/users - Starting request');
    
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       console.log('Access denied - not admin');
//       return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
//     }

//     console.log('Admin verified, fetching users...');

//     // Obtener usuarios de auth usando cliente admin
//     const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
//     if (authError) {
//       console.error('Error fetching auth users:', authError);
//       throw authError;
//     }

//     console.log('Auth users fetched:', authUsers.users.length);

//     // Obtener perfiles usando cliente admin (sin restricciones RLS)
//     const { data: profiles, error: profileError } = await supabaseAdmin
//       .from('profiles')
//       .select('*');
      
//     if (profileError) {
//       console.error('Error fetching profiles:', profileError);
//       throw profileError;
//     }

//     console.log('Profiles fetched:', profiles?.length || 0);

//     // Combinar datos
//     const users = authUsers.users.map(user => {
//       const profile = profiles?.find(p => p.id === user.id);
//       return {
//         id: user.id,
//         email: user.email,
//         created_at: user.created_at,
//         last_sign_in_at: user.last_sign_in_at,
//         role: profile?.role || 'operador',
//         full_name: profile?.full_name || '',
//         is_active: profile?.is_active ?? true
//       };
//     });

//     console.log('Combined users:', users.length);
//     return NextResponse.json({ users });
//   } catch (error: any) {
//     console.error('Error in GET /api/users:', error);
//     return NextResponse.json({ 
//       error: 'Error interno del servidor', 
//       details: error.message 
//     }, { status: 500 });
//   }
// }

// // POST - Crear nuevo usuario
// export async function POST(request: NextRequest) {
//   try {
//     console.log('POST /api/users - Starting request');
    
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       console.log('Access denied - not admin');
//       return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
//     }

//     const body = await request.json();
//     console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    
//     const { email, password, role, full_name } = body;

//     if (!email || !password || !role) {
//       return NextResponse.json({ 
//         error: 'Faltan campos requeridos: email, password, role' 
//       }, { status: 400 });
//     }

//     console.log('Creating user in auth...');

//     // Crear usuario en auth usando cliente admin
//     const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
//       email,
//       password,
//       email_confirm: true,
//       user_metadata: {
//         full_name: full_name || ''
//       }
//     });

//     if (authError) {
//       console.error('Error creating auth user:', authError);
//       throw authError;
//     }

//     console.log('Auth user created:', authData.user.id);

//     // Crear perfil usando cliente admin
//     if (authData.user) {
//       const { error: profileError } = await supabaseAdmin
//         .from('profiles')
//         .insert({
//           id: authData.user.id,
//           role,
//           full_name: full_name || '',
//           is_active: true
//         });

//       if (profileError) {
//         console.error('Error creating profile:', profileError);
//         // Si falla el perfil, intentar limpiar el usuario auth
//         await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
//         throw profileError;
//       }
//     }

//     console.log('User created successfully');

//     return NextResponse.json({ 
//       success: true, 
//       user: {
//         id: authData.user.id,
//         email: authData.user.email,
//         role,
//         full_name: full_name || ''
//       }
//     });
//   } catch (error: any) {
//     console.error('Error in POST /api/users:', error);
//     return NextResponse.json({ 
//       error: error.message || 'Error creando usuario',
//       details: process.env.NODE_ENV === 'development' ? error : undefined
//     }, { status: 500 });
//   }
// }

// // PUT - Actualizar usuario
// export async function PUT(request: NextRequest) {
//   try {
//     console.log('PUT /api/users - Starting request');
    
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
//     }

//     const { userId, role, is_active, full_name } = await request.json();

//     if (!userId) {
//       return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
//     }

//     console.log('Updating user:', userId);

//     // Actualizar perfil usando cliente admin
//     const { error } = await supabaseAdmin
//       .from('profiles')
//       .update({ 
//         role, 
//         is_active, 
//         full_name,
//         updated_at: new Date().toISOString()
//       })
//       .eq('id', userId);

//     if (error) {
//       console.error('Error updating profile:', error);
//       throw error;
//     }

//     console.log('User updated successfully');
//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error('Error in PUT /api/users:', error);
//     return NextResponse.json({ 
//       error: error.message || 'Error actualizando usuario' 
//     }, { status: 500 });
//   }
// }

// // DELETE - Eliminar usuario
// export async function DELETE(request: NextRequest) {
//   try {
//     console.log('DELETE /api/users - Starting request');
    
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
//     }

//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get('userId');
    
//     if (!userId) {
//       return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
//     }

//     console.log('Deleting user:', userId);

//     // Eliminar perfil primero usando cliente admin
//     const { error: profileError } = await supabaseAdmin
//       .from('profiles')
//       .delete()
//       .eq('id', userId);

//     if (profileError) {
//       console.error('Error deleting profile:', profileError);
//       throw profileError;
//     }

//     // Eliminar de auth usando cliente admin
//     const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
//     if (authError) {
//       console.warn('Warning deleting from auth:', authError);
//       // No lanzar error aquí ya que el perfil ya se eliminó
//     }

//     console.log('User deleted successfully');
//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error('Error in DELETE /api/users:', error);
//     return NextResponse.json({ 
//       error: error.message || 'Error eliminando usuario' 
//     }, { status: 500 });
//   }
// }


// src/app/api/users/route.ts

// src/app/api/users/route.ts -
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin solo disponible en el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Verificar si el usuario actual es admin
async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid auth header format');
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el token usando el cliente admin
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.log('Error getting user:', error?.message || 'No user found');
      return false;
    }

    console.log('User verified:', user.id);

    // Verificar rol usando el cliente admin (sin RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('Error getting profile:', profileError.message);
      return false;
    }

    console.log('User role:', profile?.role);
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error in verifyAdmin:', error);
    return false;
  }
}

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/users - Starting request');
    
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      console.log('Access denied - not admin');
      return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
    }

    console.log('Admin verified, fetching users...');

    // Obtener usuarios de auth usando cliente admin
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    console.log('Auth users fetched:', authUsers.users.length);

    // Obtener perfiles usando cliente admin (sin restricciones RLS)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*');
      
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    console.log('Profiles fetched:', profiles?.length || 0);

    // Combinar datos
    const users = authUsers.users.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: profile?.role || 'operador',
        full_name: profile?.full_name || '',
        is_active: profile?.is_active ?? true
      };
    });

    console.log('Combined users:', users.length);
    return NextResponse.json({ users });
  } catch (error: unknown) {
 console.error('Error in GET /api/users:', error);
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  return NextResponse.json({ 
    error: 'Error interno del servidor', 
    details: errorMessage 
  }, { status: 500 });
  }
}

// POST - Crear nuevo usuario
// export async function POST(request: NextRequest) {
//   try {
//     console.log('POST /api/users - Starting request');
    
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       console.log('Access denied - not admin');
//       return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
//     }

//     const body = await request.json();
//     console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    
//     const { email, password, role, full_name } = body;

//     if (!email || !password || !role) {
//       return NextResponse.json({ 
//         error: 'Faltan campos requeridos: email, password, role' 
//       }, { status: 400 });
//     }

//     // Validar formato de email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json({ 
//         error: 'Formato de email inválido' 
//       }, { status: 400 });
//     }

//     console.log('Checking if user already exists...');

//     // Verificar si el usuario ya existe
//     const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
//     const userExists = existingUsers?.users.find(user => 
//       user.email?.toLowerCase() === email.toLowerCase()
//     );

//     if (userExists) {
//       console.log('User already exists:', email);
//       return NextResponse.json({ 
//         error: 'Ya existe un usuario con este email' 
//       }, { status: 400 });
//     }

//     console.log('Creating user in auth...');

//     // Crear usuario en auth usando cliente admin
//     const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
//       email: email.toLowerCase().trim(),
//       password,
//       email_confirm: true, // Confirma automáticamente el email
//       user_metadata: {
//         full_name: full_name || ''
//       }
//     });

//     if (authError) {
//       console.error('Error creating auth user:', authError);
      
//       // Manejar errores específicos
//       if (authError.message.includes('User already registered')) {
//         return NextResponse.json({ 
//           error: 'Ya existe un usuario con este email' 
//         }, { status: 400 });
//       }
      
//       throw authError;
//     }

//     if (!authData.user) {
//       throw new Error('No se pudo crear el usuario en auth');
//     }

//     console.log('Auth user created:', authData.user.id);

//     // Crear perfil usando cliente admin
//     const { error: profileError } = await supabaseAdmin
//       .from('profiles')
//       .insert({
//         id: authData.user.id,
//         role,
//         full_name: full_name || '',
//         is_active: true
//       });

//     if (profileError) {
//       console.error('Error creating profile:', profileError);
      
//       // Si falla el perfil, limpiar el usuario auth
//       try {
//         await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
//         console.log('Cleaned up auth user after profile creation failed');
//       } catch (cleanupError) {
//         console.error('Failed to cleanup auth user:', cleanupError);
//       }
      
//       throw new Error(`Error creando perfil: ${profileError.message}`);
//     }

//     console.log('User created successfully');

//     return NextResponse.json({ 
//       success: true, 
//       user: {
//         id: authData.user.id,
//         email: authData.user.email,
//         role,
//         full_name: full_name || ''
//       }
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error('Error in POST /api/users:', error);
    
//     // Determinar el código de estado apropiado
//     const statusCode = error.message.includes('email') ? 400 : 500;
    
//     return NextResponse.json({ 
//       error: error.message || 'Error creando usuario'
//     }, { status: statusCode });
//   }
// }

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/users - Starting request');
    
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      console.log('Access denied - not admin');
      return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    
    const { email, password, role, full_name } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos: email, password, role' 
      }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Formato de email inválido' 
      }, { status: 400 });
    }

    console.log('Checking if user already exists...');

    // Verificar si el usuario ya existe en auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users.find(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      console.log('User already exists:', email);
      return NextResponse.json({ 
        error: 'Ya existe un usuario con este email' 
      }, { status: 400 });
    }

    console.log('Creating user in auth...');

    // Crear usuario en auth usando cliente admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || ''
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      if (authError.message.includes('User already registered')) {
        return NextResponse.json({ 
          error: 'Ya existe un usuario con este email' 
        }, { status: 400 });
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en auth');
    }

    console.log('Auth user created:', authData.user.id);

    // Verificar si el perfil ya existe
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    if (existingProfile) {
      console.log('Profile already exists for user:', authData.user.id);
      // Opcional: Actualizar el perfil existente en lugar de crear uno nuevo
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          role,
          full_name: full_name || '',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating existing profile:', updateError);
        // Limpiar usuario auth si falla la actualización
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Error actualizando perfil existente: ${updateError.message}`);
      }
    } else {
      // Crear perfil si no existe
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          role,
          full_name: full_name || '',
          is_active: true
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Limpiar usuario auth si falla la creación del perfil
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('Cleaned up auth user after profile creation failed');
        throw new Error(`Error creando perfil: ${profileError.message}`);
      }
    }

    console.log('User created successfully');

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
        full_name: full_name || ''
      }
    }, { status: 201 });

} catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.error('Error:', errorMessage);
          return NextResponse.json({ 
            error: 'Error interno del servidor', 
            details: errorMessage 
    }, { status: 500 });
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/users - Starting request');
    
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
    }

    const { userId, role, is_active, full_name } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    console.log('Updating user:', userId);

    // Actualizar perfil usando cliente admin
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role, 
        is_active, 
        full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    console.log('User updated successfully');
    return NextResponse.json({ success: true });
  } catch (error:  unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error in PUT /api/users:', error);
  return NextResponse.json({ 
    error: 'Error interno del servidor', 
    details: errorMessage  
    }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/users - Starting request');
    
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado - Se requiere rol de administrador' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    console.log('Deleting user:', userId);

    // Eliminar perfil primero usando cliente admin
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw profileError;
    }

    // Eliminar de auth usando cliente admin
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn('Warning deleting from auth:', authError);
      // No lanzar error aquí ya que el perfil ya se eliminó
    }

    console.log('User deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error:  unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error in DELETE /api/users:', error);
    return NextResponse.json({ 

    error: 'Error eliminando usuario', 
        details: errorMessage 


    }, { status: 500 });
  }
}