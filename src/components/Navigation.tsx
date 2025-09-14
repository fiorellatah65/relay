// // src/components/Navigation.tsx
// "use client";

// import Link from "next/link";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { usePathname } from "next/navigation";

// type UserRole = "administrador" | "supervisor" | "operador";

// export default function Navigation() {
//   const { user } = useUser();
//   const pathname = usePathname();
  
//   if (!user) return null;

//   const role = (user.publicMetadata?.role as UserRole) ?? "operador";
  
//   const navItems = {
//     administrador: [
//       { href: "/dashboard/administrador", label: "Panel Admin", icon: "🏛️" },
//       { href: "/dashboard/administrador/usuarios", label: "Gestionar Usuarios", icon: "👥" },
//       { href: "/dashboard/administrador/reportes", label: "Reportes Ejecutivos", icon: "📊" },
//       { href: "/dashboard/administrador/sistema", label: "Config. Sistema", icon: "⚙️" },
//       { href: "/dashboard/administrador/auditoria", label: "Auditoría Completa", icon: "🔒" },
//     ],
//     supervisor: [
//       { href: "/dashboard/supervisor", label: "Panel Supervisión", icon: "👁️" },
//       { href: "/dashboard/supervisor/movimientos", label: "Revisar Movimientos", icon: "📋" },
//       { href: "/dashboard/supervisor/alertas", label: "Gestionar Alertas", icon: "⚠️" },
//       { href: "/dashboard/supervisor/reportes", label: "Reportes Control", icon: "📈" },
//       { href: "/dashboard/supervisor/auditoria", label: "Log Auditoría", icon: "🔍" },
//     ],
//     operador: [
//       { href: "/dashboard/operador", label: "Mi Panel", icon: "🔧" },
//       { href: "/dashboard/operador/inventario", label: "Gestionar Inventario", icon: "📦" },
//       { href: "/dashboard/operador/movimientos", label: "Registrar Movimientos", icon: "📋" },
//       { href: "/dashboard/operador/consultas", label: "Consultas", icon: "🔍" },
//       { href: "/dashboard/operador/reportes", label: "Mis Reportes", icon: "📊" },
//     ]
//   };

//   const currentNavItems = navItems[role] || navItems.operador;

//   return (
//     <nav className="bg-white shadow-sm border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center space-x-8">
//             <Link href="/" className="flex items-center space-x-2">
//               <span className="text-2xl">🏛️</span>
//               <div>
//                 <div className="text-xl font-bold text-blue-600">Inventario Integridad</div>
//                 <div className="text-xs text-gray-500">Universidad Pública</div>
//               </div>
//             </Link>
            
//             <div className="hidden lg:flex space-x-1">
//               {currentNavItems.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                     pathname === item.href
//                       ? "bg-blue-100 text-blue-700"
//                       : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//                   }`}
//                 >
//                   <span className="mr-2">{item.icon}</span>
//                   {item.label}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <div className="hidden md:block text-right">
//               <div className="text-sm font-medium text-gray-900">
//                 {user.firstName} {user.lastName}
//               </div>
//               <div className="text-xs text-gray-500">
//                 Rol: <span className="font-medium capitalize text-blue-600">{role}</span>
//               </div>
//             </div>
//             <UserButton 
//               afterSignOutUrl="/"
//               appearance={{
//                 elements: {
//                   avatarBox: "w-10 h-10"
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

type UserRole = "administrador" | "supervisor" | "operador";

export default function Navigation() {
  const { user } = useUser();
  const pathname = usePathname();
  
  if (!user) return null;

  const role = (user.publicMetadata?.role as UserRole) ?? "operador";
  
  const navItems: { [key in UserRole]: { href: string; label: string; icon: string }[] } = {
    administrador: [
      { href: "/dashboard/administrador", label: "Panel Admin", icon: "🏛️" },
      { href: "/dashboard/administrador/usuarios", label: "Gestionar Usuarios", icon: "👥" },
      { href: "/dashboard/administrador/reportes", label: "Reportes Ejecutivos", icon: "📊" },
      { href: "/dashboard/administrador/sistema", label: "Config. Sistema", icon: "⚙️" },
      { href: "/dashboard/administrador/auditoria", label: "Auditoría Completa", icon: "🔒" },
    ],
    supervisor: [
      { href: "/dashboard/supervisor", label: "Panel Supervisión", icon: "👁️" },
      { href: "/dashboard/supervisor/movimientos", label: "Revisar Movimientos", icon: "📋" },
      { href: "/dashboard/supervisor/alertas", label: "Gestionar Alertas", icon: "⚠️" },
      { href: "/dashboard/supervisor/reportes", label: "Reportes Control", icon: "📈" },
      { href: "/dashboard/supervisor/auditoria", label: "Log Auditoría", icon: "🔍" },
    ],
    operador: [
      { href: "/dashboard/operador", label: "Mi Panel", icon: "🔧" },
      { href: "/dashboard/operador/inventario", label: "Gestionar Inventario", icon: "📦" },
      { href: "/dashboard/operador/movimientos", label: "Registrar Movimientos", icon: "📋" },
      { href: "/dashboard/operador/consultas", label: "Consultas", icon: "🔍" },
      { href: "/dashboard/operador/reportes", label: "Mis Reportes", icon: "📊" },
    ]
  };

  const currentNavItems = navItems[role] || navItems.operador;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏛️</span>
              <div>
                <div className="text-xl font-bold text-blue-600">Inventario Integridad</div>
                <div className="text-xs text-gray-500">Universidad Pública</div>
              </div>
            </Link>
            
            <div className="hidden lg:flex space-x-1">
              {currentNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-500">
                Rol: <span className="font-medium capitalize text-blue-600">{role}</span>
              </div>
            </div>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}