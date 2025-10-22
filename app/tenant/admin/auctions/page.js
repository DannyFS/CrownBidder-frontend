'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import Link from 'next/link';

export default function AuctionsTab() {
  const { site } = useSite();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0,
  });

  useEffect(() => {
    if (site) {
      fetchAuctions();
    }
  }, [site]);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const response = await api.auctions.list({ siteId: site._id });
      const auctionsList = response.data.auctions || [];
      setAuctions(auctionsList);

      // Calculate stats
      const stats = {
        total: auctionsList.length,
        active: auctionsList.filter(a => a.status === 'active').length,
        scheduled: auctionsList.filter(a => a.status === 'scheduled').length,
        completed: auctionsList.filter(a => a.status === 'completed').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      await api.auctions.delete(auctionId);
      await fetchAuctions();
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('Failed to delete auction: ' + error.message);
    }
  };

  const handleStartAuction = async (auctionId) => {
    try {
      await api.auctions.start(auctionId);
      await fetchAuctions();
    } catch (error) {
      console.error('Error starting auction:', error);
      alert('Failed to start auction: ' + error.message);
    }
  };

  const handleEndAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to end this auction?')) {
      return;
    }

    try {
      await api.auctions.end(auctionId);
      await fetchAuctions();
    } catch (error) {
      console.error('Error ending auction:', error);
      alert('Failed to end auction: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Scheduled' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      paused: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Paused' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auction Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage your auctions
          </p>
        </div>
        <Link href="/admin/auctions/create">
          <Button className="px-4">Create New Auction</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Auctions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.scheduled}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.completed}</div>
        </Card>
      </div>

      {/* Auctions List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auction Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auctions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No auctions yet. Create your first auction to get started!
                  </td>
                </tr>
              ) : (
                auctions.map((auction) => (
                  <tr key={auction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {auction.name}
                      </div>
                      {auction.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {auction.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(auction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(auction.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {auction.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/auctions/${auction._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      {auction.status === 'scheduled' && (
                        <button
                          onClick={() => handleStartAuction(auction._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Start
                        </button>
                      )}
                      {auction.status === 'active' && (
                        <button
                          onClick={() => handleEndAuction(auction._id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          End
                        </button>
                      )}
                      {(auction.status === 'scheduled' || auction.status === 'completed') && (
                        <button
                          onClick={() => handleDeleteAuction(auction._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
