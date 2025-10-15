'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const THEMES = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    primaryColor: '#1e40af',
    secondaryColor: '#64748b',
    preview: 'Professional and trustworthy',
  },
  {
    id: 'elegant-gray',
    name: 'Elegant Gray',
    primaryColor: '#374151',
    secondaryColor: '#9ca3af',
    preview: 'Sophisticated and modern',
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    primaryColor: '#d97706',
    secondaryColor: '#78350f',
    preview: 'Premium and exclusive',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primaryColor: '#059669',
    secondaryColor: '#6b7280',
    preview: 'Natural and established',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    primaryColor: '#7c3aed',
    secondaryColor: '#6b7280',
    preview: 'Creative and distinctive',
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    primaryColor: '#dc2626',
    secondaryColor: '#6b7280',
    preview: 'Bold and energetic',
  },
];

export default function BrandingStep({ formData, updateFormData, errors }) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(formData.logoUrl || null);
  const fileInputRef = useRef(null);

  // Check if a layout was selected
  const hasLayout = formData.layoutName && formData.selectedLayout;

  const handleThemeSelect = (theme) => {
    updateFormData({
      selectedTheme: theme.id,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
    });
  };

  const handleColorChange = (colorType, value) => {
    updateFormData({ [colorType]: value });
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert('Logo file must be less than 2MB');
      return;
    }

    try {
      setUploadingLogo(true);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Upload to server (this would typically upload to your backend)
      // For now, we'll just store the preview URL
      updateFormData({ logoUrl: previewUrl });
      
    } catch (error) {
      console.error('Logo upload failed:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateFormData({ logoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedTheme = THEMES.find(theme => theme.id === formData.selectedTheme);

  return (
    <div className="space-y-8">
      {/* Layout Info Banner */}
      {hasLayout && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Layout: {formData.selectedLayout.displayName}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Customize the colors for your selected layout. You can add a logo and fine-tune your branding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Logo (Optional)
        </label>
        
        <div className="flex items-center space-x-4">
          {logoPreview ? (
            <div className="relative">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
            >
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
            </Button>
            <p className="mt-1 text-sm text-gray-500">
              PNG or JPG, max 2MB. Recommended: 400x400px
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selection - Only show if no layout selected */}
      {!hasLayout && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choose a Theme *
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeSelect(theme)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                  ${formData.selectedTheme === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                  <span className="font-medium text-gray-900">{theme.name}</span>
                </div>
                <p className="text-sm text-gray-600">{theme.preview}</p>
              </button>
            ))}
          </div>

          {errors.selectedTheme && (
            <p className="mt-2 text-sm text-red-600">{errors.selectedTheme}</p>
          )}
        </div>
      )}

      {/* Custom Colors */}
      {(selectedTheme || hasLayout) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {hasLayout ? 'Customize Layout Colors' : 'Custom Colors (Optional)'}
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor || (hasLayout ? formData.selectedLayout.suggestedColors.primary : selectedTheme?.primaryColor)}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor || (hasLayout ? formData.selectedLayout.suggestedColors.primary : selectedTheme?.primaryColor)}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  placeholder="#1e40af"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondaryColor || (hasLayout ? formData.selectedLayout.suggestedColors.secondary : selectedTheme?.secondaryColor)}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor || (hasLayout ? formData.selectedLayout.suggestedColors.secondary : selectedTheme?.secondaryColor)}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  placeholder="#64748b"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {hasLayout && formData.selectedLayout.suggestedColors.accent && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.accentColor || formData.selectedLayout.suggestedColors.accent}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor || formData.selectedLayout.suggestedColors.accent}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Colors will be applied to buttons, links, and other branded elements
          </p>
        </div>
      )}

      {/* Theme Preview */}
      {(selectedTheme || hasLayout) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <div
            className="bg-white rounded-lg shadow-sm p-6 border"
            style={{
              '--primary-color': formData.primaryColor || (hasLayout ? formData.selectedLayout.suggestedColors.primary : selectedTheme?.primaryColor),
              '--secondary-color': formData.secondaryColor || (hasLayout ? formData.selectedLayout.suggestedColors.secondary : selectedTheme?.secondaryColor),
            }}
          >
            <div className="flex items-center justify-between mb-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-8 w-auto" />
              ) : (
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              )}
              <nav className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Auctions</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              </nav>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
              {formData.siteName || 'Your Auction House'}
            </h1>
            <p className="text-gray-600 mb-4">
              {formData.description || 'Professional auction services'}
            </p>
            <button
              className="px-4 py-2 rounded text-white font-medium"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              View Current Auctions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}