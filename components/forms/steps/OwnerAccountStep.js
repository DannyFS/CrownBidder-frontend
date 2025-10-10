'use client';

import { useState } from 'react';

export default function OwnerAccountStep({ formData, updateFormData, errors }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const levels = [
      { score: 0, text: '', color: '' },
      { score: 1, text: 'Very Weak', color: 'text-red-600' },
      { score: 2, text: 'Weak', color: 'text-orange-600' },
      { score: 3, text: 'Fair', color: 'text-yellow-600' },
      { score: 4, text: 'Good', color: 'text-blue-600' },
      { score: 5, text: 'Strong', color: 'text-green-600' },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(formData.ownerPassword);

  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Owner Email Address *
        </label>
        <input
          type="email"
          id="ownerEmail"
          value={formData.ownerEmail}
          onChange={(e) => handleChange('ownerEmail', e.target.value)}
          placeholder="admin@heritage-auctions.com"
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.ownerEmail ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
          `}
        />
        {errors.ownerEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.ownerEmail}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This will be your login email and primary contact for the site
        </p>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="ownerPassword"
            value={formData.ownerPassword}
            onChange={(e) => handleChange('ownerPassword', e.target.value)}
            placeholder="Create a secure password"
            className={`
              w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.ownerPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        {formData.ownerPassword && (
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Password strength:</span>
              <span className={`text-sm font-medium ${passwordStrength.color}`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength.score <= 1 ? 'bg-red-500' :
                  passwordStrength.score <= 2 ? 'bg-orange-500' :
                  passwordStrength.score <= 3 ? 'bg-yellow-500' :
                  passwordStrength.score <= 4 ? 'bg-blue-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {errors.ownerPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.ownerPassword}</p>
        )}
        
        <div className="mt-2 text-sm text-gray-500">
          <p>Password must include:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li className={formData.ownerPassword?.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
              At least 8 characters
            </li>
            <li className={/[a-z]/.test(formData.ownerPassword) ? 'text-green-600' : 'text-gray-500'}>
              One lowercase letter
            </li>
            <li className={/[A-Z]/.test(formData.ownerPassword) ? 'text-green-600' : 'text-gray-500'}>
              One uppercase letter
            </li>
            <li className={/\d/.test(formData.ownerPassword) ? 'text-green-600' : 'text-gray-500'}>
              One number
            </li>
          </ul>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            className={`
              w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        {formData.confirmPassword && formData.ownerPassword && (
          <p className={`mt-1 text-sm ${
            formData.ownerPassword === formData.confirmPassword 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formData.ownerPassword === formData.confirmPassword 
              ? '✓ Passwords match' 
              : '✗ Passwords do not match'
            }
          </p>
        )}
        
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Administrator Account
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                This account will have full administrative access to your auction site. You can create additional user accounts later from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {formData.siteName && formData.customDomain && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Site Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Site Name:</span>
              <span className="font-medium">{formData.siteName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Domain:</span>
              <span className="font-medium">{formData.customDomain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theme:</span>
              <span className="font-medium">{formData.selectedTheme || 'None selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admin Email:</span>
              <span className="font-medium">{formData.ownerEmail || 'Not set'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}