'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AUCTION_STATUS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';

const statusConfig = {
  [AUCTION_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: '📝'
  },
  [AUCTION_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800',
    icon: '📅'
  },
  [AUCTION_STATUS.LIVE]: {
    label: 'Live',
    color: 'bg-green-100 text-green-800',
    icon: '🔴'
  },
  [AUCTION_STATUS.ENDED]: {
    label: 'Ended',
    color: 'bg-gray-100 text-gray-800',
    icon: '✅'
  },
  [AUCTION_STATUS.PAUSED]: {
    label: 'Paused',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏸️'
  },
};

export default function AuctionsList({ 
  auctions = [], 
  siteId, 
  showActions = false, 
  limit 
}) {
  const displayAuctions = limit ? auctions.slice(0, limit) : auctions;

  if (!auctions.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions yet</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first auction</p>
        {showActions && (
          <Link href={`/site/${siteId}/auctions/create`}>
            <Button>Create Your First Auction</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayAuctions.map((auction) => {
        const status = statusConfig[auction.status] || statusConfig[AUCTION_STATUS.DRAFT];
        
        return (
          <div key={auction._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {auction.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    <span className="mr-1">{status.icon}</span>
                    {status.label}
                  </span>
                </div>
                
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {auction.description}
                </p>
                
                <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {auction.totalItems || 0} items
                  </div>
                  
                  {auction.startTime && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {auction.status === AUCTION_STATUS.SCHEDULED ? 'Starts' : 'Started'}: {formatDate(auction.startTime)}
                    </div>
                  )}
                  
                  {auction.totalBids > 0 && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                      </svg>
                      {auction.totalBids} bids
                    </div>
                  )}
                  
                  {auction.currentHighestBid && (
                    <div className="flex items-center font-medium text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      High bid: {formatCurrency(auction.currentHighestBid)}
                    </div>
                  )}
                </div>
              </div>
              
              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  {auction.status === AUCTION_STATUS.LIVE && (
                    <Link href={`/site/${siteId}/auctions/${auction._id}/control`}>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Control Live
                      </Button>
                    </Link>
                  )}
                  
                  {auction.status === AUCTION_STATUS.SCHEDULED && (
                    <Link href={`/site/${siteId}/auctions/${auction._id}/start`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Start Auction
                      </Button>
                    </Link>
                  )}
                  
                  <Link href={`/site/${siteId}/auctions/${auction._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  
                  {[AUCTION_STATUS.DRAFT, AUCTION_STATUS.SCHEDULED].includes(auction.status) && (
                    <Link href={`/site/${siteId}/auctions/${auction._id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {limit && auctions.length > limit && (
        <div className="text-center pt-4">
          <Link href={`/site/${siteId}/auctions`}>
            <Button variant="outline">
              View All {auctions.length} Auctions
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}