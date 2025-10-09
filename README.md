# Crown Bidder Frontend

Multi-tenant live auction platform frontend built with Next.js 14, React, and Tailwind CSS.

## Features

- **Multi-tenant Architecture**: Single application serving multiple auction sites under custom domains
- **Real-time Bidding**: Live auction bidding using Socket.IO
- **Custom Branding**: Each tenant can customize themes, logos, and colors
- **Authentication**: JWT-based authentication with role-based access control
- **Domain Management**: Custom domain setup with DNS verification
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Site Management**: Dashboard for auction houses to manage their sites

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Authentication**: JWT with HTTP-only cookies
- **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/                          # Next.js 14 App Router
│   ├── layout.js                # Root layout with providers
│   ├── page.js                  # Landing page
│   ├── globals.css              # Global styles
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── create-account/          # New site creation
│   ├── dashboard/               # Platform dashboard
│   ├── create-site/             # Site creation wizard
│   ├── site/[id]/              # Site management
│   └── tenant/                  # Tenant site pages
├── components/                  # Reusable components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── cards/                   # Card components
│   ├── navigation/              # Navigation components
│   ├── modals/                  # Modal components
│   ├── previews/                # Preview components
│   └── status/                  # Status indicators
├── contexts/                    # React contexts
│   ├── AuthContext.js           # Authentication state
│   ├── SiteContext.js           # Site/tenant state
│   └── ThemeContext.js          # Theme management
├── hooks/                       # Custom React hooks
│   ├── useAuth.js               # Authentication hook
│   ├── useSite.js               # Site management hook
│   ├── useTheme.js              # Theme management hook
│   └── useSocket.js             # Socket.IO hook
├── lib/                         # Utility libraries
│   ├── api.js                   # API client
│   ├── auth.js                  # Auth utilities
│   └── constants.js             # App constants
├── utils/                       # Helper utilities
│   ├── validation.js            # Form validation
│   ├── domain.js                # Domain utilities
│   ├── theme.js                 # Theme utilities
│   └── format.js                # Formatting utilities
├── middleware.js                # Tenant resolution middleware
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend README)
- MongoDB database
- Environment variables configured

### Installation

1. **Clone the repository**

```bash
cd frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001

# Vercel Integration
NEXT_PUBLIC_VERCEL_PROJECT_ID=your_vercel_project_id
NEXT_PUBLIC_VERCEL_TEAM_ID=your_vercel_team_id

# Authentication
NEXT_PUBLIC_JWT_COOKIE_NAME=crown_bidder_token
JWT_SECRET=your-jwt-secret-key-here

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_PREVIEW_MODE=true
NEXT_PUBLIC_ENABLE_DOMAIN_VERIFICATION=true
```

4. **Start development server**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development

### Running locally

```bash
npm run dev
```

### Building for production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Architecture

### Multi-tenancy

The application uses middleware to resolve tenants based on the incoming domain:

1. **Main Domain**: Shows platform landing page and dashboards
2. **Custom Domains**: Routes to tenant-specific pages with custom branding

### Authentication Flow

1. User enters credentials on login page
2. Frontend sends request to backend `/api/auth/login`
3. Backend validates and returns JWT token
4. Token stored in HTTP-only cookie
5. Token sent with subsequent API requests
6. Token automatically refreshed before expiration

### Real-time Bidding

1. User connects to auction via Socket.IO
2. Socket authenticated using JWT token
3. User joins auction room: `auction:{siteId}:{auctionId}`
4. Bid events broadcast to all users in room
5. UI updates in real-time as bids are placed

## Key Features Implementation

### Custom Domain Support

Domains are resolved in `middleware.js`:
- Extracts hostname from request
- Calls backend to resolve tenant
- Rewrites URL to tenant routes
- Passes tenant context via headers

### Theme Customization

Themes use CSS variables for dynamic styling:
- Colors stored as HSL values
- Applied via `applyTheme()` utility
- Preview updates in real-time
- Persisted per tenant site

### Site Creation Wizard

Multi-step form for creating new auction sites:
1. Basic Information (name, description)
2. Branding (logo, theme selection)
3. Domain Setup (custom domain, subdomain)
4. Owner Account (email, password)

### Dashboard

Site owners can:
- View auction statistics
- Manage auctions
- Configure site settings
- Customize themes
- Verify custom domains

## API Integration

All API calls use the centralized API client (`lib/api.js`):

```javascript
import api from '@/lib/api';

// Authentication
await api.auth.login({ email, password });

// Sites
await api.sites.create(siteData);
await api.sites.get(siteId);

// Auctions
await api.auctions.list({ status: 'live' });
await api.auctions.create(auctionData);

// Bids
await api.bids.place({ auctionId, itemIndex, amount });
```

## Environment Variables

### Required

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SOCKET_URL`: Socket.IO server URL
- `NEXT_PUBLIC_JWT_COOKIE_NAME`: Cookie name for JWT token

### Optional

- `NEXT_PUBLIC_VERCEL_PROJECT_ID`: Vercel project for domain management
- `NEXT_PUBLIC_VERCEL_TEAM_ID`: Vercel team ID
- `NEXT_PUBLIC_MAIN_DOMAIN`: Main platform domain
- `NEXT_PUBLIC_ENABLE_PREVIEW_MODE`: Enable theme preview mode
- `NEXT_PUBLIC_GA_TRACKING_ID`: Google Analytics tracking ID

## Deployment

### Vercel (Recommended)

1. **Push code to GitHub**

2. **Import project in Vercel**

3. **Configure environment variables**

4. **Deploy**

```bash
vercel --prod
```

### Custom Deployment

Build and export the application:

```bash
npm run build
npm start
```

## Troubleshooting

### "Site not found" error

- Verify backend is running
- Check middleware configuration
- Ensure site exists in database

### Socket.IO connection issues

- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check backend CORS configuration
- Ensure JWT token is valid

### Theme not applying

- Check CSS variables in browser dev tools
- Verify theme data structure
- Clear browser cache

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Copyright © 2024 Crown Bidder. All rights reserved.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact support@crownbidder.com

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [Backend API Documentation](../backend/README.md)
