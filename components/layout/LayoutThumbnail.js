'use client';

/**
 * Layout Thumbnail Component
 * Generates visual preview of each layout style
 */
export default function LayoutThumbnail({ layout }) {
  const { name, suggestedColors } = layout;

  // Define layout-specific structures
  const layoutStructures = {
    'modern-sleek': (
      <div className="w-full h-full bg-white">
        {/* Navbar */}
        <div
          className="h-8 flex items-center justify-between px-3"
          style={{ backgroundColor: suggestedColors.primary }}
        >
          <div className="w-12 h-4 bg-white/30 rounded"></div>
          <div className="flex gap-2">
            <div className="w-8 h-3 bg-white/30 rounded"></div>
            <div className="w-8 h-3 bg-white/30 rounded"></div>
            <div className="w-8 h-3 bg-white/30 rounded"></div>
          </div>
        </div>

        {/* Hero Section */}
        <div
          className="h-32 flex flex-col items-center justify-center px-4"
          style={{
            background: `linear-gradient(135deg, ${suggestedColors.primary} 0%, ${suggestedColors.secondary} 100%)`
          }}
        >
          <div className="w-24 h-4 bg-white/90 rounded mb-2"></div>
          <div className="w-32 h-3 bg-white/70 rounded mb-3"></div>
          <div
            className="w-16 h-5 rounded"
            style={{ backgroundColor: suggestedColors.accent }}
          ></div>
        </div>

        {/* Features Section */}
        <div className="p-3 grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 rounded p-2">
              <div
                className="w-6 h-6 rounded-full mx-auto mb-1"
                style={{ backgroundColor: suggestedColors.primary + '20' }}
              ></div>
              <div className="w-full h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Auction Grid */}
        <div className="px-3 pb-3 grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="w-full h-12 bg-gray-100"></div>
              <div className="p-1.5 space-y-1">
                <div className="w-full h-1.5 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-1.5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'classic-elegant': (
      <div className="w-full h-full bg-gray-50 flex">
        {/* Vertical Sidebar Navigation (LEFT SIDE) */}
        <div
          className="w-12 border-r flex flex-col items-center py-2 gap-2"
          style={{ backgroundColor: suggestedColors.primary }}
        >
          <div className="w-8 h-6 bg-white/40 rounded mb-2"></div>
          <div className="w-8 h-2 bg-white/30 rounded"></div>
          <div className="w-8 h-2 bg-white/30 rounded"></div>
          <div className="w-8 h-2 bg-white/30 rounded"></div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Hero - LEFT ALIGNED */}
          <div
            className="h-28 flex flex-col justify-center px-4"
            style={{ backgroundColor: suggestedColors.primary }}
          >
            <div className="w-24 h-4 bg-white rounded mb-2"></div>
            <div className="w-32 h-3 bg-white/80 rounded mb-3"></div>
            <div
              className="w-16 h-5 rounded"
              style={{ backgroundColor: suggestedColors.accent }}
            ></div>
          </div>

          {/* Stats Section */}
          <div className="p-3 bg-white flex justify-around">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div
                  className="w-10 h-4 rounded mx-auto mb-1"
                  style={{ backgroundColor: suggestedColors.primary }}
                ></div>
                <div className="w-10 h-1.5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* List Layout */}
          <div className="px-3 pb-3 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border-2 rounded p-2 flex gap-2">
                <div className="w-16 h-12 bg-gray-100 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="w-full h-2 bg-gray-200 rounded"></div>
                  <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    'minimal-clean': (
      <div className="w-full h-full bg-white">
        {/* Simple Top Navbar */}
        <div className="h-6 flex items-center justify-between px-3 border-b">
          <div className="w-10 h-2.5 bg-black rounded"></div>
          <div className="flex gap-2">
            <div className="w-6 h-2 bg-gray-400 rounded"></div>
            <div className="w-6 h-2 bg-gray-400 rounded"></div>
            <div className="w-6 h-2 bg-gray-400 rounded"></div>
          </div>
        </div>

        {/* Large Heading */}
        <div className="p-6 pt-8">
          <div className="w-36 h-5 bg-black rounded mb-2"></div>
          <div className="w-20 h-3 bg-gray-400 rounded"></div>
        </div>

        {/* Minimal Grid */}
        <div className="px-6 grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square">
              <div className="w-full h-full bg-gray-100 border border-gray-200"></div>
              <div className="mt-1 w-full h-1.5 bg-gray-200"></div>
              <div className="mt-0.5 w-2/3 h-1.5 bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    ),

    'bold-vibrant': (
      <div className="w-full h-full bg-white">
        {/* Bold Navbar */}
        <div
          className="h-8 flex items-center justify-between px-3"
          style={{
            background: `linear-gradient(90deg, ${suggestedColors.primary} 0%, ${suggestedColors.secondary} 100%)`
          }}
        >
          <div className="w-12 h-4 bg-white/40 rounded-lg"></div>
          <div className="flex gap-1.5">
            <div className="w-7 h-4 bg-white/40 rounded-lg"></div>
            <div className="w-7 h-4 bg-white/40 rounded-lg"></div>
          </div>
        </div>

        {/* Large Hero with Gradient */}
        <div
          className="h-36 flex flex-col items-center justify-center px-4 relative overflow-hidden"
          style={{
            background: `radial-gradient(circle at top right, ${suggestedColors.accent} 0%, ${suggestedColors.primary} 50%, ${suggestedColors.secondary} 100%)`
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/30"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/30"></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="w-28 h-5 bg-white rounded-lg mx-auto mb-2 shadow-lg"></div>
            <div className="w-36 h-3 bg-white/90 rounded mx-auto mb-3"></div>
            <div
              className="w-20 h-6 rounded-lg mx-auto shadow-lg"
              style={{ backgroundColor: suggestedColors.accent }}
            ></div>
          </div>
        </div>

        {/* Dynamic Cards */}
        <div className="p-3 grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform"
            >
              <div
                className="w-full h-14"
                style={{
                  backgroundColor: i === 1 ? suggestedColors.primary : i === 2 ? suggestedColors.secondary : suggestedColors.accent
                }}
              ></div>
              <div className="p-1.5 bg-white">
                <div className="w-full h-1.5 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-1.5 bg-gray-200 rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="w-full aspect-[4/3] border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {layoutStructures[name] || (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-xs">Preview</span>
        </div>
      )}
    </div>
  );
}
