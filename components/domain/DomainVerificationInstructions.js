'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const DNS_PROVIDERS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    logo: '☁️',
    instructions: [
      'Log in to your Cloudflare dashboard',
      'Select your domain from the list',
      'Click on the "DNS" tab',
      'Add a new CNAME record',
      'Set the name to "@" or your domain name',
      'Set the target to "cname.vercel-dns.com"',
      'Set the proxy status to "DNS only" (gray cloud)',
      'Click "Save"'
    ]
  },
  {
    id: 'godaddy',
    name: 'GoDaddy',
    logo: '🌐',
    instructions: [
      'Log in to your GoDaddy account',
      'Go to "My Products" > "Domain Portfolio"',
      'Click "DNS" next to your domain',
      'Find the "Records" section',
      'Add a new CNAME record',
      'Set the name to "@"',
      'Set the value to "cname.vercel-dns.com"',
      'Click "Save"'
    ]
  },
  {
    id: 'namecheap',
    name: 'Namecheap',
    logo: '💰',
    instructions: [
      'Log in to your Namecheap account',
      'Go to "Domain List" and find your domain',
      'Click "Manage" next to your domain',
      'Go to the "Advanced DNS" tab',
      'Add a new CNAME record',
      'Set the host to "@"',
      'Set the value to "cname.vercel-dns.com"',
      'Click the checkmark to save'
    ]
  },
  {
    id: 'route53',
    name: 'Amazon Route 53',
    logo: '☁️',
    instructions: [
      'Open the Route 53 console in AWS',
      'Click "Hosted zones" in the navigation pane',
      'Select your domain',
      'Click "Create record"',
      'Leave the record name blank for root domain',
      'Select "CNAME" as the record type',
      'Set the value to "cname.vercel-dns.com"',
      'Click "Create records"'
    ]
  },
  {
    id: 'google-domains',
    name: 'Google Domains',
    logo: '🔍',
    instructions: [
      'Go to domains.google.com',
      'Select your domain',
      'Click "DNS" in the left sidebar',
      'Scroll down to "Custom resource records"',
      'Add a new CNAME record',
      'Leave the name field blank (for root domain)',
      'Set the data to "cname.vercel-dns.com"',
      'Click "Add"'
    ]
  }
];

export default function DomainVerificationInstructions({ domain, vercelDomainId }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const isApexDomain = !domain.includes('.');
  const recordType = isApexDomain ? 'A' : 'CNAME';
  const recordValue = isApexDomain ? '76.76.19.61' : 'cname.vercel-dns.com';

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* DNS Record Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            DNS Configuration Required
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Add this DNS record to your domain provider
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  You'll need to add a {recordType} record to your DNS settings to verify ownership of {domain}.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Type
                </label>
                <div className="flex items-center">
                  <code className="bg-white px-3 py-2 border border-gray-300 rounded text-sm font-mono flex-1">
                    {recordType}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(recordType, 'type')}
                    className="ml-2"
                  >
                    {copiedField === 'type' ? '✓' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name/Host
                </label>
                <div className="flex items-center">
                  <code className="bg-white px-3 py-2 border border-gray-300 rounded text-sm font-mono flex-1">
                    @ or {domain}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('@', 'name')}
                    className="ml-2"
                  >
                    {copiedField === 'name' ? '✓' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value/Target
                </label>
                <div className="flex items-center">
                  <code className="bg-white px-3 py-2 border border-gray-300 rounded text-sm font-mono flex-1 break-all">
                    {recordValue}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(recordValue, 'value')}
                    className="ml-2"
                  >
                    {copiedField === 'value' ? '✓' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>TTL:</strong> Use the default TTL value (usually 3600 seconds)</p>
              {recordType === 'CNAME' && (
                <p className="mt-1">
                  <strong>Note:</strong> Remove any existing A records for this domain first
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Provider-Specific Instructions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Provider-Specific Instructions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {DNS_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                className={`
                  p-3 text-center border rounded-lg transition-all hover:shadow-md
                  ${selectedProvider === provider.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-2xl mb-1">{provider.logo}</div>
                <div className="text-xs font-medium">{provider.name}</div>
              </button>
            ))}
          </div>

          {selectedProvider && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {DNS_PROVIDERS.find(p => p.id === selectedProvider)?.name} Instructions
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {DNS_PROVIDERS.find(p => p.id === selectedProvider)?.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          
          {!selectedProvider && (
            <p className="text-sm text-gray-600 text-center py-4">
              Select your DNS provider above to see specific instructions
            </p>
          )}
        </div>
      </Card>

      {/* General Instructions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            General Steps
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Access Your DNS Settings</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Log in to your domain provider's website and find the DNS or Domain management section.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Add the DNS Record</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Create a new {recordType} record with the values shown above.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Wait for Propagation</h4>
                <p className="text-sm text-gray-600 mt-1">
                  DNS changes typically take 5-15 minutes but can take up to 24 hours to propagate globally.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Verification & SSL</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Once verified, we'll automatically generate and install an SSL certificate for your domain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}