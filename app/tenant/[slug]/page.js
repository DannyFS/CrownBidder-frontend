'use client';

import { use } from 'react';
import DynamicPage from '@/components/page/DynamicPage';

export default function DynamicPageRoute({ params }) {
  const { slug } = use(params);

  return <DynamicPage pageSlug={slug} />;
}
