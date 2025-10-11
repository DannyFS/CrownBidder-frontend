import { NextResponse } from 'next/server';

// Platform domains that should serve the main platform
const PLATFORM_DOMAINS = [
  'localhost:3000',
  'crownbidder.com',
  'www.crownbidder.com',
  'app.crownbidder.com'
];

export async function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if this is a platform domain
  const isPlatformDomain = PLATFORM_DOMAINS.some(domain => 
    hostname === domain || hostname?.endsWith(domain)
  );

  if (isPlatformDomain) {
    // Platform domain - serve platform routes normally
    return handlePlatformRouting(request);
  } else {
    // Custom domain - resolve tenant and serve tenant routes
    return handleTenantRouting(request, hostname);
  }
}

async function handlePlatformRouting(request) {
  const { pathname } = request.nextUrl;

  // Redirect root to dashboard if we have auth (basic check)
  if (pathname === '/') {
    const token = request.cookies.get('crown_bidder_token');
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Block tenant routes on platform domain
  if (pathname.startsWith('/tenant')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

async function handleTenantRouting(request, hostname) {
  const { pathname } = request.nextUrl;

  try {
    // Resolve site by domain
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/sites/resolve?domain=${hostname}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Site not found for this domain
      return handleSiteNotFound(request, hostname);
    }

    const { data } = await response.json();
    const site = data.site;

    // Check if domain is verified
    if (site.domainVerificationStatus !== 'verified') {
      return handleUnverifiedDomain(request, site);
    }

    // Map tenant routes
    let rewritePath = pathname;
    
    if (pathname === '/') {
      rewritePath = '/tenant';
    } else if (pathname.startsWith('/auctions')) {
      rewritePath = `/tenant${pathname}`;
    } else if (pathname.startsWith('/about')) {
      rewritePath = '/tenant/about';
    } else if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      // Keep auth routes for tenant login
      rewritePath = pathname;
    } else {
      // Block platform routes on tenant domains
      if (pathname.startsWith('/dashboard') || 
          pathname.startsWith('/create-site') ||
          pathname.startsWith('/site/')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      rewritePath = `/tenant${pathname}`;
    }

    // Rewrite URL
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;
    const rewriteResponse = NextResponse.rewrite(rewriteUrl);

    // Add tenant info to headers for components
    rewriteResponse.headers.set('x-tenant-id', site._id);
    rewriteResponse.headers.set('x-tenant-name', site.name);
    rewriteResponse.headers.set('x-tenant-domain', site.customDomain);
    rewriteResponse.headers.set('x-tenant-theme', site.settings?.theme || 'classic-blue');
    rewriteResponse.headers.set('x-tenant-primary-color', site.settings?.primaryColor || '#1e40af');
    rewriteResponse.headers.set('x-tenant-secondary-color', site.settings?.secondaryColor || '#64748b');
    rewriteResponse.headers.set('x-tenant-logo', site.settings?.logoUrl || '');

    return rewriteResponse;

  } catch (error) {
    console.error('Tenant resolution error:', error);
    return handleSiteNotFound(request, hostname);
  }
}

function handleSiteNotFound(request, hostname) {
  // Redirect to platform with error message
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
  const redirectUrl = `${platformUrl}/site-not-found?domain=${encodeURIComponent(hostname)}`;
  return NextResponse.redirect(redirectUrl);
}

function handleUnverifiedDomain(request, site) {
  // Show domain verification page
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
  const redirectUrl = `${platformUrl}/site/${site._id}/verify-domain`;
  return NextResponse.redirect(redirectUrl);
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
