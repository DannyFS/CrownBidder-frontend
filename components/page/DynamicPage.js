'use client';

import { useEffect, useState, useContext } from 'react';
import { SiteContext } from '@/contexts/SiteContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import SectionRenderer from './SectionRenderer';
import api from '@/lib/api';

/**
 * Dynamic Page Component
 * Fetches and renders a page from the database
 */
export default function DynamicPage({ pageSlug = 'home' }) {
  const { site } = useContext(SiteContext);
  const { theme } = useContext(ThemeContext);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!site) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.pages.getBySlug(pageSlug);
        setPage(response.data.page);
      } catch (err) {
        console.error('Failed to fetch page:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [site, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || `The page "${pageSlug}" could not be found.`}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const siteColors = {
    primary: theme?.colors?.primary || theme?.primaryColor || '#1e40af',
    secondary: theme?.colors?.secondary || theme?.secondaryColor || '#64748b',
    accent: theme?.colors?.accent || theme?.accentColor || '#f59e0b',
  };

  // Sort sections by order
  const sortedSections = page.content?.sections?.sort((a, b) => a.order - b.order) || [];

  return (
    <div className="min-h-screen">
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          siteColors={siteColors}
        />
      ))}

      {sortedSections.length === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>This page has no content yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
