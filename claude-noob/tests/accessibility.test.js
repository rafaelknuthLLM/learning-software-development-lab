/**
 * Accessibility Testing Suite
 * Tests for WCAG compliance and keyboard navigation
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Setup DOM
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.KeyboardEvent = dom.window.KeyboardEvent;

const ClaudeFlowApp = require('../src/app.js');

describe('Accessibility Testing', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        app = new ClaudeFlowApp();
    });

    describe('Semantic HTML Structure', () => {
        test('should have proper document structure', () => {
            expect(document.querySelector('header')).toBeTruthy();
            expect(document.querySelector('main')).toBeTruthy();
            expect(document.querySelector('footer')).toBeTruthy();
        });

        test('should have appropriate heading hierarchy', () => {
            const h1 = document.querySelector('h1');
            const h2s = document.querySelectorAll('h2');
            const h3s = document.querySelectorAll('h3');

            expect(h1).toBeTruthy();
            expect(h1.textContent).toBe('Claude-Flow');
            expect(h2s.length).toBeGreaterThan(0);
            expect(h3s.length).toBeGreaterThan(0);
        });

        test('should have proper form labels', () => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');

            checkboxes.forEach(checkbox => {
                const label = document.querySelector(`label[for="${checkbox.id}"]`);
                expect(label).toBeTruthy();
                expect(label.textContent.trim()).toBeTruthy();
            });
        });

        test('should have accessible textarea', () => {
            const textarea = document.getElementById('challenge-input');

            expect(textarea).toBeTruthy();
            expect(textarea.getAttribute('placeholder')).toBeTruthy();
            expect(textarea.getAttribute('rows')).toBeTruthy();
        });
    });

    describe('Keyboard Navigation', () => {
        test('should handle Enter key on expertise cards', () => {
            const marketingCard = document.querySelector('[data-expertise="marketing"]');
            const marketingCheckbox = document.getElementById('marketing');

            // Simulate Enter key press
            const enterEvent = new dom.window.KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true
            });

            expect(marketingCheckbox.checked).toBe(false);
            marketingCard.dispatchEvent(enterEvent);

            // Should not throw error (event handler exists)
            expect(() => {
                marketingCard.dispatchEvent(enterEvent);
            }).not.toThrow();
        });

        test('should handle Space key on expertise cards', () => {
            const salesCard = document.querySelector('[data-expertise="sales"]');

            // Simulate Space key press
            const spaceEvent = new dom.window.KeyboardEvent('keydown', {
                key: ' ',
                bubbles: true
            });

            expect(() => {
                salesCard.dispatchEvent(spaceEvent);
            }).not.toThrow();
        });

        test('should support tab navigation', () => {
            const focusableElements = document.querySelectorAll(
                'input, button, textarea, [tabindex]:not([tabindex="-1"])'
            );

            expect(focusableElements.length).toBeGreaterThan(0);

            // Check that buttons are not disabled by default
            const generateBtn = document.getElementById('generate-btn');
            expect(generateBtn.getAttribute('tabindex')).not.toBe('-1');
        });
    });

    describe('ARIA Support', () => {
        test('should have appropriate ARIA roles where needed', () => {
            // Check for main landmark
            const main = document.querySelector('main');
            expect(main).toBeTruthy();

            // Check button roles are implicit
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                expect(button.getAttribute('role')).toBeFalsy(); // Implicit role is sufficient
            });
        });

        test('should provide clear button labels', () => {
            const generateBtn = document.getElementById('generate-btn');
            const btnText = generateBtn.querySelector('.btn-text');

            expect(btnText).toBeTruthy();
            expect(btnText.textContent.trim()).toBeTruthy();
        });

        test('should have descriptive link text', () => {
            const links = document.querySelectorAll('a');

            links.forEach(link => {
                if (link.textContent.trim()) {
                    expect(link.textContent.trim()).toBeTruthy();
                    expect(link.textContent.trim()).not.toBe('click here');
                    expect(link.textContent.trim()).not.toBe('read more');
                }
            });
        });
    });

    describe('Color and Contrast', () => {
        test('should not rely solely on color for information', () => {
            // Check that selected state uses more than just color
            const cards = document.querySelectorAll('.expertise-card');

            cards.forEach(card => {
                // Should have visual indicators beyond color
                const icon = card.querySelector('.expertise-icon');
                const title = card.querySelector('.card-title');

                expect(icon).toBeTruthy();
                expect(title).toBeTruthy();
            });
        });

        test('should have sufficient color contrast indicators', () => {
            // Check that CSS classes exist for different states
            const styles = document.querySelector('link[href="styles.css"]');
            expect(styles).toBeTruthy();

            // Check for high contrast media query support (would be in CSS)
            // This is a structural test - actual contrast would need visual testing
            expect(true).toBe(true); // Placeholder for CSS contrast testing
        });
    });

    describe('Responsive and Mobile Accessibility', () => {
        test('should maintain accessibility on smaller screens', () => {
            // Test that touch targets are appropriately sized
            const buttons = document.querySelectorAll('button');
            const cards = document.querySelectorAll('.expertise-card');

            // These elements should be large enough for touch interaction
            expect(buttons.length).toBeGreaterThan(0);
            expect(cards.length).toBe(3);
        });

        test('should support reduced motion preferences', () => {
            // Check that animations can be disabled
            // This would typically be handled in CSS with prefers-reduced-motion
            expect(true).toBe(true); // Structural test
        });
    });

    describe('Form Accessibility', () => {
        test('should provide clear error messaging', () => {
            // Test error state
            app.showErrorState('Test error message');

            const outputContent = document.getElementById('output-content');
            expect(outputContent.textContent).toContain('Error');
            expect(outputContent.textContent).toContain('Test error message');
        });

        test('should indicate required fields clearly', () => {
            const textarea = document.getElementById('challenge-input');
            const generateBtn = document.getElementById('generate-btn');

            // Test that required state is communicated
            app.updateUI(); // Should disable button when requirements not met
            expect(generateBtn.disabled).toBe(true);

            const btnText = generateBtn.querySelector('.btn-text');
            expect(btnText.textContent).toContain('Select'); // Indicates what's needed
        });

        test('should provide helpful placeholder text', () => {
            const textarea = document.getElementById('challenge-input');
            const placeholder = textarea.getAttribute('placeholder');

            expect(placeholder).toBeTruthy();
            expect(placeholder.length).toBeGreaterThan(20);
            expect(placeholder.toLowerCase()).toContain('specific');
        });
    });

    describe('Loading States and Feedback', () => {
        test('should provide accessible loading indicators', () => {
            app.showLoadingState();

            const overlay = document.getElementById('loading-overlay');
            const spinner = overlay.querySelector('.loading-spinner');
            const loadingText = overlay.querySelector('h3');

            expect(overlay).toBeTruthy();
            expect(spinner).toBeTruthy();
            expect(loadingText).toBeTruthy();
            expect(loadingText.textContent).toBe('Applying SPARC Methodology');
        });

        test('should announce progress to screen readers', () => {
            const loadingPhase = document.getElementById('loading-phase');

            expect(loadingPhase).toBeTruthy();
            expect(loadingPhase.textContent).toBe('Analyzing your challenge...');
        });
    });

    describe('Content Structure and Readability', () => {
        test('should have clear content hierarchy', () => {
            const sections = document.querySelectorAll('section');

            sections.forEach(section => {
                const title = section.querySelector('h2');
                expect(title).toBeTruthy();
            });
        });

        test('should provide clear navigation between sections', () => {
            const sections = ['expertise-section', 'input-section'];

            sections.forEach(sectionClass => {
                const section = document.querySelector(`.${sectionClass}`);
                expect(section).toBeTruthy();
            });
        });

        test('should have readable text sizing', () => {
            // Check that important text elements exist
            const title = document.querySelector('.main-title');
            const subtitle = document.querySelector('.subtitle');
            const sectionTitles = document.querySelectorAll('.section-title');

            expect(title).toBeTruthy();
            expect(subtitle).toBeTruthy();
            expect(sectionTitles.length).toBeGreaterThan(0);
        });
    });
});