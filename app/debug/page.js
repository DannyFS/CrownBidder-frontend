export default function DebugPage() {
  const envVars = {
    'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
    'NEXT_PUBLIC_ROOT_DOMAIN': process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    'NODE_ENV': process.env.NODE_ENV,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Crown Bidder Debug Info
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Environment Variables
          </h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-4 min-w-[200px]">
                  {key}
                </span>
                <span className="font-mono text-sm text-gray-700">
                  {value || '(not set)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Deployment Info
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-4 min-w-[200px]">
                Build Time
              </span>
              <span className="font-mono text-sm text-gray-700">
                {new Date().toISOString()}
              </span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-4 min-w-[200px]">
                Next.js Version
              </span>
              <span className="font-mono text-sm text-gray-700">
                15.x (App Router)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subdomain Test
          </h2>
          <p className="text-gray-600 mb-4">
            Test subdomain access:
          </p>
          <div className="space-y-2">
            <a 
              href="https://crown.crownbidder.com" 
              className="block text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              crown.crownbidder.com
            </a>
            <a 
              href="https://test.crownbidder.com" 
              className="block text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              test.crownbidder.com (should show 404)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}