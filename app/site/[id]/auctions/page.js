'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import AuctionsList from '@/components/auctions/AuctionsList';
import api from '@/lib/api';
import { AUCTION_STATUS } from '@/lib/constants';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Auctions', count: 0 },
  { key: AUCTION_STATUS.DRAFT, label: 'Drafts', count: 0 },
  { key: AUCTION_STATUS.SCHEDULED, label: 'Scheduled', count: 0 },
  { key: AUCTION_STATUS.LIVE, label: 'Live', count: 0 },
  { key: AUCTION_STATUS.ENDED, label: 'Ended', count: 0 },
  { key: AUCTION_STATUS.PAUSED, label: 'Paused', count: 0 },
];

export default function AuctionsPage() {
  const { id: siteId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [statusFilters, setStatusFilters] = useState(STATUS_FILTERS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(`/site/${siteId}/auctions`));
    return null;
  }

  // Check if user has access to this site
  if (user && user.siteId !== siteId) {
    router.push('/dashboard');
    return null;
  }

  useEffect(() => {
    fetchAuctions();
  }, [siteId]);

  useEffect(() => {
    filterAndSortAuctions();
  }, [auctions, activeFilter, searchQuery, sortBy]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await api.auctions.getAll(siteId);
      setAuctions(response.data);
      
      // Update status filter counts
      const counts = {};
      response.data.forEach(auction => {
        counts[auction.status] = (counts[auction.status] || 0) + 1;
      });
      
      setStatusFilters(prev => prev.map(filter => ({
        ...filter,
        count: filter.key === 'all' ? response.data.length : (counts[filter.key] || 0)
      })));
      
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAuctions = () => {
    let filtered = [...auctions];

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(auction => auction.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(auction =>
        auction.title.toLowerCase().includes(query) ||
        auction.description.toLowerCase().includes(query) ||
        auction.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'start_time_asc':
          return new Date(a.startTime) - new Date(b.startTime);
        case 'start_time_desc':
          return new Date(b.startTime) - new Date(a.startTime);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'created_desc':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredAuctions(filtered);
  };

  const getActiveFilterLabel = () => {
    const filter = statusFilters.find(f => f.key === activeFilter);
    return filter ? filter.label : 'All Auctions';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="md:col-span-3">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push(`/site/${siteId}/dashboard`)}
              className="hover:text-gray-700"
            >
              Dashboard
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Auctions</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Auction Management
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage all your auctions in one place
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={() => router.push(`/site/${siteId}/auctions/create`)}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Auction</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              
              {/* Status Filters */}
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.key
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Search</h3>
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created_desc">Recently Created</option>
                  <option value="created_asc">Oldest First</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="start_time_asc">Start Time (Earliest)</option>
                  <option value="start_time_desc">Start Time (Latest)</option>
                </select>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getActiveFilterLabel()}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredAuctions.length} auction(s) found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Auctions List */}
            <Card className="p-6">
              {filteredAuctions.length > 0 ? (
                <AuctionsList
                  auctions={filteredAuctions}
                  siteId={siteId}
                  showActions={true}
                />
              ) : (
                <div className="text-center py-12">
                  {searchQuery ? (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
                      <p className="text-gray-600 mb-4">
                        No auctions match your search criteria. Try adjusting your filters or search terms.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilter('all');
                        }}
                      >
                        Reset Filters
                      </Button>
                    </>
                  ) : activeFilter === 'all' ? (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions yet</h3>
                      <p className="text-gray-600 mb-6">Get started by creating your first auction</p>
                      <Button
                        onClick={() => router.push(`/site/${siteId}/auctions/create`)}
                      >
                        Create Your First Auction
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {getActiveFilterLabel().toLowerCase()} auctions
                      </h3>
                      <p className="text-gray-600 mb-6">
                        You don't have any auctions with this status yet.
                      </p>
                      <div className="space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setActiveFilter('all')}
                        >
                          View All Auctions
                        </Button>
                        <Button
                          onClick={() => router.push(`/site/${siteId}/auctions/create`)}
                        >
                          Create New Auction
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}