'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const CATEGORY_LABELS = {
  modern: 'Modern',
  classic: 'Classic',
  minimal: 'Minimal',
  bold: 'Bold',
  elegant: 'Elegant',
};

const CATEGORY_DESCRIPTIONS = {
  modern: 'Contemporary designs with clean lines',
  classic: 'Timeless and sophisticated',
  minimal: 'Simple and content-focused',
  bold: 'Eye-catching and vibrant',
  elegant: 'Refined and luxurious',
};

export default function LayoutSelectionStep({ formData, updateFormData, errors }) {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.layouts.list();
      setLayouts(response.data.layouts || []);
    } catch (err) {
      setError(err.message || 'Failed to load layouts');
      console.error('Failed to fetch layouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLayoutSelect = (layout) => {
    updateFormData({
      layoutName: layout.name,
      selectedLayout: layout,
      primaryColor: layout.suggestedColors.primary,
      secondaryColor: layout.suggestedColors.secondary,
      accentColor: layout.suggestedColors.accent,
    });
  };

  const handleSkipLayout = () => {
    updateFormData({
      layoutName: null,
      selectedLayout: null,
    });
  };

  // Group layouts by category
  const layoutsByCategory = layouts.reduce((acc, layout) => {
    if (!acc[layout.category]) {
      acc[layout.category] = [];
    }
    acc[layout.category].push(layout);
    return acc;
  }, {});

  const categories = Object.keys(layoutsByCategory);
  const filteredLayouts = selectedCategory
    ? layoutsByCategory[selectedCategory] || []
    : layouts;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchLayouts}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Choose Your Site Layout
        </h3>
        <p className="text-sm text-gray-600">
          Select a precreated layout template or skip to customize later. Each layout includes a navbar,
          homepage, about page, listings page, results page, and contact page.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Layouts
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[category] || category}
            </button>
          ))}
        </div>
      )}

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLayouts.map((layout) => (
          <button
            key={layout.name}
            type="button"
            onClick={() => handleLayoutSelect(layout)}
            className={`
              text-left border-2 rounded-lg p-6 transition-all hover:shadow-lg
              ${formData.layoutName === layout.name
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
              }
            `}
          >
            {/* Layout Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {layout.displayName}
                </h4>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {CATEGORY_LABELS[layout.category] || layout.category}
                </span>
              </div>
              {formData.layoutName === layout.name && (
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {layout.description}
            </p>

            {/* Color Preview */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Suggested Colors:</p>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200"
                  style={{ backgroundColor: layout.suggestedColors.primary }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200"
                  style={{ backgroundColor: layout.suggestedColors.secondary }}
                  title="Secondary"
                />
                {layout.suggestedColors.accent && (
                  <div
                    className="w-8 h-8 rounded border-2 border-gray-200"
                    style={{ backgroundColor: layout.suggestedColors.accent }}
                    title="Accent"
                  />
                )}
              </div>
            </div>

            {/* Features */}
            {layout.features && layout.features.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {layout.features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600"
                    >
                      {feature.replace('-', ' ')}
                    </span>
                  ))}
                  {layout.features.length > 4 && (
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                      +{layout.features.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Skip Option */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={handleSkipLayout}
          className={`
            w-full py-3 px-4 border-2 border-dashed rounded-lg text-sm font-medium transition-colors
            ${!formData.layoutName
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }
          `}
        >
          Skip - I'll create my own pages later
        </button>
        {!formData.layoutName && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            Your site will be created without preconfigured pages
          </p>
        )}
      </div>

      {/* Selected Layout Info */}
      {formData.selectedLayout && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {formData.selectedLayout.displayName} selected
              </p>
              <p className="text-sm text-blue-700 mt-1">
                This layout will create: Home, About, Listings, Results, and Contact pages.
                You can customize colors in the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.layoutName && (
        <p className="text-sm text-red-600">{errors.layoutName}</p>
      )}
    </div>
  );
}
