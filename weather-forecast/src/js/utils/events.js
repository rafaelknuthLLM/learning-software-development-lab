// Event Emitter Utility
/**
 * Simple EventEmitter implementation for component communication
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     * @returns {EventEmitter} This instance for chaining
     */
    on(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const listeners = this.events.get(event);

        // Check max listeners warning
        if (listeners.length >= this.maxListeners) {
            console.warn(
                `MaxListenersExceededWarning: Possible memory leak detected. ` +
                `${listeners.length + 1} "${event}" listeners added. ` +
                `Use setMaxListeners() to increase limit.`
            );
        }

        listeners.push(listener);
        return this;
    }

    /**
     * Add one-time event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     * @returns {EventEmitter} This instance for chaining
     */
    once(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };

        return this.on(event, onceWrapper);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler to remove
     * @returns {EventEmitter} This instance for chaining
     */
    off(event, listener) {
        if (!this.events.has(event)) {
            return this;
        }

        if (typeof listener !== 'function') {
            // Remove all listeners for event if no specific listener provided
            this.events.delete(event);
            return this;
        }

        const listeners = this.events.get(event);
        const index = listeners.indexOf(listener);

        if (index !== -1) {
            listeners.splice(index, 1);
        }

        // Clean up empty event arrays
        if (listeners.length === 0) {
            this.events.delete(event);
        }

        return this;
    }

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to listeners
     * @returns {boolean} Whether there were listeners for the event
     */
    emit(event, ...args) {
        if (!this.events.has(event)) {
            return false;
        }

        const listeners = this.events.get(event).slice(); // Copy array to avoid modification during iteration

        for (const listener of listeners) {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);

                // Emit error event if this isn't already an error event
                if (event !== 'error') {
                    this.emit('error', error);
                }
            }
        }

        return true;
    }

    /**
     * Get all event names with listeners
     * @returns {Array<string>} Array of event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Get listeners for a specific event
     * @param {string} event - Event name
     * @returns {Array<Function>} Array of listeners
     */
    listeners(event) {
        return this.events.has(event) ? this.events.get(event).slice() : [];
    }

    /**
     * Get number of listeners for a specific event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    /**
     * Remove all listeners for all events or specific event
     * @param {string} [event] - Optional specific event name
     * @returns {EventEmitter} This instance for chaining
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        return this;
    }

    /**
     * Set maximum number of listeners for an event
     * @param {number} n - Maximum number of listeners
     * @returns {EventEmitter} This instance for chaining
     */
    setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {
            throw new TypeError('maxListeners must be a non-negative integer');
        }
        this.maxListeners = n;
        return this;
    }

    /**
     * Get maximum number of listeners
     * @returns {number} Maximum number of listeners
     */
    getMaxListeners() {
        return this.maxListeners;
    }

    /**
     * Add listener to beginning of listeners array
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     * @returns {EventEmitter} This instance for chaining
     */
    prependListener(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        this.events.get(event).unshift(listener);
        return this;
    }

    /**
     * Add one-time listener to beginning of listeners array
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     * @returns {EventEmitter} This instance for chaining
     */
    prependOnceListener(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };

        return this.prependListener(event, onceWrapper);
    }

    /**
     * Asynchronously call each listener with error handling
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to listeners
     * @returns {Promise<boolean>} Whether there were listeners for the event
     */
    async emitAsync(event, ...args) {
        if (!this.events.has(event)) {
            return false;
        }

        const listeners = this.events.get(event).slice();
        const promises = listeners.map(async (listener) => {
            try {
                const result = listener.apply(this, args);
                // Handle both sync and async listeners
                return Promise.resolve(result);
            } catch (error) {
                console.error(`Error in async event listener for "${event}":`, error);
                if (event !== 'error') {
                    this.emit('error', error);
                }
                throw error;
            }
        });

        try {
            await Promise.all(promises);
            return true;
        } catch (error) {
            // At least one listener threw an error
            return true; // Still had listeners, even if some failed
        }
    }

    /**
     * Create a promise that resolves when event is emitted
     * @param {string} event - Event name
     * @param {number} [timeout] - Optional timeout in milliseconds
     * @returns {Promise} Promise that resolves with event arguments
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId;

            const listener = (...args) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                this.off(event, listener);
                resolve(args);
            };

            this.once(event, listener);

            if (timeout) {
                timeoutId = setTimeout(() => {
                    this.off(event, listener);
                    reject(new Error(`Timeout waiting for event "${event}"`));
                }, timeout);
            }
        });
    }

    /**
     * Create a readable stream-like interface for events
     * @param {string} event - Event name
     * @param {Object} [options] - Options object
     * @returns {Object} Stream-like object with iterator interface
     */
    stream(event, options = {}) {
        const { buffer = false, bufferSize = 100 } = options;
        const queue = [];
        let isListening = true;

        const listener = (...args) => {
            if (buffer) {
                if (queue.length >= bufferSize) {
                    queue.shift(); // Remove oldest if buffer is full
                }
                queue.push(args);
            }
        };

        this.on(event, listener);

        return {
            [Symbol.asyncIterator]: async function* () {
                while (isListening) {
                    if (queue.length > 0) {
                        yield queue.shift();
                    } else {
                        // Wait for next event
                        await new Promise(resolve => {
                            const onceListener = () => {
                                resolve();
                            };
                            this.once(event, onceListener);
                        });
                    }
                }
            }.bind(this),

            close() {
                isListening = false;
                this.off(event, listener);
                queue.length = 0;
            }
        };
    }

    /**
     * Get debug info about the EventEmitter
     * @returns {Object} Debug information
     */
    debug() {
        const info = {
            totalEvents: this.events.size,
            maxListeners: this.maxListeners,
            events: {}
        };

        for (const [event, listeners] of this.events) {
            info.events[event] = {
                listenerCount: listeners.length,
                listeners: listeners.map(fn => fn.name || 'anonymous')
            };
        }

        return info;
    }
}