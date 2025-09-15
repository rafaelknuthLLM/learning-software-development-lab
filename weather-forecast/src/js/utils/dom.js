// DOM Utility Functions
/**
 * DOM manipulation and utility functions
 */
export class DOMUtils {
    /**
     * Wait for DOM to be ready
     * @returns {Promise<void>}
     */
    static waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Get element by selector with error handling
     * @param {string} selector - CSS selector
     * @returns {Element|null} Found element or null
     */
    static getElement(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * Get all elements by selector with error handling
     * @param {string} selector - CSS selector
     * @returns {NodeList|Array} Found elements or empty array
     */
    static getAllElements(selector) {
        try {
            return document.querySelectorAll(selector) || [];
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    }

    /**
     * Create element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string} content - Element content
     * @returns {HTMLElement} Created element
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className' || key === 'class') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.textContent = content;
        }

        return element;
    }

    /**
     * Add CSS class to element
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} className - Class name to add
     */
    static addClass(element, className) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && className) {
            el.classList.add(className);
        }
    }

    /**
     * Remove CSS class from element
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} className - Class name to remove
     */
    static removeClass(element, className) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && className) {
            el.classList.remove(className);
        }
    }

    /**
     * Toggle CSS class on element
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} className - Class name to toggle
     * @returns {boolean} Whether class is now present
     */
    static toggleClass(element, className) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && className) {
            return el.classList.toggle(className);
        }
        return false;
    }

    /**
     * Check if element has CSS class
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} className - Class name to check
     * @returns {boolean} Whether element has class
     */
    static hasClass(element, className) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        return el && className ? el.classList.contains(className) : false;
    }

    /**
     * Set element attributes
     * @param {HTMLElement|string} element - Element or selector
     * @param {Object} attributes - Attributes to set
     */
    static setAttributes(element, attributes) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                el.setAttribute(key, value);
            });
        }
    }

    /**
     * Get element attribute
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} attribute - Attribute name
     * @returns {string|null} Attribute value
     */
    static getAttribute(element, attribute) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        return el && attribute ? el.getAttribute(attribute) : null;
    }

    /**
     * Show element by removing hidden class or setting display
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} display - Display style (default: 'block')
     */
    static show(element, display = 'block') {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) {
            el.style.display = display;
            this.removeClass(el, 'hidden');
            el.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide element by adding hidden class or setting display none
     * @param {HTMLElement|string} element - Element or selector
     */
    static hide(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) {
            el.style.display = 'none';
            this.addClass(el, 'hidden');
            el.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Toggle element visibility
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} display - Display style when showing (default: 'block')
     * @returns {boolean} Whether element is now visible
     */
    static toggle(element, display = 'block') {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (!el) return false;

        const isVisible = el.style.display !== 'none' && !this.hasClass(el, 'hidden');

        if (isVisible) {
            this.hide(el);
            return false;
        } else {
            this.show(el, display);
            return true;
        }
    }

    /**
     * Get element's computed style
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} property - CSS property name
     * @returns {string} Property value
     */
    static getComputedStyle(element, property) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && property) {
            return window.getComputedStyle(el).getPropertyValue(property);
        }
        return '';
    }

    /**
     * Check if element is visible
     * @param {HTMLElement|string} element - Element or selector
     * @returns {boolean} Whether element is visible
     */
    static isVisible(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (!el) return false;

        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && el.style.visibility !== 'hidden';
    }

    /**
     * Scroll element into view smoothly
     * @param {HTMLElement|string} element - Element or selector
     * @param {Object} options - Scroll options
     */
    static scrollIntoView(element, options = { behavior: 'smooth', block: 'center' }) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && el.scrollIntoView) {
            el.scrollIntoView(options);
        }
    }

    /**
     * Add event listener with automatic cleanup tracking
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object|boolean} options - Event options
     * @returns {Function} Cleanup function
     */
    static addEventListener(element, event, handler, options = false) {
        const el = typeof element === 'string' ? this.getElement(element) : element;

        if (el && event && typeof handler === 'function') {
            el.addEventListener(event, handler, options);

            // Return cleanup function
            return () => {
                el.removeEventListener(event, handler, options);
            };
        }

        return () => {}; // No-op cleanup function
    }

    /**
     * Remove event listener
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object|boolean} options - Event options
     */
    static removeEventListener(element, event, handler, options = false) {
        const el = typeof element === 'string' ? this.getElement(element) : element;

        if (el && event && typeof handler === 'function') {
            el.removeEventListener(event, handler, options);
        }
    }

    /**
     * Animate element using Web Animations API
     * @param {HTMLElement|string} element - Element or selector
     * @param {Array} keyframes - Animation keyframes
     * @param {Object|number} options - Animation options or duration
     * @returns {Animation} Animation object
     */
    static animate(element, keyframes, options = {}) {
        const el = typeof element === 'string' ? this.getElement(element) : element;

        if (el && el.animate) {
            return el.animate(keyframes, options);
        }

        return null;
    }

    /**
     * Get viewport dimensions
     * @returns {Object} Viewport width and height
     */
    static getViewport() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }

    /**
     * Check if device is mobile based on viewport width
     * @returns {boolean} Whether device appears to be mobile
     */
    static isMobile() {
        return this.getViewport().width <= 768;
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone a DOM node
     * @param {HTMLElement} element - Element to clone
     * @param {boolean} deep - Whether to deep clone
     * @returns {HTMLElement} Cloned element
     */
    static cloneElement(element, deep = true) {
        if (!element || !element.cloneNode) return null;
        return element.cloneNode(deep);
    }

    /**
     * Insert HTML safely (prevents XSS)
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} html - HTML string
     * @param {string} position - Insert position ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
     */
    static insertHTML(element, html, position = 'beforeend') {
        const el = typeof element === 'string' ? this.getElement(element) : element;

        if (el && html && el.insertAdjacentHTML) {
            // Basic XSS protection - remove script tags
            const safeHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            el.insertAdjacentHTML(position, safeHTML);
        }
    }
}