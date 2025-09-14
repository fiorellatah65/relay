// // src/components/ProtectedRoute.tsx
// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// type UserRole = "operador" | "docente" | "admin";

// interface ProtectedRouteProps {
//   allowedRoles: UserRole[];
//   children: React.ReactNode;
//   redirectTo?: string;
// }

// export default function ProtectedRoute({ 
//   allowedRoles, 
//   children, 
//   redirectTo = "/" 
// }: ProtectedRouteProps) {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const router = useRouter();

//   useEffect(() => {
//     if (isLoaded) {
//       if (!isSignedIn) {
//         router.push("/sign-in");
//         return;
//       }

//       const userRole = (user?.publicMetadata?.role as UserRole) ?? "operador";
      
//       if (!allowedRoles.includes(userRole)) {
//         router.push(redirectTo);
//       }
//     }
//   }, [isLoaded, isSignedIn, user, router, allowedRoles, redirectTo]);

//   if (!isLoaded) {
//     return <div className="flex items-center justify-center min-h-screen">
//       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//     </div>;
//   }

//   if (!isSignedIn) {
//     return null;
//   }

//   const userRole = (user?.publicMetadata?.role as UserRole) ?? "operador";
  
//   if (!allowedRoles.includes(userRole)) {
//     return null;
//   }

//   return <>{children}</>;
// }
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type UserRole = "administrador" | "supervisor" | "operador";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  allowedRoles, 
  children, 
  redirectTo = "/" 
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }

      const userRole = (user?.publicMetadata?.role as UserRole) ?? "operador";
      
      if (!allowedRoles.includes(userRole)) {
        router.push(redirectTo);
      }
    }
  }, [isLoaded, isSignedIn, user, router, allowedRoles, redirectTo]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!isSignedIn) {
    return null;
  }

  const userRole = (user?.publicMetadata?.role as UserRole) ?? "operador";
  
  if (!allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}