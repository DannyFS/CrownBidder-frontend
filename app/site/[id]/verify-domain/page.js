'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DomainVerificationInstructions from '@/components/domain/DomainVerificationInstructions';
import VerificationStatusIndicator from '@/components/domain/VerificationStatusIndicator';
import api from '@/lib/api';
import { DOMAIN_VERIFICATION_STATUS } from '@/lib/constants';

export default function VerifyDomainPage() {
  const { id: siteId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/site/${siteId}/verify-domain`));
    }
  }, [isAuthenticated, router, siteId]);

  // Load site data
  useEffect(() => {
    if (!isAuthenticated || !siteId) return;

    const loadSite = async () => {
      try {
        setLoading(true);
        const response = await api.sites.get(siteId);
        setSite(response.data);
      } catch (error) {
        setError(error.message);
        console.error('Failed to load site:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [isAuthenticated, siteId]);

  // Start polling for verification status
  useEffect(() => {
    if (!site || site.domainVerificationStatus === DOMAIN_VERIFICATION_STATUS.VERIFIED) {
      return;
    }

    const pollVerificationStatus = async () => {
      try {
        const response = await api.sites.verifyDomain(siteId);
        const updatedSite = response.data;
        setSite(updatedSite);

        // Stop polling if verified or error
        if (updatedSite.domainVerificationStatus === DOMAIN_VERIFICATION_STATUS.VERIFIED ||
            updatedSite.domainVerificationStatus === DOMAIN_VERIFICATION_STATUS.ERROR) {
          if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
          }
        }
      } catch (error) {
        console.error('Verification check failed:', error);
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(pollVerificationStatus, 30000);
    setPollInterval(interval);

    // Initial check
    pollVerificationStatus();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [site?.domainVerificationStatus, siteId]);

  // Manual verification check
  const handleManualCheck = async () => {
    try {
      setChecking(true);
      const response = await api.sites.verifyDomain(siteId);
      setSite(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = () => {
    router.push(`/site/${siteId}/dashboard`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading site information...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Site
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'Site not found or you do not have access to it.'}
            </p>
            <Button onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isVerified = site.domainVerificationStatus === DOMAIN_VERIFICATION_STATUS.VERIFIED;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Domain Verification
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {site.customDomain ? (
              <>Configure DNS settings for <span className="font-medium">{site.customDomain}</span></>
            ) : (
              <>Your subdomain <span className="font-medium">{site.subdomain}.crownbidder.com</span> is ready to use</>
            )}
          </p>
        </div>

        {/* Verification Status */}
        <div className="mb-8">
          <VerificationStatusIndicator
            status={site.domainVerificationStatus}
            domain={site.customDomain || `${site.subdomain}.crownbidder.com`}
          />
        </div>

        {!isVerified && site.customDomain ? (
          <>
            {/* DNS Instructions for Custom Domain */}
            <div className="mb-8">
              <DomainVerificationInstructions
                domain={site.customDomain}
                vercelDomainId={site.vercelDomainId}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleManualCheck}
                loading={checking}
                className="min-w-[160px]"
              >
                Check Domain Status
              </Button>
              
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        ) : !isVerified && site.subdomain ? (
          <>
            {/* Subdomain Ready Message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Subdomain is Ready!
              </h2>
              <p className="text-gray-600 mb-6">
                Your auction site is live at{' '}
                <a 
                  href={`https://${site.subdomain}.crownbidder.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {site.subdomain}.crownbidder.com
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleContinue}
                className="min-w-[160px]"
              >
                Go to Site Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(`https://${site.subdomain}.crownbidder.com`, '_blank')}
              >
                View Live Site
              </Button>
            </div>
          </>
        ) : isVerified ? (
          /* Success State */
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Domain Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your auction site is now live at{' '}
                <a 
                  href={`https://${site.customDomain || `${site.subdomain}.crownbidder.com`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {site.customDomain || `${site.subdomain}.crownbidder.com`}
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleContinue}
                className="min-w-[160px]"
              >
                Go to Site Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(`https://${site.customDomain || `${site.subdomain}.crownbidder.com`}`, '_blank')}
              >
                View Live Site
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button onClick={handleContinue}>
              Continue to Dashboard
            </Button>
          </div>
        )}

        {/* Help Section - Only for custom domains */}
        {site.customDomain && !isVerified && (
          <div className="mt-12">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Need Help?
                </h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-900">Common Issues:</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>DNS changes can take 5-15 minutes to propagate globally</li>
                      <li>Make sure you're updating the correct domain (not a subdomain)</li>
                      <li>Remove any existing A or CNAME records for your domain first</li>
                      <li>Contact your domain provider if you're having trouble finding DNS settings</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Still Having Issues?</h4>
                    <p className="mt-1">
                      Contact our support team at{' '}
                      <a href="mailto:support@crownbidder.com" className="text-blue-600 hover:text-blue-500">
                        support@crownbidder.com
                      </a>{' '}
                      with your domain name and we'll help you get set up.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}