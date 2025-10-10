'use client';

import { formatCurrency } from '@/lib/utils';

const CATEGORY_LABELS = {
  'art': 'Art & Collectibles',
  'antiques': 'Antiques',
  'jewelry': 'Jewelry & Watches',
  'furniture': 'Furniture',
  'vehicles': 'Vehicles',
  'electronics': 'Electronics',
  'books': 'Books & Manuscripts',
  'sports': 'Sports Memorabilia',
  'real-estate': 'Real Estate',
  'other': 'Other',
};

const CONDITION_LABELS = {
  'excellent': 'Excellent',
  'very-good': 'Very Good',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
  'as-is': 'As-Is',
};

export default function ReviewAndCreate({ formData, errors }) {
  const getTotalStartingValue = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.startingBid) || 0), 0);
  };

  const getAuctionDuration = () => {
    if (!formData.startTime || !formData.endTime) return null;
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day(s) and ${diffHours % 24} hour(s)`;
    }
    return `${diffHours} hour(s)`;
  };

  return (
    <div className="space-y-6">
      {/* Auction Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Auction Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Title:</span>
                <span className="ml-2">{formData.title}</span>
              </div>
              <div>
                <span className="font-medium">Category:</span>
                <span className="ml-2">{CATEGORY_LABELS[formData.category] || formData.category}</span>
              </div>
              <div>
                <span className="font-medium">Items:</span>
                <span className="ml-2">{formData.items.length} item(s)</span>
              </div>
              <div>
                <span className="font-medium">Total Starting Value:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  {formatCurrency(getTotalStartingValue())}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Schedule</h3>
            <div className="space-y-2 text-sm">
              {formData.startTime && (
                <div>
                  <span className="font-medium">Starts:</span>
                  <span className="ml-2">{new Date(formData.startTime).toLocaleString()}</span>
                </div>
              )}
              {formData.endTime && (
                <div>
                  <span className="font-medium">Ends:</span>
                  <span className="ml-2">{new Date(formData.endTime).toLocaleString()}</span>
                </div>
              )}
              {getAuctionDuration() && (
                <div>
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2">{getAuctionDuration()}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Bid Increment:</span>
                <span className="ml-2">{formatCurrency(formData.bidIncrement)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {formData.description && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.description}</p>
          </div>
        )}
      </div>

      {/* Auction Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Auction Items</h2>
        
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </span>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Starting Bid:</span>
                      <div className="text-green-600 font-semibold">
                        {formatCurrency(parseFloat(item.startingBid))}
                      </div>
                    </div>
                    
                    {item.reserveEnabled && item.reservePrice && (
                      <div>
                        <span className="font-medium text-gray-700">Reserve:</span>
                        <div className="text-orange-600 font-semibold">
                          {formatCurrency(parseFloat(item.reservePrice))}
                        </div>
                      </div>
                    )}
                    
                    {item.category && (
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <div>{CATEGORY_LABELS[item.category] || item.category}</div>
                      </div>
                    )}
                    
                    {item.condition && (
                      <div>
                        <span className="font-medium text-gray-700">Condition:</span>
                        <div>{CONDITION_LABELS[item.condition] || item.condition}</div>
                      </div>
                    )}
                  </div>
                  
                  {(item.dimensions || item.weight) && (
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      {item.dimensions && (
                        <div>
                          <span className="font-medium text-gray-700">Dimensions:</span>
                          <div>{item.dimensions}</div>
                        </div>
                      )}
                      {item.weight && (
                        <div>
                          <span className="font-medium text-gray-700">Weight:</span>
                          <div>{item.weight}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Auction Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Bidding Rules</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${formData.requireRegistration ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>Registration Required: {formData.requireRegistration ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${formData.allowProxyBidding ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>Proxy Bidding: {formData.allowProxyBidding ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${formData.allowPhoneBidding ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>Phone Bidding: {formData.allowPhoneBidding ? 'Allowed' : 'Not Allowed'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Auction Extensions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${formData.autoExtend ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>
                  Auto-extend: {formData.autoExtend ? `${formData.autoExtendMinutes} minutes` : 'Disabled'}
                </span>
              </div>
              {formData.autoExtend && (
                <p className="text-xs text-gray-500 ml-4">
                  Auction will be extended by {formData.autoExtendMinutes} minutes if bids are placed near closing time
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {formData.termsConditions && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
          <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-md p-4">
            {formData.termsConditions}
          </div>
        </div>
      )}

      {/* Pre-launch Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Pre-launch Checklist</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Auction details completed</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{formData.items.length} auction item(s) added</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Schedule and settings configured</span>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">After Creation:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review auction details one final time</li>
              <li>• Upload high-quality images for each item</li>
              <li>• Promote your auction to potential bidders</li>
              <li>• Test the bidding interface before going live</li>
              <li>• Prepare for auction day logistics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Ready to Create Auction
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Once created, your auction will be saved as a draft. You can still edit details, 
                add images, and make changes before publishing it live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}