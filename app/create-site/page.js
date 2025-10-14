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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/create-site');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSiteCreated = (siteData) => {
    console.log('Site created successfully:', siteData);
    
    // Safely access the site ID
    const siteId = siteData?.site?._id || siteData?._id;
    
    if (!siteId) {
      console.error('No site ID found in response:', siteData);
      setErrors({ submit: 'Site created but missing ID. Please contact support.' });
      return;
    }
    
    // Redirect to domain verification page
    try {
      router.push(`/site/${String(siteId)}/verify-domain`);
    } catch (routerError) {
      console.error('Router error:', routerError);
      // Fallback to dashboard if routing fails
      router.push('/dashboard');
    }
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