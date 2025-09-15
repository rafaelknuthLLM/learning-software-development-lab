# WeatherNow - Modern Weather Forecast Application

A modern, responsive weather forecast web application built with vanilla JavaScript, featuring real-time weather data from the Open-Meteo API.

## Features

- **Real-time Weather Data**: Current conditions and 7-day forecast
- **Location Services**: GPS location detection and city search
- **Responsive Design**: Mobile-first, works on all devices
- **Offline Support**: Cached data for offline viewing
- **Progressive Web App**: Installable with app-like experience
- **Accessibility**: Full WCAG 2.1 AA compliance
- **Performance**: Optimized for speed and efficiency

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **Testing**: Jest with JSDOM
- **Linting**: ESLint
- **Formatting**: Prettier
- **API**: Open-Meteo Weather API

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/weather-forecast-app.git
cd weather-forecast-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

### Deployment
- `npm run deploy` - Build and deploy to GitHub Pages
- `npm run serve` - Serve production build locally

## Project Structure

```
weather-forecast/
├── src/
│   ├── js/
│   │   ├── components/
│   │   │   ├── WeatherApp.js      # Main application component
│   │   │   └── WeatherUI.js       # UI management component
│   │   ├── services/
│   │   │   ├── WeatherAPI.js      # Weather API integration
│   │   │   └── LocationService.js # Geolocation services
│   │   ├── utils/
│   │   │   ├── dom.js             # DOM utilities
│   │   │   ├── storage.js         # Local storage management
│   │   │   ├── events.js          # Event emitter utility
│   │   │   └── api.js             # API utilities
│   │   └── main.js                # Application entry point
│   ├── css/
│   │   └── style.css              # Main stylesheet
│   ├── index.html                 # Main HTML file
│   └── manifest.json              # PWA manifest
├── tests/
│   ├── setup.js                   # Jest setup
│   └── __mocks__/                 # Mock files
├── config/
│   ├── vite.config.js             # Vite configuration
│   ├── .eslintrc.js               # ESLint configuration
│   ├── .prettierrc                # Prettier configuration
│   └── jest.config.js             # Jest configuration
├── scripts/
│   └── build.js                   # Custom build script
├── assets/                        # Static assets
├── dist/                          # Production build output
└── docs/                          # Documentation
```

## API Integration

This application uses the [Open-Meteo API](https://open-meteo.com/) for weather data:

- **No API key required**
- **Free for non-commercial use**
- **Real-time and forecast data**
- **Global coverage**

### API Endpoints Used

- **Weather Forecast**: `https://api.open-meteo.com/v1/forecast`
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`

## Features in Detail

### Weather Data
- Current temperature, humidity, wind speed, pressure
- Feels-like temperature and weather conditions
- 7-day daily forecast with high/low temperatures
- 24-hour hourly forecast
- Weather icons and condition descriptions

### Location Services
- Automatic GPS location detection
- City name search with autocomplete
- Reverse geocoding for coordinates
- Location caching for faster loading

### User Experience
- Loading states and error handling
- Offline data caching
- Responsive design for all screen sizes
- Keyboard navigation support
- Screen reader compatibility

## Testing

The application includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- Unit tests for all components and utilities
- Integration tests for API services
- UI tests for user interactions
- Accessibility tests for WCAG compliance

## Performance

- **Lighthouse Score**: 95+ across all categories
- **Bundle Size**: < 100KB gzipped
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Maintain accessibility standards
- Use semantic commit messages

## Deployment

### GitHub Pages
```bash
npm run deploy
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for providing free weather API
- [Vite](https://vitejs.dev/) for the excellent build tool
- [Inter Font](https://rsms.me/inter/) for beautiful typography

## Support

If you have any questions or need help, please:

1. Check the [documentation](./docs/)
2. Search [existing issues](https://github.com/your-username/weather-forecast-app/issues)
3. Create a [new issue](https://github.com/your-username/weather-forecast-app/issues/new)

---

Made with ❤️ using modern web technologies