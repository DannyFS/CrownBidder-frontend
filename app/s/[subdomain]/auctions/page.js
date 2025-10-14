import { notFound } from 'next/navigation';
import TenantLayout from '@/components/tenant/TenantLayout';

async function getTenant(subdomain) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${apiUrl}/api/sites/resolve?subdomain=${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data.site;
  } catch (error) {
    console.error('Failed to load tenant:', error);
    return null;
  }
}

async function getAuctions(siteId) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${apiUrl}/api/auctions?siteId=${siteId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to load auctions:', error);
    return [];
  }
}

export default async function SubdomainAuctionsPage({ params }) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);

  if (!tenant) {
    notFound();
  }

  const auctions = await getAuctions(tenant._id);

  return (
    <TenantLayout tenant={tenant}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Live Auctions
              </h1>
              <p className="text-xl text-gray-600">
                Discover amazing items and place your bids in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {auctions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔨</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Auctions</h2>
              <p className="text-gray-600 mb-6">
                There are currently no live auctions. Check back soon for exciting new items!
              </p>
              <button 
                className="text-white px-6 py-3 rounded-lg font-semibold transition"
                style={{
                  backgroundColor: tenant?.settings?.primaryColor || '#1e40af'
                }}
                onClick={() => window.location.href = '/register'}
              >
                Register for Updates
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {auctions.map((auction) => (
                <div key={auction._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {auction.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        auction.status === 'live' ? 'text-green-600 bg-green-100' :
                        auction.status === 'scheduled' ? 'text-blue-600 bg-blue-100' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {auction.status === 'live' ? 'Live' :
                         auction.status === 'scheduled' ? 'Upcoming' :
                         auction.status}
                      </span>
                    </div>

                    {auction.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {auction.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{auction.items?.length || 0}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Bids:</span>
                        <span className="font-medium">{auction.totalBids || 0}</span>
                      </div>

                      {auction.scheduledStartTime && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {auction.status === 'live' ? 'Started:' : 'Starts:'}
                          </span>
                          <span className="font-medium">
                            {new Date(auction.scheduledStartTime).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 text-white py-2 px-4 rounded-lg text-sm font-semibold transition"
                        style={{
                          backgroundColor: tenant?.settings?.primaryColor || '#1e40af'
                        }}
                        onClick={() => window.location.href = `/auctions/${auction._id}`}
                      >
                        {auction.status === 'live' ? 'Join Auction' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Bidding?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Register now to participate in all current and upcoming auctions.
              </p>
              <button 
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
                style={{
                  backgroundColor: tenant?.settings?.primaryColor || '#1e40af'
                }}
                onClick={() => window.location.href = '/register'}
              >
                Register to Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}