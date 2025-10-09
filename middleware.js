import { NextResponse } from 'next/server';

export async function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Extract domain parts
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';
  const isMainDomain = hostname === mainDomain || hostname.startsWith('localhost');

  // If it's the main domain, continue normally
  if (isMainDomain) {
    return NextResponse.next();
  }

  // For custom domains, resolve tenant and rewrite to tenant routes
  try {
    // Call backend to resolve tenant by domain
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/sites/resolve?domain=${hostname}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If site not found, redirect to main domain
      return NextResponse.redirect(new URL('/', `http://${mainDomain}`));
    }

    const data = await response.json();
    const site = data.data;

    // Rewrite to tenant routes
    const path = url.pathname;
    let rewritePath = path;

    // Map paths to tenant routes
    if (path === '/' || path === '') {
      rewritePath = '/tenant';
    } else if (path.startsWith('/auctions')) {
      rewritePath = `/tenant${path}`;
    } else if (path.startsWith('/about')) {
      rewritePath = `/tenant${path}`;
    } else if (path.startsWith('/login') || path.startsWith('/signup')) {
      // Keep auth routes as-is for tenant sites
      rewritePath = path;
    } else {
      rewritePath = `/tenant${path}`;
    }

    // Clone the URL and set the pathname
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = rewritePath;

    // Create response with rewrite
    const response = NextResponse.rewrite(rewriteUrl);

    // Add tenant info to headers for use in components
    response.headers.set('x-tenant-id', site._id);
    response.headers.set('x-tenant-name', site.name);
    response.headers.set('x-tenant-domain', site.customDomain);

    return response;
  } catch (error) {
    console.error('Tenant resolution error:', error);
    // On error, redirect to main domain
    return NextResponse.redirect(new URL('/', `http://${mainDomain}`));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
