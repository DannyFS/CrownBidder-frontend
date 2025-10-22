'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';

export default function EmailsTab() {
  const { site, refreshSite } = useSite();

  const [formData, setFormData] = useState({
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    emailNotifications: {
      newBid: true,
      outbid: true,
      auctionStart: true,
      auctionEnd: true,
      winnerNotification: true,
    },
    emailTemplates: {
      welcome: {
        subject: 'Welcome to {{siteName}}',
        body: 'Hi {{userName}},\n\nWelcome to {{siteName}}! We\'re excited to have you join our auction platform.\n\nBest regards,\n{{siteName}} Team',
      },
      bidConfirmation: {
        subject: 'Bid Confirmation - {{auctionName}}',
        body: 'Hi {{userName}},\n\nYour bid of ${{bidAmount}} on "{{itemName}}" has been placed successfully.\n\nAuction: {{auctionName}}\nItem: {{itemName}}\nYour Bid: ${{bidAmount}}\n\nGood luck!\n\n{{siteName}} Team',
      },
      outbid: {
        subject: 'You\'ve Been Outbid - {{auctionName}}',
        body: 'Hi {{userName}},\n\nYou have been outbid on "{{itemName}}".\n\nAuction: {{auctionName}}\nItem: {{itemName}}\nYour Bid: ${{yourBid}}\nCurrent Bid: ${{currentBid}}\n\nPlace a new bid to stay in the running!\n\n{{siteName}} Team',
      },
      winner: {
        subject: 'Congratulations! You Won - {{auctionName}}',
        body: 'Hi {{userName}},\n\nCongratulations! You are the winning bidder for "{{itemName}}".\n\nAuction: {{auctionName}}\nItem: {{itemName}}\nWinning Bid: ${{winningBid}}\n\nWe will contact you shortly with next steps.\n\n{{siteName}} Team',
      },
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');

  // Initialize form with site data
  useEffect(() => {
    if (site?.emailSettings) {
      setFormData({
        fromEmail: site.emailSettings.fromEmail || '',
        fromName: site.emailSettings.fromName || '',
        replyToEmail: site.emailSettings.replyToEmail || '',
        emailNotifications: {
          ...formData.emailNotifications,
          ...site.emailSettings.emailNotifications,
        },
        emailTemplates: {
          ...formData.emailTemplates,
          ...site.emailSettings.emailTemplates,
        },
      });
    }
  }, [site]);

  const handleInputChange = (field, value) => {
    if (field.startsWith('emailNotifications.')) {
      const notificationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emailNotifications: {
          ...prev.emailNotifications,
          [notificationField]: value,
        },
      }));
    } else if (field.startsWith('template.')) {
      const [, templateName, templateField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        emailTemplates: {
          ...prev.emailTemplates,
          [templateName]: {
            ...prev.emailTemplates[templateName],
            [templateField]: value,
          },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.sites.update(site._id, {
        emailSettings: formData,
      });

      await refreshSite();
      setMessage({ type: 'success', text: 'Email settings saved successfully!' });
    } catch (error) {
      console.error('Error saving email settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save email settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const templateOptions = [
    { id: 'welcome', label: 'Welcome Email' },
    { id: 'bidConfirmation', label: 'Bid Confirmation' },
    { id: 'outbid', label: 'Outbid Notification' },
    { id: 'winner', label: 'Winner Notification' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure email notifications and templates for your auction site
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

      {/* Email Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Email Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Email
            </label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => handleInputChange('fromEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="noreply@yoursite.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email address that notifications will be sent from
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Name
            </label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => handleInputChange('fromName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Auction Site"
            />
            <p className="mt-1 text-sm text-gray-500">
              Name displayed in email "From" field
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reply-To Email
            </label>
            <input
              type="email"
              value={formData.replyToEmail}
              onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="support@yoursite.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email address for user replies
            </p>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Settings
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications.newBid}
              onChange={(e) =>
                handleInputChange('emailNotifications.newBid', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send confirmation email when a bid is placed
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications.outbid}
              onChange={(e) =>
                handleInputChange('emailNotifications.outbid', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Notify bidders when they've been outbid
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications.auctionStart}
              onChange={(e) =>
                handleInputChange('emailNotifications.auctionStart', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send reminder when auction starts
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications.auctionEnd}
              onChange={(e) =>
                handleInputChange('emailNotifications.auctionEnd', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send notification when auction ends
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications.winnerNotification}
              onChange={(e) =>
                handleInputChange(
                  'emailNotifications.winnerNotification',
                  e.target.checked
                )
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send congratulations email to auction winners
            </span>
          </label>
        </div>
      </Card>

      {/* Email Templates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Email Templates
        </h3>

        {/* Template Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {templateOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Template Editor */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={formData.emailTemplates[selectedTemplate]?.subject || ''}
              onChange={(e) =>
                handleInputChange(
                  `template.${selectedTemplate}.subject`,
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email subject line..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <textarea
              value={formData.emailTemplates[selectedTemplate]?.body || ''}
              onChange={(e) =>
                handleInputChange(
                  `template.${selectedTemplate}.body`,
                  e.target.value
                )
              }
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Email body..."
            />
          </div>

          {/* Available Variables */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Available Variables
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div><code className="bg-blue-100 px-1 rounded">{'{{siteName}}'}</code> - Your site name</div>
              <div><code className="bg-blue-100 px-1 rounded">{'{{userName}}'}</code> - User's name</div>
              <div><code className="bg-blue-100 px-1 rounded">{'{{auctionName}}'}</code> - Auction name</div>
              <div><code className="bg-blue-100 px-1 rounded">{'{{itemName}}'}</code> - Item name</div>
              <div><code className="bg-blue-100 px-1 rounded">{'{{bidAmount}}'}</code> - Bid amount</div>
            </div>
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
