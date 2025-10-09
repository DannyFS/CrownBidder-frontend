// Extract hostname from URL or window
export function getHostname() {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return null;
}

// Check if current domain is main platform domain
export function isMainDomain() {
  const hostname = getHostname();
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost';
  return hostname === mainDomain || hostname?.startsWith('localhost');
}

// Get DNS record type for domain
export function getDNSRecordType(domain) {
  // Apex domain (no subdomain) needs A record
  // Subdomain (www, etc.) needs CNAME record
  const parts = domain.split('.');
  if (parts.length === 2) {
    return 'A';
  }
  return 'CNAME';
}

// Get DNS record instructions
export function getDNSInstructions(domain, recordType, value) {
  const isApex = recordType === 'A';

  return {
    recordType,
    name: isApex ? '@' : domain,
    value,
    ttl: 3600,
    instructions: {
      general: `Add a ${recordType} record to your DNS provider with the following details:`,
      steps: [
        `Log in to your DNS provider (e.g., GoDaddy, Cloudflare, Namecheap)`,
        `Navigate to DNS settings for ${domain}`,
        `Add a new ${recordType} record`,
        `Set the name/host to: ${isApex ? '@' : domain}`,
        `Set the value/target to: ${value}`,
        `Set TTL to: 3600 (or automatic)`,
        `Save the record`,
        `Wait for DNS propagation (5-30 minutes)`,
      ],
    },
  };
}

// Format domain for display
export function formatDomain(domain) {
  if (!domain) return '';
  return domain.toLowerCase().trim();
}

// Validate DNS propagation status
export async function checkDNSPropagation(domain) {
  try {
    // This would typically use a DNS lookup service
    // For now, we'll rely on the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/check?domain=${domain}`);
    const data = await response.json();
    return data.propagated;
  } catch (error) {
    console.error('DNS propagation check failed:', error);
    return false;
  }
}

// Get provider-specific DNS instructions
export function getProviderInstructions(provider) {
  const providers = {
    godaddy: {
      name: 'GoDaddy',
      url: 'https://dcc.godaddy.com/manage/dns',
      steps: [
        'Log in to your GoDaddy account',
        'Go to "My Products" and find your domain',
        'Click "DNS" button next to your domain',
        'Scroll down to "Records" section',
        'Click "Add" button',
        'Follow the DNS record instructions above',
      ],
    },
    cloudflare: {
      name: 'Cloudflare',
      url: 'https://dash.cloudflare.com',
      steps: [
        'Log in to your Cloudflare dashboard',
        'Select your domain',
        'Click "DNS" in the navigation menu',
        'Click "Add record" button',
        'Follow the DNS record instructions above',
        'Ensure the proxy status (orange cloud) is OFF',
      ],
    },
    namecheap: {
      name: 'Namecheap',
      url: 'https://ap.www.namecheap.com',
      steps: [
        'Log in to your Namecheap account',
        'Go to Domain List and click "Manage"',
        'Go to "Advanced DNS" tab',
        'Click "Add New Record" button',
        'Follow the DNS record instructions above',
      ],
    },
    google: {
      name: 'Google Domains',
      url: 'https://domains.google.com',
      steps: [
        'Log in to Google Domains',
        'Select your domain',
        'Click "DNS" in the left menu',
        'Scroll to "Custom resource records"',
        'Follow the DNS record instructions above',
      ],
    },
  };

  return providers[provider] || null;
}

// Parse domain from URL
export function parseDomainFromURL(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    return null;
  }
}

// Generate subdomain suggestion
export function generateSubdomainSuggestion(siteName) {
  return siteName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
}
