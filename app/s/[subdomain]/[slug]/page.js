import { notFound } from 'next/navigation';
import TenantLayout from '@/components/tenant/TenantLayout';
import DynamicPageClient from '@/components/page/DynamicPageClient';

async function getTenant(subdomain) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${apiUrl}/api/sites/resolve?subdomain=${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data.site;
  } catch (error) {
    console.error('Failed to load tenant:', error);
    return null;
  }
}

export default async function SubdomainDynamicPage({ params }) {
  const { subdomain, slug } = await params;
  const tenant = await getTenant(subdomain);

  if (!tenant) {
    notFound();
  }

  return (
    <TenantLayout tenant={tenant}>
      <DynamicPageClient pageSlug={slug} />
    </TenantLayout>
  );
}
