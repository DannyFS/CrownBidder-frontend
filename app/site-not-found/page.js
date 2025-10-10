'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SiteNotFoundPage() {
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Site Not Found
          </h1>
          
          <p className="text-gray-600 mb-6">
            {domain ? (
              <>
                The domain <strong>{domain}</strong> is not configured for any auction site on Crown Bidder.
              </>
            ) : (
              'This domain is not configured for any auction site.'
            )}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Are you looking for Crown Bidder?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Crown Bidder is a platform that lets you create your own auction site with a custom domain.
            </p>
            <Link href="https://crownbidder.com">
              <Button size="sm" className="w-full">
                Visit Crown Bidder Platform
              </Button>
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Do you own this domain?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              If you're trying to set up an auction site for this domain, you can create one on Crown Bidder.
            </p>
            <Link href="https://crownbidder.com/create-site">
              <Button variant="outline" size="sm" className="w-full">
                Create an Auction Site
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <a 
              href="https://crownbidder.com" 
              className="text-blue-600 hover:text-blue-500 underline"
            >
              Crown Bidder
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}