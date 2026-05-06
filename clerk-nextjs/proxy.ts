import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definimos qué rutas son accesibles para TODO el mundo
const isPublicRoute = createRouteMatcher([
  '/', 
  '/contact', 
  '/api/contact',
  '/schedule',
  '/api/busy-slots',
  '/api/appointments',
  
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. Si la ruta NO es pública, pedimos autenticación
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ignora archivos internos y estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecuta para rutas de API
    '/(api|trpc)(.*)',
  ],
};