'use client';

import { useState } from 'react';

const AUCTION_CATEGORIES = [
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'antiques', label: 'Antiques' },
  { value: 'jewelry', label: 'Jewelry & Watches' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books & Manuscripts' },
  { value: 'sports', label: 'Sports Memorabilia' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

export default function BasicAuctionDetails({ formData, updateFormData, errors }) {
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Auction Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Auction Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter a descriptive title for your auction"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.title.length}/100 characters
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a detailed description of the auction, including information about the items, condition, provenance, and any other relevant details that bidders should know."
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.description.length}/2000 characters
          </p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.category ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {AUCTION_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-600 mt-1">{errors.category}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700 mb-2">
          Terms & Conditions
        </label>
        <textarea
          id="termsConditions"
          value={formData.termsConditions}
          onChange={(e) => handleInputChange('termsConditions', e.target.value)}
          placeholder="Enter specific terms and conditions for this auction (payment terms, pickup instructions, buyer's premium, etc.). General site terms will also apply."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={1000}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.termsConditions.length}/1000 characters
        </p>
      </div>

      {/* Auction Settings Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Auction Settings Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Registration Required:</span>
            <span className="ml-2 font-medium">
              {formData.requireRegistration ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Proxy Bidding:</span>
            <span className="ml-2 font-medium">
              {formData.allowProxyBidding ? 'Allowed' : 'Not Allowed'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Phone Bidding:</span>
            <span className="ml-2 font-medium">
              {formData.allowPhoneBidding ? 'Allowed' : 'Not Allowed'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Auto Extend:</span>
            <span className="ml-2 font-medium">
              {formData.autoExtend ? `${formData.autoExtendMinutes} minutes` : 'Disabled'}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          You can modify these settings in the Scheduling step
        </p>
      </div>
    </div>
  );
}