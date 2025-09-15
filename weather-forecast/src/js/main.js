// Main JavaScript Entry Point
import { WeatherApp } from './components/WeatherApp.js';
import { DOMUtils } from './utils/dom.js';
import { StorageManager } from './utils/storage.js';

/**
 * Initialize the Weather Forecast Application
 */
class App {
    constructor() {
        this.weatherApp = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Wait for DOM to be ready
            await DOMUtils.waitForDOM();

            // Initialize storage
            StorageManager.init();

            // Initialize weather application
            this.weatherApp = new WeatherApp();
            await this.weatherApp.init();

            // Set up global error handling
            this.setupErrorHandling();

            // Set up service worker for PWA (if supported)
            this.setupServiceWorker();

            this.isInitialized = true;
            console.log('Weather app initialized successfully');

        } catch (error) {
            console.error('Failed to initialize weather app:', error);
            this.showInitializationError(error);
        }
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });

        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            console.error('Uncaught error:', event.error);
        });
    }

    /**
     * Set up service worker for PWA functionality
     */
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration.scope);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Show initialization error to user
     * @param {Error} error - The initialization error
     */
    showInitializationError(error) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'init-error';
        errorContainer.innerHTML = `
            <div class="init-error__content">
                <h1>Failed to Initialize Weather App</h1>
                <p>Something went wrong while starting the application.</p>
                <p class="init-error__details">${error.message}</p>
                <button class="init-error__retry" onclick="location.reload()">
                    Reload Page
                </button>
            </div>
        `;

        // Add styles for error display
        const style = document.createElement('style');
        style.textContent = `
            .init-error {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #ef4444;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                text-align: center;
                padding: 2rem;
            }
            .init-error__content {
                max-width: 500px;
            }
            .init-error__content h1 {
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            .init-error__content p {
                margin-bottom: 1rem;
                opacity: 0.9;
            }
            .init-error__details {
                font-family: monospace;
                background: rgba(0, 0, 0, 0.2);
                padding: 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
            }
            .init-error__retry {
                background: white;
                color: #ef4444;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 1rem;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(errorContainer);
    }
}

// Initialize the application when the page loads
const app = new App();

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for debugging
window.app = app;