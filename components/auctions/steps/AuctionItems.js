'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const ITEM_CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'very-good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'as-is', label: 'As-Is' },
];

const ITEM_CATEGORIES = [
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'antiques', label: 'Antiques' },
  { value: 'jewelry', label: 'Jewelry & Watches' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books & Manuscripts' },
  { value: 'sports', label: 'Sports Memorabilia' },
  { value: 'other', label: 'Other' },
];

export default function AuctionItems({ formData, updateFormData, errors, siteId }) {
  const [expandedItem, setExpandedItem] = useState(null);

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      startingBid: '',
      reserveEnabled: false,
      reservePrice: '',
      imageUrls: [],
      category: '',
      condition: '',
      dimensions: '',
      weight: '',
    };
    
    updateFormData({ 
      items: [...formData.items, newItem] 
    });
    setExpandedItem(formData.items.length);
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    updateFormData({ items: newItems });
    if (expandedItem === index) {
      setExpandedItem(null);
    } else if (expandedItem > index) {
      setExpandedItem(expandedItem - 1);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateFormData({ items: newItems });
  };

  const moveItem = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.items.length - 1)
    ) {
      return;
    }

    const newItems = [...formData.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    updateFormData({ items: newItems });
    setExpandedItem(targetIndex);
  };

  return (
    <div className="space-y-6">
      {/* Items List */}
      <div className="space-y-4">
        {formData.items.map((item, index) => (
          <div key={item.id} className="border border-gray-200 rounded-lg">
            {/* Item Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.title || `Item ${index + 1}`}
                  </h3>
                  {item.startingBid && (
                    <p className="text-sm text-gray-600">
                      Starting bid: ${parseFloat(item.startingBid).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Move buttons */}
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === formData.items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Expand/Collapse */}
                <button
                  type="button"
                  onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className={`w-4 h-4 transform ${expandedItem === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Item Details (Expandable) */}
            {expandedItem === index && (
              <div className="p-4 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Title *
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      placeholder="Enter item title"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`item_${index}_title`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[`item_${index}_title`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_title`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Bid * ($)
                    </label>
                    <input
                      type="number"
                      value={item.startingBid}
                      onChange={(e) => updateItem(index, 'startingBid', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`item_${index}_startingBid`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[`item_${index}_startingBid`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_startingBid`]}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Detailed description of the item..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category and Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      {ITEM_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={item.condition}
                      onChange={(e) => updateItem(index, 'condition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select condition</option>
                      {ITEM_CONDITIONS.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reserve Price */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id={`reserve-${index}`}
                      checked={item.reserveEnabled}
                      onChange={(e) => updateItem(index, 'reserveEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`reserve-${index}`} className="text-sm font-medium text-gray-700">
                      Set Reserve Price
                    </label>
                  </div>
                  {item.reserveEnabled && (
                    <input
                      type="number"
                      value={item.reservePrice}
                      onChange={(e) => updateItem(index, 'reservePrice', e.target.value)}
                      placeholder="Reserve price ($)"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                {/* Physical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={item.dimensions}
                      onChange={(e) => updateItem(index, 'dimensions', e.target.value)}
                      placeholder="e.g., 24 x 18 x 6 inches"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', e.target.value)}
                      placeholder="e.g., 5 lbs"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Image Upload Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Image upload functionality coming soon</p>
                    <p className="text-xs text-gray-500">Will support multiple images per item</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Another Item</span>
        </Button>
      </div>

      {/* Items Summary */}
      {formData.items.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Items Summary</h3>
          <div className="text-sm text-blue-800">
            <p>{formData.items.length} item(s) added</p>
            <p>
              Total starting value: $
              {formData.items
                .reduce((sum, item) => sum + (parseFloat(item.startingBid) || 0), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Error for no items */}
      {errors.items && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.items}</p>
        </div>
      )}
    </div>
  );
}