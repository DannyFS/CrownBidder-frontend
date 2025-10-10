'use client';

const CATEGORIES = [
  { value: 'art-antiques', label: 'Art & Antiques' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'jewelry-watches', label: 'Jewelry & Watches' },
  { value: 'furniture-decor', label: 'Furniture & Decor' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'charity', label: 'Charity & Fundraising' },
  { value: 'sports-memorabilia', label: 'Sports Memorabilia' },
  { value: 'books-manuscripts', label: 'Books & Manuscripts' },
  { value: 'coins-currency', label: 'Coins & Currency' },
  { value: 'general', label: 'General Auctions' },
];

export default function BasicInformationStep({ formData, updateFormData, errors }) {
  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Site Name */}
      <div>
        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
          Site Name *
        </label>
        <input
          type="text"
          id="siteName"
          value={formData.siteName}
          onChange={(e) => handleChange('siteName', e.target.value)}
          placeholder="Heritage Auctions"
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.siteName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
          `}
          maxLength={50}
        />
        {errors.siteName && (
          <p className="mt-1 text-sm text-red-600">{errors.siteName}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This will be displayed as your auction house name
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Fine art and antiques from local estates..."
          rows={3}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
          `}
          maxLength={200}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/200 characters. Brief description of your auction house.
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Primary Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
          `}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Choose the category that best represents your auction house specialty
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Getting Started
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This information will be used to set up your auction site. You can always change these details later from your site settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}