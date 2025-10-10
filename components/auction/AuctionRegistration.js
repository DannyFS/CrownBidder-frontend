'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AuctionRegistration({ 
  auction, 
  isRegistered, 
  onRegistrationUpdate 
}) {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    paddleNumber: '',
    creditCardOnFile: false,
    agreeToTerms: false,
    bidderNotes: '',
  });

  const handleInputChange = (field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (error) {
      setError(null);
    }
  };

  const handleRegister = async () => {
    if (!registrationData.agreeToTerms) {
      setError('You must agree to the auction terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.auctions.register(auction._id, {
        ...registrationData,
        userId: user.id,
      });

      if (onRegistrationUpdate) {
        onRegistrationUpdate(true, response.data);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register for auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('Are you sure you want to withdraw from this auction?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.auctions.unregister(auction._id);
      
      if (onRegistrationUpdate) {
        onRegistrationUpdate(false);
      }
    } catch (error) {
      console.error('Unregistration error:', error);
      setError(error.response?.data?.message || 'Failed to withdraw from auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Required</h3>
          <p className="text-gray-600 mb-4">
            You must be logged in to register for this auction.
          </p>
          <div className="space-x-3">
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/register'}>
              Create Account
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isRegistered) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-gray-900">Registered for Auction</h3>
            </div>
            <p className="text-gray-600">
              You are registered and approved to bid in this auction.
            </p>
            <div className="mt-4 text-sm text-gray-700">
              <p><strong>Registered as:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              {registrationData.paddleNumber && (
                <p><strong>Paddle Number:</strong> {registrationData.paddleNumber}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleUnregister}
            disabled={isSubmitting}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Withdraw
          </Button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Register for Auction</h3>
        <p className="text-gray-600">
          Complete your registration to participate in this auction.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Auction Details Summary */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Auction Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Start Time:</span>
            <div className="font-medium">{formatDate(auction.startTime)}</div>
          </div>
          <div>
            <span className="text-gray-600">End Time:</span>
            <div className="font-medium">{formatDate(auction.endTime)}</div>
          </div>
          <div>
            <span className="text-gray-600">Items:</span>
            <div className="font-medium">{auction.items?.length || 0} lots</div>
          </div>
          <div>
            <span className="text-gray-600">Bid Increment:</span>
            <div className="font-medium">{formatCurrency(auction.settings?.bidIncrement || 5)}</div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="space-y-6">
        {/* Bidder Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Bidder Information</h4>
          <div className="bg-gray-50 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <div className="font-medium">{user.email}</div>
              </div>
              {user.phone && (
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <div className="font-medium">{user.phone}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paddle Number (Optional) */}
        <div>
          <label htmlFor="paddleNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Paddle Number (Optional)
          </label>
          <input
            type="text"
            id="paddleNumber"
            value={registrationData.paddleNumber}
            onChange={(e) => handleInputChange('paddleNumber', e.target.value)}
            placeholder="e.g., 123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500 mt-1">
            Request a specific paddle number. Subject to availability.
          </p>
        </div>

        {/* Payment Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
          <div className="flex items-start">
            <input
              type="checkbox"
              id="creditCardOnFile"
              checked={registrationData.creditCardOnFile}
              onChange={(e) => handleInputChange('creditCardOnFile', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="creditCardOnFile" className="ml-2 text-sm text-gray-700">
              I have a valid credit card on file for payment processing
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            A valid payment method is required to participate in bidding. You can add or update your payment method in your account settings.
          </p>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="bidderNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="bidderNotes"
            value={registrationData.bidderNotes}
            onChange={(e) => handleInputChange('bidderNotes', e.target.value)}
            placeholder="Any special requests or notes for the auctioneer..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {registrationData.bidderNotes.length}/500 characters
          </p>
        </div>

        {/* Terms and Conditions */}
        <div>
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={registrationData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
              I agree to the auction terms and conditions, bidding rules, and understand that all bids are binding commitments to purchase.
            </label>
          </div>
          
          {auction.termsConditions && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-600 whitespace-pre-wrap">
                {auction.termsConditions}
              </p>
            </div>
          )}
        </div>

        {/* Registration Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleRegister}
            disabled={isSubmitting || !registrationData.agreeToTerms}
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Registration is free. You will only be charged if you win items.
          </p>
        </div>
      </div>
    </Card>
  );
}