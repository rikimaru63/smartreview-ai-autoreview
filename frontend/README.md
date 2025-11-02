# SmartReview AI Frontend

A modern React application for generating AI-powered reviews with a mobile-first, user-friendly interface.

## 🚀 Features

### MVP Phase 1
- **Smart Rating System**: Interactive 1-5 star rating with visual feedback
- **Service Selection**: Multi-select checkboxes for different service aspects
- **AI Review Generation**: Generate personalized reviews using backend AI service
- **Platform Integration**: One-click sharing to Google, Yelp, Facebook, and more
- **Feedback Collection**: Dedicated form for low ratings to gather improvement suggestions
- **QR Code Simulator**: Testing interface for QR code scanning functionality
- **Copy to Clipboard**: Easy review copying with visual feedback
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface

### Technical Features
- **TypeScript**: Full type safety and better developer experience
- **React 18**: Latest React with concurrent features
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Query**: Efficient server state management with caching
- **React Router**: Client-side routing with URL management
- **Vite**: Fast build tool and development server
- **Progressive Web App**: Offline-ready with service worker support

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (LoadingSpinner, QRSimulator)
│   ├── feedback/       # Feedback-related components
│   └── review/         # Review-specific components
├── hooks/              # Custom React hooks
├── pages/              # Page components (ReviewPage, ResultPage)
├── services/           # API services and external integrations
├── styles/             # Global styles and Tailwind CSS
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── env.ts              # Environment configuration
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on localhost:8000

### Installation

1. **Clone and navigate to frontend directory**
   ```bash
   cd smartreview-ai/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file (optional - defaults work for local development)
   VITE_API_URL=http://localhost:8000
   VITE_DEBUG=true
   VITE_FEATURE_QR_SCANNING=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - The app will automatically reload when you make changes

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Testing
npm run test            # Run tests (when implemented)
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb) for main actions and branding
- **Success**: Green for positive feedback and confirmations
- **Warning**: Yellow for cautions and improvements needed
- **Error**: Red for errors and negative feedback
- **Gray Scale**: Comprehensive gray palette for text and backgrounds

### Typography
- **Font Family**: System fonts (Apple system, Segoe UI, Roboto)
- **Font Sizes**: Responsive scale from 12px to 48px
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **Buttons**: Multiple variants (primary, secondary, success, warning, danger)
- **Cards**: Consistent padding and styling with header, body, footer sections
- **Forms**: Standardized input styles with validation states
- **Loading States**: Consistent spinner and shimmer animations

## 📱 Mobile-First Approach

### Design Principles
- **Touch Targets**: Minimum 44px for all interactive elements
- **Thumb-Friendly**: Important actions within easy thumb reach
- **Progressive Enhancement**: Works on all devices, enhanced on larger screens
- **Fast Loading**: Optimized bundle size and lazy loading

### Responsive Breakpoints
- **xs**: 475px and up
- **sm**: 640px and up  
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

## 🔌 API Integration

### Endpoints Used
- `POST /api/v1/review/generate` - Generate AI review
- `POST /api/v1/review/feedback` - Submit feedback for low ratings
- `GET /api/v1/store/:id` - Get store information
- `GET /health` - Health check

### Error Handling
- Automatic retry for failed requests
- User-friendly error messages
- Offline support (future feature)

## 🧪 Testing Strategy

### Component Testing
- Individual component functionality
- User interaction testing
- Accessibility testing

### Integration Testing
- API integration tests
- User flow testing (rating → generation → sharing)
- Cross-browser compatibility

### Performance Testing
- Bundle size optimization
- Loading time measurements
- Mobile performance testing

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Build outputs to dist/ directory
# Includes:
# - Optimized JavaScript bundles
# - CSS with Tailwind optimizations
# - Source maps for debugging
# - Asset optimization
```

### Environment Variables
```bash
# Production environment variables
VITE_API_URL=https://api.smartreview.ai
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_ERROR_REPORTING=true
```

### CDN and Hosting
- **Static Files**: Can be hosted on any CDN (Vercel, Netlify, AWS S3)
- **SPA Configuration**: Requires proper routing configuration for single-page app
- **HTTPS Required**: For clipboard API and potential PWA features

## 🔧 Configuration

### Tailwind CSS
- Custom color palette
- Component utilities
- Mobile-first responsive utilities
- Custom animations and transitions

### Vite Configuration
- TypeScript support
- Path aliases (@/ for src/)
- API proxy for development
- Bundle optimization
- Source map generation

### ESLint & Prettier
- TypeScript-aware linting
- React-specific rules
- Automatic code formatting
- Import organization

## 🌟 Future Enhancements

### Phase 2 Features
- **Real QR Code Scanning**: Camera integration for actual QR code reading
- **Offline Mode**: Service worker for offline review generation
- **User Accounts**: Save reviews and manage history
- **Analytics**: Track user interactions and review effectiveness
- **A/B Testing**: Test different UI variations

### Technical Improvements
- **Unit Tests**: Comprehensive test coverage with Jest/Vitest
- **E2E Tests**: Cypress or Playwright for user flow testing
- **Storybook**: Component documentation and testing
- **Performance Monitoring**: Real User Monitoring (RUM)
- **Accessibility**: WCAG 2.1 AA compliance

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   ```bash
   # Check if backend is running
   curl http://localhost:8000/health
   
   # Verify API URL in environment
   echo $VITE_API_URL
   ```

2. **Build Failures**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check for TypeScript errors
   npm run lint
   ```

3. **Styling Issues**
   ```bash
   # Rebuild Tailwind CSS
   npm run build
   
   # Check for conflicting CSS
   # Inspect browser developer tools
   ```

## 📚 Dependencies

### Core Dependencies
- **react**: ^18.2.0 - UI library
- **react-dom**: ^18.2.0 - DOM renderer
- **react-router-dom**: ^6.20.0 - Client-side routing
- **@tanstack/react-query**: ^5.8.0 - Server state management
- **axios**: ^1.6.2 - HTTP client

### UI & Styling
- **tailwindcss**: ^3.3.5 - CSS framework
- **lucide-react**: ^0.291.0 - Icon library
- **react-hot-toast**: ^2.4.1 - Toast notifications
- **clsx**: ^2.0.0 - Conditional classes
- **tailwind-merge**: ^2.0.0 - Tailwind class merging

### Development
- **typescript**: ^5.3.2 - Type safety
- **vite**: ^5.0.2 - Build tool
- **@vitejs/plugin-react**: ^4.2.0 - React support for Vite
- **eslint**: ^8.54.0 - Linting
- **prettier**: ^3.1.0 - Code formatting

## 📄 License

This project is part of the SmartReview AI system. See the main project license for details.

## 🤝 Contributing

1. **Follow the existing code style**
2. **Write TypeScript with proper typing**
3. **Test your changes thoroughly**
4. **Update documentation as needed**
5. **Submit pull requests for review**

## 📞 Support

For technical issues or questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check this README and inline code comments
- **Email**: Contact the development team

---

**Made with ❤️ for SmartReview AI Phase 1 MVP**