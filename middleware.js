import { NextResponse } from 'next/server';

// Root domain configuration
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'crownbidder.com';
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

// Extract subdomain following Vercel patterns
function extractSubdomain(request) {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }
    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Extract subdomain using Vercel patterns
  const subdomain = extractSubdomain(request);

  if (!subdomain) {
    // Main platform domain - serve platform routes normally
    return handlePlatformRouting(request);
  } else {
    // Subdomain detected - serve tenant-specific content
    return handleSubdomainRouting(request, subdomain);
  }
}

async function handlePlatformRouting(request) {
  const { pathname } = request.nextUrl;

  // Block subdomain-specific routes on platform domain
  if (pathname.startsWith('/s/') || pathname.startsWith('/tenant')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect root to dashboard if authenticated
  if (pathname === '/') {
    const token = request.cookies.get('crown_bidder_token');
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

async function handleSubdomainRouting(request, subdomain) {
  const { pathname } = request.nextUrl;

  try {
    // Resolve site by subdomain
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/sites/resolve?subdomain=${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Site not found for this subdomain
      return handleSiteNotFound(request, subdomain);
    }

    const { data } = await response.json();
    const site = data.site;

    // Check if subdomain is verified (subdomains are auto-verified)
    if (site.domainVerificationStatus !== 'verified') {
      return handleUnverifiedDomain(request, site);
    }

    // Rewrite to subdomain-specific route following Vercel pattern
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/s/${subdomain}${pathname}`;
    
    const rewriteResponse = NextResponse.rewrite(rewriteUrl);

    // Add tenant info to headers for components
    rewriteResponse.headers.set('x-tenant-id', site._id);
    rewriteResponse.headers.set('x-tenant-name', site.name);
    rewriteResponse.headers.set('x-tenant-subdomain', site.subdomain);
    rewriteResponse.headers.set('x-tenant-theme', site.settings?.theme || 'classic-blue');
    rewriteResponse.headers.set('x-tenant-primary-color', site.settings?.primaryColor || '#1e40af');
    rewriteResponse.headers.set('x-tenant-secondary-color', site.settings?.secondaryColor || '#64748b');
    rewriteResponse.headers.set('x-tenant-logo', site.settings?.logoUrl || '');

    return rewriteResponse;

  } catch (error) {
    console.error('Subdomain resolution error:', error);
    return handleSiteNotFound(request, subdomain);
  }
}

function handleSiteNotFound(request, subdomainOrDomain) {
  // If we're already on site-not-found page, don't redirect again
  if (request.nextUrl.pathname === '/site-not-found') {
    return NextResponse.next();
  }
  
  // Redirect to site-not-found page with domain parameter
  const url = new URL('/site-not-found', `${protocol}://${rootDomain}`);
  url.searchParams.set('domain', subdomainOrDomain);
  return NextResponse.redirect(url);
}

function handleUnverifiedDomain(request, site) {
  // Redirect to domain verification page on main platform
  const url = new URL(`/site/${site._id}/verify-domain`, `${protocol}://${rootDomain}`);
  return NextResponse.redirect(url);
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
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};