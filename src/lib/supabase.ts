// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// src/lib/supabase-admin.ts
// src/lib/supabase.ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente regular para uso en el frontend (con clave anónima)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);