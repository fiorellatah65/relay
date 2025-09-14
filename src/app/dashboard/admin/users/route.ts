// // src/app/api/admin/users/route.ts
// import { NextRequest, NextResponse } from 'next/server' ;
// import { createClient } from '@supabase/supabase-js';
// import { supabase } from '@/lib/supabase';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! ;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// });

// // Verificar si el usuario actual es admin
// async function verifyAdmin(request: NextRequest) {
//   const authHeader = request.headers.get('Authorization');
//   if (!authHeader) return false;

//   const token = authHeader.replace('Bearer ', '');
  
//   const { data: { user }, error } = await supabase.auth.getUser(token);
//   if (error || !user) return false;

//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('role')
//     .eq('id', user.id)
//     .single();

//   return profile?.role === 'admin';
// }

// // GET - Obtener todos los usuarios
// export async function GET(request: NextRequest) {
//   try {
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
//     }

//     // Obtener usuarios de auth
//     const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
//     if (authError) throw authError;

//     // Obtener perfiles
//     const { data: profiles, error: profileError } = await supabase
//       .from('profiles')
//       .select('*');
//     if (profileError) throw profileError;

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

//     return NextResponse.json({ users });
//   } catch (error) {
//     console.error('Error obteniendo usuarios:', error);
//     return NextResponse.json({ error: 'Error interno' }, { status: 500 });
//   }
// }

// // POST - Crear nuevo usuario
// export async function POST(request: NextRequest) {
//   try {
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
//     }

//     const { email, password, role, full_name } = await request.json();

//     // Crear usuario en auth
//     const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
//       email,
//       password,
//       email_confirm: true
//     });

//     if (authError) throw authError;

//     // Crear perfil
//     if (authData.user) {
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .upsert({
//           id: authData.user.id,
//           role,
//           full_name,
//           is_active: true
//         });

//       if (profileError) throw profileError;
//     }

//     return NextResponse.json({ 
//       success: true, 
//       user: {
//         id: authData.user.id,
//         email: authData.user.email,
//         role,
//         full_name
//       }
//     });
//   } catch (error: any) {
//     console.error('Error creando usuario:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // PUT - Actualizar usuario
// export async function PUT(request: NextRequest) {
//   try {
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
//     }

//     const { userId, role, is_active, full_name } = await request.json();

//     // Actualizar perfil
//     const { error } = await supabase
//       .from('profiles')
//       .update({ role, is_active, full_name })
//       .eq('id', userId);

//     if (error) throw error;

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error('Error actualizando usuario:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
// // DELETE - Eliminar usuario
// export async function DELETE(request: NextRequest) {
//   try {
//     const isAdmin = await verifyAdmin(request);
//     if (!isAdmin) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
//     }

//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get('userId');
    
//     if (!userId) {
//       return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
//     }

//     // Eliminar perfil
//     const { error: profileError } = await supabase
//       .from('profiles')
//       .delete()
//       .eq('id', userId);

//     if (profileError) throw profileError;

//     // Eliminar de auth
//     const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
//     if (authError) {
//       console.warn('Error eliminando de auth:', authError);
//     }

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error('Error eliminando usuario:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { createClient, PostgrestError, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Verificar si el usuario actual es admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener usuarios de auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Obtener perfiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    if (profileError) throw profileError;

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
        is_active: profile?.is_active ?? true,
      };
    });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error('Error obteniendo usuarios:', error);
    const errorMessage = error instanceof AuthError || error instanceof PostgrestError
      ? error.message
      : 'Error interno';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { email, password, role, full_name } = await request.json();

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Crear perfil
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          role,
          full_name,
          is_active: true,
        });

      if (profileError) throw profileError;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
        full_name,
      },
    });
  } catch (error: unknown) {
    console.error('Error creando usuario:', error);
    const errorMessage = error instanceof AuthError || error instanceof PostgrestError
      ? error.message
      : 'Error interno';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { userId, role, is_active, full_name } = await request.json();

    // Actualizar perfil
    const { error } = await supabase
      .from('profiles')
      .update({ role, is_active, full_name })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error actualizando usuario:', error);
    const errorMessage = error instanceof PostgrestError
      ? error.message
      : 'Error interno';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Eliminar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;

    // Eliminar de auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn('Error eliminando de auth:', authError);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error eliminando usuario:', error);
    const errorMessage = error instanceof AuthError || error instanceof PostgrestError
      ? error.message
      : 'Error interno';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}