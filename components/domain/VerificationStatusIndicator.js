'use client';

import { DOMAIN_VERIFICATION_STATUS } from '@/lib/constants';

const statusConfig = {
  [DOMAIN_VERIFICATION_STATUS.PENDING]: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Verification Pending',
    description: 'Waiting for DNS records to be configured and propagated',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    descColor: 'text-yellow-700',
    pulse: true,
  },
  [DOMAIN_VERIFICATION_STATUS.VERIFIED]: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Domain Verified',
    description: 'Your domain is successfully configured and SSL certificate is active',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    descColor: 'text-green-700',
    pulse: false,
  },
  [DOMAIN_VERIFICATION_STATUS.ERROR]: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    title: 'Verification Failed',
    description: 'Unable to verify domain configuration. Please check your DNS settings.',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    descColor: 'text-red-700',
    pulse: false,
  },
  [DOMAIN_VERIFICATION_STATUS.TIMEOUT]: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Verification Timeout',
    description: 'Verification is taking longer than expected. DNS changes can take up to 24 hours.',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800',
    descColor: 'text-orange-700',
    pulse: false,
  },
};

export default function VerificationStatusIndicator({ status, domain }) {
  const config = statusConfig[status] || statusConfig[DOMAIN_VERIFICATION_STATUS.PENDING];

  return (
    <div className={`
      rounded-lg border p-4 ${config.bgColor} ${config.borderColor}
      ${config.pulse ? 'animate-pulse' : ''}
    `}>
      <div className="flex items-start">
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${config.pulse ? 'animate-pulse' : ''}
          ${config.bgColor === 'bg-yellow-50' ? 'bg-yellow-100' : 
            config.bgColor === 'bg-green-50' ? 'bg-green-100' :
            config.bgColor === 'bg-red-50' ? 'bg-red-100' : 'bg-orange-100'}
        `}>
          <div className={config.iconColor}>
            {config.icon}
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.titleColor}`}>
            {config.title}
          </h3>
          <p className={`mt-1 text-sm ${config.descColor}`}>
            {config.description}
          </p>
          
          {status === DOMAIN_VERIFICATION_STATUS.PENDING && (
            <div className="mt-3">
              <div className="flex items-center">
                <div className="flex-1 bg-yellow-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <span className="ml-3 text-xs text-yellow-700 font-medium">
                  Checking...
                </span>
              </div>
            </div>
          )}
          
          {status === DOMAIN_VERIFICATION_STATUS.VERIFIED && (
            <div className="mt-2 flex items-center text-sm">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700">
                SSL certificate active
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Details */}
      <div className="mt-4 pt-3 border-t border-opacity-20 border-gray-400">
        <div className="flex items-center justify-between text-xs">
          <span className={config.descColor}>Domain: {domain}</span>
          <span className={config.descColor}>
            Status: {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}