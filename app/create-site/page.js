'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SiteCreationWizard from '@/components/forms/SiteCreationWizard';
import { Card } from '@/components/ui/Card';

export default function CreateSitePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/create-site');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSiteCreated = (siteData) => {
    // Redirect to domain verification page
    router.push(`/site/${siteData.site._id}/verify-domain`);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Auction Site
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Set up your professional auction platform in just a few steps
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <SiteCreationWizard
            onSiteCreated={handleSiteCreated}
            onCancel={handleCancel}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
          />
        </Card>
      </div>
    </div>
  );
}