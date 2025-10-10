'use client';

import { useState, useEffect } from 'react';

export default function SchedulingSettings({ formData, updateFormData, errors }) {
  const [localDateTime, setLocalDateTime] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  // Convert formData datetime strings to local date/time inputs
  useEffect(() => {
    if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      setLocalDateTime(prev => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
      }));
    }
    if (formData.endTime) {
      const endDate = new Date(formData.endTime);
      setLocalDateTime(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
      }));
    }
  }, [formData.startTime, formData.endTime]);

  const handleDateTimeChange = (field, value) => {
    const newLocalDateTime = { ...localDateTime, [field]: value };
    setLocalDateTime(newLocalDateTime);

    // Convert to ISO string for formData
    if (field.includes('start') && newLocalDateTime.startDate && newLocalDateTime.startTime) {
      const startDateTime = new Date(`${newLocalDateTime.startDate}T${newLocalDateTime.startTime}`);
      updateFormData({ startTime: startDateTime.toISOString() });
    }
    
    if (field.includes('end') && newLocalDateTime.endDate && newLocalDateTime.endTime) {
      const endDateTime = new Date(`${newLocalDateTime.endDate}T${newLocalDateTime.endTime}`);
      updateFormData({ endTime: endDateTime.toISOString() });
    }
  };

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Calculate auction duration
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

  // Get next suggested times
  const getSuggestedTimes = () => {
    const now = new Date();
    const suggestions = [
      { label: 'Tomorrow 10:00 AM', hours: 24 + (10 - now.getHours()) },
      { label: 'This Weekend 2:00 PM', hours: (6 - now.getDay()) * 24 + (14 - now.getHours()) },
      { label: 'Next Week 7:00 PM', hours: (7 - now.getDay() + 7) * 24 + (19 - now.getHours()) },
    ];
    
    return suggestions.map(s => {
      const future = new Date(now.getTime() + s.hours * 60 * 60 * 1000);
      return {
        ...s,
        date: future.toISOString().split('T')[0],
        time: future.toTimeString().slice(0, 5),
      };
    });
  };

  const applySuggestedTime = (suggestion) => {
    setLocalDateTime(prev => ({
      ...prev,
      startDate: suggestion.date,
      startTime: suggestion.time,
    }));
    
    const startDateTime = new Date(`${suggestion.date}T${suggestion.time}`);
    updateFormData({ startTime: startDateTime.toISOString() });
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Suggestions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Start Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {getSuggestedTimes().map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applySuggestedTime(suggestion)}
              className="text-left p-2 text-sm border border-gray-200 rounded-md hover:bg-white hover:border-blue-300 transition-colors"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Date & Time */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Auction Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={localDateTime.startDate}
              onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={localDateTime.startTime}
              onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
        
        {errors.startTime && (
          <p className="text-sm text-red-600 mt-1">{errors.startTime}</p>
        )}
      </div>

      {/* End Date & Time */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={localDateTime.endDate}
              onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
              min={localDateTime.startDate || new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="time"
              value={localDateTime.endTime}
              onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
        
        {errors.endTime && (
          <p className="text-sm text-red-600 mt-1">{errors.endTime}</p>
        )}
        
        {getAuctionDuration() && (
          <p className="text-sm text-gray-600 mt-2">
            Duration: {getAuctionDuration()}
          </p>
        )}
      </div>

      {/* Bidding Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bidding Settings</h3>
        
        <div className="space-y-4">
          {/* Bid Increment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Bid Increment ($) *
            </label>
            <input
              type="number"
              value={formData.bidIncrement}
              onChange={(e) => handleInputChange('bidIncrement', parseFloat(e.target.value) || 0)}
              placeholder="5.00"
              min="0.01"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.bidIncrement ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.bidIncrement && (
              <p className="text-sm text-red-600 mt-1">{errors.bidIncrement}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Minimum amount each bid must increase by
            </p>
          </div>

          {/* Auto-Extend */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="autoExtend"
                checked={formData.autoExtend}
                onChange={(e) => handleInputChange('autoExtend', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoExtend" className="text-sm font-medium text-gray-700">
                Auto-extend auction when bids are placed near closing
              </label>
            </div>
            
            {formData.autoExtend && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extension time (minutes)
                </label>
                <select
                  value={formData.autoExtendMinutes}
                  onChange={(e) => handleInputChange('autoExtendMinutes', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 minute</option>
                  <option value={2}>2 minutes</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  If a bid is placed within this timeframe before closing, the auction will be extended by this amount
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auction Access Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Access & Participation</h3>
        
        <div className="space-y-4">
          {/* Registration Required */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requireRegistration"
              checked={formData.requireRegistration}
              onChange={(e) => handleInputChange('requireRegistration', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requireRegistration" className="text-sm font-medium text-gray-700">
              Require bidder registration
            </label>
          </div>

          {/* Proxy Bidding */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowProxyBidding"
              checked={formData.allowProxyBidding}
              onChange={(e) => handleInputChange('allowProxyBidding', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowProxyBidding" className="text-sm font-medium text-gray-700">
              Allow proxy bidding (automatic bidding up to a maximum)
            </label>
          </div>

          {/* Phone Bidding */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowPhoneBidding"
              checked={formData.allowPhoneBidding}
              onChange={(e) => handleInputChange('allowPhoneBidding', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowPhoneBidding" className="text-sm font-medium text-gray-700">
              Allow phone bidding (require staff assistance)
            </label>
          </div>
        </div>
      </div>

      {/* Schedule Summary */}
      {formData.startTime && formData.endTime && (
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Schedule Summary</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              <strong>Starts:</strong> {new Date(formData.startTime).toLocaleString()}
            </p>
            <p>
              <strong>Ends:</strong> {new Date(formData.endTime).toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {getAuctionDuration()}
            </p>
            <p>
              <strong>Bid increment:</strong> ${formData.bidIncrement}
            </p>
            {formData.autoExtend && (
              <p>
                <strong>Auto-extend:</strong> {formData.autoExtendMinutes} minutes when bids placed near close
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}