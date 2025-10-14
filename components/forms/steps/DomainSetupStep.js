'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function DomainSetupStep({ formData, updateFormData, errors }) {
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [domainType, setDomainType] = useState(formData.domainType || 'subdomain');

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
    
    // Reset availability checks when domain/subdomain changes
    if (field === 'customDomain') {
      setDomainAvailable(null);
    }
    if (field === 'subdomain') {
      setSubdomainAvailable(null);
    }
  };

  const handleDomainTypeChange = (type) => {
    setDomainType(type);
    updateFormData({ domainType: type });
    
    // Clear the other field when switching types
    if (type === 'custom') {
      updateFormData({ subdomain: '' });
      setSubdomainAvailable(null);
    } else {
      updateFormData({ customDomain: '' });
      setDomainAvailable(null);
    }
  };

  const checkDomainAvailability = async () => {
    if (!formData.customDomain || errors.customDomain) return;
    
    try {
      setCheckingDomain(true);
      // This would call your backend to check if domain is already taken
      // For now, we'll simulate the check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate domain availability check
      const taken = ['test.com', 'example.com', 'demo.com'].includes(formData.customDomain.toLowerCase());
      setDomainAvailable(!taken);
    } catch (error) {
      console.error('Domain check failed:', error);
    } finally {
      setCheckingDomain(false);
    }
  };

  const checkSubdomainAvailability = async () => {
    if (!formData.subdomain || errors.subdomain) return;
    
    try {
      setCheckingSubdomain(true);
      // This would call your backend to check if subdomain is already taken
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate subdomain availability check
      const taken = ['test', 'demo', 'admin', 'www', 'api'].includes(formData.subdomain.toLowerCase());
      setSubdomainAvailable(!taken);
    } catch (error) {
      console.error('Subdomain check failed:', error);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const generateSubdomain = () => {
    if (formData.siteName) {
      const subdomain = formData.siteName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
      handleChange('subdomain', subdomain);
    }
  };

  return (
    <div className="space-y-6">
      {/* Domain Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose your domain type *
        </label>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <input
                id="subdomain-option"
                type="radio"
                name="domainType"
                value="subdomain"
                checked={domainType === 'subdomain'}
                onChange={(e) => handleDomainTypeChange(e.target.value)}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div className="ml-3">
                <label htmlFor="subdomain-option" className="block text-sm font-medium text-gray-700">
                  CrownBidder subdomain (recommended)
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    FREE
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Use a free subdomain like yoursite.crownbidder.com. Perfect for getting started quickly with no additional costs.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <input
                id="custom-option"
                type="radio"
                name="domainType"
                value="custom"
                checked={domainType === 'custom'}
                onChange={(e) => handleDomainTypeChange(e.target.value)}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div className="ml-3">
                <label htmlFor="custom-option" className="block text-sm font-medium text-gray-700">
                  Custom domain
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Use a domain you've already purchased (like yoursite.com). You'll need to own the domain and update its DNS settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Domain Field */}
      {domainType === 'custom' && (
        <div>
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Domain *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="customDomain"
              value={formData.customDomain || ''}
              onChange={(e) => handleChange('customDomain', e.target.value.toLowerCase())}
              placeholder="heritage-auctions.com"
              className={`
                flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.customDomain ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
              `}
            />
            <Button
              type="button"
              variant="outline"
              onClick={checkDomainAvailability}
              disabled={checkingDomain || !formData.customDomain || !!errors.customDomain}
              loading={checkingDomain}
            >
              Check
            </Button>
          </div>
          
          {errors.customDomain && (
            <p className="mt-1 text-sm text-red-600">{errors.customDomain}</p>
          )}
          
          {domainAvailable !== null && !errors.customDomain && (
            <p className={`mt-1 text-sm ${domainAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {domainAvailable 
                ? '✓ Domain is available for use' 
                : '✗ Domain is already in use'
              }
            </p>
          )}
          
          <p className="mt-1 text-sm text-gray-500">
            Enter your domain without 'www' (e.g., heritage-auctions.com)
          </p>
        </div>
      )}

      {/* Subdomain Field */}
      {domainType === 'subdomain' && (
        <div>
          <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
            Subdomain *
          </label>
          <div className="flex space-x-2">
            <div className="flex-1 flex">
              <input
                type="text"
                id="subdomain"
                value={formData.subdomain || ''}
                onChange={(e) => handleChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="heritage"
                className={`
                  flex-1 px-3 py-2 border rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.subdomain ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
                `}
                maxLength={20}
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                .crownbidder.com
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={checkSubdomainAvailability}
              disabled={checkingSubdomain || !formData.subdomain || !!errors.subdomain}
              loading={checkingSubdomain}
            >
              Check
            </Button>
          </div>
          
          {errors.subdomain && (
            <p className="mt-1 text-sm text-red-600">{errors.subdomain}</p>
          )}
          
          {subdomainAvailable !== null && !errors.subdomain && (
            <p className={`mt-1 text-sm ${subdomainAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {subdomainAvailable 
                ? '✓ Subdomain is available' 
                : '✗ Subdomain is already taken'
              }
            </p>
          )}
          
          <div className="mt-2 flex items-center space-x-2">
            <p className="text-sm text-gray-500">
              Quick and easy setup - get started immediately
            </p>
            <Button
              type="button"
              variant="link"
              onClick={generateSubdomain}
              className="text-xs"
            >
              Auto-generate
            </Button>
          </div>
        </div>
      )}

      {/* Domain Setup Information */}
      {domainType === 'custom' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Custom Domain Setup Process
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">After creating your site, you'll need to:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Update your domain's DNS settings</li>
                  <li>Wait for DNS propagation (usually 5-10 minutes)</li>
                  <li>Verify domain ownership</li>
                  <li>SSL certificate will be automatically generated</li>
                </ol>
                <p className="mt-2">We'll provide detailed instructions for your DNS provider.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {domainType === 'subdomain' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Subdomain Benefits
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="space-y-1">
                  <li>• Instant setup - no DNS configuration needed</li>
                  <li>• Free SSL certificate automatically provided</li>
                  <li>• Get started immediately after site creation</li>
                  <li>• Can always add a custom domain later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms Agreement */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            className={`
              w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500
              ${errors.agreeToTerms ? 'border-red-300' : 'border-gray-300'}
            `}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
            I agree to the Terms of Service and Privacy Policy *
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-red-600">{errors.agreeToTerms}</p>
          )}
          <p className="text-gray-500 mt-1">
            By creating a site, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 underline" target="_blank">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline" target="_blank">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Preview */}
      {((domainType === 'custom' && formData.customDomain) || (domainType === 'subdomain' && formData.subdomain)) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Your Site URL</h3>
          <div className="text-sm">
            <div>
              <span className="font-medium text-gray-700">Site URL:</span>
              <span className="ml-2 text-blue-600">
                {domainType === 'custom' 
                  ? `https://${formData.customDomain}`
                  : `https://${formData.subdomain}.crownbidder.com`
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}