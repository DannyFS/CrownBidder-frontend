'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuctionCreationForm from '@/components/auctions/AuctionCreationForm';
import { Card } from '@/components/ui/Card';

export default function CreateAuctionPage() {
  const { id: siteId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/site/${siteId}/auctions/create`));
      return;
    }
    
    if (user && user.siteId !== siteId) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, siteId, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (user && user.siteId !== siteId) {
    return null;
  }

  const handleAuctionCreated = (auctionData) => {
    // Redirect to auction details page
    router.push(`/site/${siteId}/auctions/${auctionData._id}`);
  };

  const handleCancel = () => {
    router.push(`/site/${siteId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push(`/site/${siteId}/dashboard`)}
              className="hover:text-gray-700"
            >
              Dashboard
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Create Auction</span>
          </nav>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Auction
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Set up your auction with items, scheduling, and bidding rules
            </p>
          </div>
        </div>

        {/* Auction Creation Form */}
        <Card className="max-w-4xl mx-auto">
          <AuctionCreationForm
            siteId={siteId}
            onAuctionCreated={handleAuctionCreated}
            onCancel={handleCancel}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
          />
        </Card>
      </div>
    </div>
  );
}