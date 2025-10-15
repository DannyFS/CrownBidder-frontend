'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Section Renderer Component
 * Renders different section types from page content
 */

export default function SectionRenderer({ section, siteColors }) {
  const { type, data, styles = {} } = section;

  const primaryColor = siteColors?.primary || '#1e40af';
  const secondaryColor = siteColors?.secondary || '#64748b';
  const accentColor = siteColors?.accent || '#f59e0b';

  switch (type) {
    case 'hero':
      return <HeroSection data={data} styles={styles} colors={{ primaryColor, secondaryColor, accentColor }} />;

    case 'text':
      return <TextSection data={data} styles={styles} />;

    case 'features':
      return <FeaturesSection data={data} styles={styles} colors={{ primaryColor }} />;

    case 'auction-grid':
      return <AuctionGridSection data={data} styles={styles} colors={{ primaryColor }} />;

    case 'auction-list':
      return <AuctionListSection data={data} styles={styles} colors={ { primaryColor }} />;

    case 'stats':
      return <StatsSection data={data} styles={styles} colors={{ primaryColor }} />;

    case 'cta':
      return <CTASection data={data} styles={styles} colors={{ primaryColor, accentColor }} />;

    case 'contact-form':
      return <ContactFormSection data={data} styles={styles} colors={{ primaryColor }} />;

    case 'testimonials':
      return <TestimonialsSection data={data} styles={styles} />;

    case 'image':
      return <ImageSection data={data} styles={styles} />;

    case 'gallery':
      return <GallerySection data={data} styles={styles} />;

    default:
      return null;
  }
}

// Hero Section
function HeroSection({ data, styles, colors }) {
  const { heading, subheading, ctaText, ctaLink, backgroundType, alignment = 'center' } = data;
  const { minHeight = '600px', textColor = '#ffffff' } = styles;
  const { primaryColor, secondaryColor } = colors;

  let backgroundStyle = {};
  if (backgroundType === 'gradient') {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    };
  } else if (backgroundType === 'solid') {
    backgroundStyle = { backgroundColor: primaryColor };
  } else if (backgroundType === 'image' && data.backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${data.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ ...backgroundStyle, minHeight }}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center`}>
        <div className={`w-full ${alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
          {heading && (
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: textColor }}>
              {heading}
            </h1>
          )}
          {subheading && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl" style={{ color: textColor + 'dd', margin: alignment === 'center' ? '0 auto 2rem' : '0 0 2rem' }}>
              {subheading}
            </p>
          )}
          {ctaText && ctaLink && (
            <Link href={ctaLink}>
              <Button
                size="lg"
                className="text-lg px-8 py-4"
                style={{ backgroundColor: colors.accentColor, borderColor: colors.accentColor }}
              >
                {ctaText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// Text Section
function TextSection({ data, styles }) {
  const { heading, content } = data;
  const { maxWidth = '800px', alignment = 'center' } = styles;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style={{ maxWidth, margin: alignment === 'center' ? '0 auto' : '0', textAlign: alignment }}>
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {heading}
            </h2>
          )}
          {content && (
            <div
              className="prose prose-lg max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection({ data, styles, colors }) {
  const { heading, subheading, features = [] } = data;
  const { columns = 3, alignment = 'center' } = styles;

  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && (
          <div className={`mb-12 ${alignment === 'center' ? 'text-center' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {heading}
            </h2>
            {subheading && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols} gap-8`}>
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors.primaryColor}20` }}
              >
                <span className="text-2xl">{getIconEmoji(feature.icon)}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Auction Grid Section (placeholder)
function AuctionGridSection({ data, styles, colors }) {
  const { heading, subheading, limit = 6 } = data;
  const { columns = 3, cardStyle = 'elevated' } = styles;

  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
            {subheading && <p className="text-gray-600 mt-2">{subheading}</p>}
          </div>
        )}

        <div className={`grid ${gridCols} gap-6`}>
          {[...Array(Math.min(limit, 6))].map((_, i) => (
            <div key={i} className={`bg-white rounded-lg overflow-hidden ${cardStyle === 'elevated' ? 'shadow-md hover:shadow-lg' : 'border border-gray-200'} transition-shadow`}>
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Auction {i + 1}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Upcoming Auction</h3>
                <p className="text-sm text-gray-600 mb-3">Check back soon for details</p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Auction List Section (placeholder)
function AuctionListSection({ data, styles }) {
  const { heading, subheading } = data;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && (
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>
        )}
        {subheading && (
          <p className="text-gray-600 mb-8">{subheading}</p>
        )}
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No auctions available at this time</p>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection({ data, styles, colors }) {
  const { stats = [] } = data;
  const { columns = 4, alignment = 'center' } = styles;

  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${gridCols} gap-8 ${alignment === 'center' ? 'text-center' : ''}`}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold mb-2" style={{ color: colors.primaryColor }}>
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ data, styles, colors }) {
  const { heading, subheading, buttonText, buttonLink } = data;
  const { backgroundStyle = 'gradient', padding = '64px 0' } = styles;

  let bgStyle = {};
  if (backgroundStyle === 'gradient') {
    bgStyle = {
      background: `linear-gradient(135deg, ${colors.primaryColor} 0%, ${colors.accentColor} 100%)`
    };
  } else {
    bgStyle = { backgroundColor: colors.primaryColor };
  }

  return (
    <section style={{ ...bgStyle, padding }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{heading}</h2>
        )}
        {subheading && (
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{subheading}</p>
        )}
        {buttonText && buttonLink && (
          <Link href={buttonLink}>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-50 text-lg px-8 py-4"
            >
              {buttonText}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}

// Contact Form Section
function ContactFormSection({ data, styles, colors }) {
  const { heading, fields = [], submitText = 'Send Message' } = data;
  const { maxWidth = '600px', alignment = 'center' } = styles;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style={{ maxWidth, margin: alignment === 'center' ? '0 auto' : '0' }}>
          {heading && (
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{heading}</h2>
          )}
          <form className="space-y-6">
            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              style={{ backgroundColor: colors.primaryColor }}
            >
              {submitText}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection({ data, styles }) {
  const { heading, testimonials = [] } = data;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && (
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{heading}</h2>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Image Section
function ImageSection({ data, styles }) {
  const { imageUrl, alt, caption } = data;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <img src={imageUrl} alt={alt || ''} className="w-full rounded-lg shadow-lg" />
        {caption && (
          <p className="text-center text-gray-600 mt-4">{caption}</p>
        )}
      </div>
    </section>
  );
}

// Gallery Section
function GallerySection({ data, styles }) {
  const { images = [] } = data;
  const { columns = 3 } = styles;

  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${gridCols} gap-4`}>
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt || ''}
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper function for icons
function getIconEmoji(iconName) {
  const icons = {
    shield: '🛡️',
    clock: '⏰',
    verified: '✓',
    star: '⭐',
    heart: '❤️',
    trophy: '🏆',
    check: '✓',
    lightning: '⚡',
    fire: '🔥',
    rocket: '🚀',
  };
  return icons[iconName] || '•';
}
