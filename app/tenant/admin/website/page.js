'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';

export default function WebsiteTab() {
  const { site, refreshSite } = useSite();
  const { theme, updateTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    customDomain: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#111827',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize form with site and theme data
  useEffect(() => {
    if (site) {
      setFormData(prev => ({
        ...prev,
        name: site.name || '',
        customDomain: site.customDomain || '',
      }));
    }
    if (theme) {
      setFormData(prev => ({
        ...prev,
        primaryColor: theme.primaryColor || '#3b82f6',
        secondaryColor: theme.secondaryColor || '#10b981',
        backgroundColor: theme.backgroundColor || '#ffffff',
        textColor: theme.textColor || '#111827',
      }));
    }
  }, [site, theme]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update site information
      if (site) {
        await api.sites.update(site._id, {
          name: formData.name,
          customDomain: formData.customDomain,
        });
      }

      // Update theme
      if (theme) {
        await updateTheme({
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
        });
      }

      await refreshSite();
      setMessage({ type: 'success', text: 'Website settings saved successfully!' });
    } catch (error) {
      console.error('Error saving website settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Website Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Customize your auction site's appearance and branding
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Site Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Site Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Auction Site"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Domain
            </label>
            <input
              type="text"
              value={formData.customDomain}
              onChange={(e) => handleInputChange('customDomain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="auctions.mycompany.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              Your site is accessible at: {site?.subdomain}.crownbidder.com
              {formData.customDomain && ` and ${formData.customDomain}`}
            </p>
          </div>
        </div>
      </Card>

      {/* Theme Customization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Theme & Branding
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Used for buttons and accents</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Used for secondary actions</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Main background color</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.textColor}
                onChange={(e) => handleInputChange('textColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.textColor}
                onChange={(e) => handleInputChange('textColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Primary text color</p>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-lg border border-gray-200" style={{ backgroundColor: formData.backgroundColor }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: formData.textColor }}>
            Preview
          </h4>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded text-white font-medium"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded text-white font-medium"
              style={{ backgroundColor: formData.secondaryColor }}
            >
              Secondary Button
            </button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          loading={isLoading}
          className="px-6"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
