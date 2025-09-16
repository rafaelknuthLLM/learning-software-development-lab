/**
 * Claude-Flow Application Tests
 * Tests for core functionality and SPARC framework integration
 */

// Mock DOM environment for Node.js testing
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Set up DOM environment
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;

// Load the application
const ClaudeFlowApp = require('../src/app.js');

describe('ClaudeFlowApp', () => {
    let app;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        app = new ClaudeFlowApp();
    });

    describe('Initialization', () => {
        test('should initialize with empty expertise selection', () => {
            expect(app.selectedExpertise.size).toBe(0);
        });

        test('should initialize with empty challenge', () => {
            expect(app.currentChallenge).toBe('');
        });

        test('should have SPARC phases defined', () => {
            expect(app.sparcPhases).toEqual([
                'specification', 'pseudocode', 'architecture', 'refinement', 'completion'
            ]);
        });

        test('should have loading phases defined', () => {
            expect(app.loadingPhases).toHaveLength(6);
            expect(app.loadingPhases[0]).toBe('Analyzing your challenge...');
        });
    });

    describe('Expertise Selection', () => {
        test('should add expertise when checkbox is checked', () => {
            const marketingCheckbox = document.getElementById('marketing');
            marketingCheckbox.checked = true;

            app.handleExpertiseChange({ target: marketingCheckbox });

            expect(app.selectedExpertise.has('marketing')).toBe(true);
        });

        test('should remove expertise when checkbox is unchecked', () => {
            // First add expertise
            app.selectedExpertise.add('sales');

            const salesCheckbox = document.getElementById('sales');
            salesCheckbox.checked = false;

            app.handleExpertiseChange({ target: salesCheckbox });

            expect(app.selectedExpertise.has('sales')).toBe(false);
        });

        test('should update card styling when expertise is selected', () => {
            const marketingCard = document.querySelector('[data-expertise="marketing"]');
            const marketingCheckbox = document.getElementById('marketing');

            marketingCheckbox.checked = true;
            app.handleExpertiseChange({ target: marketingCheckbox });

            expect(marketingCard.classList.contains('selected')).toBe(true);
        });

        test('should handle multiple expertise selections', () => {
            const checkboxes = ['marketing', 'sales', 'learning'];

            checkboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                checkbox.checked = true;
                app.handleExpertiseChange({ target: checkbox });
            });

            expect(app.selectedExpertise.size).toBe(3);
            expect(app.selectedExpertise.has('marketing')).toBe(true);
            expect(app.selectedExpertise.has('sales')).toBe(true);
            expect(app.selectedExpertise.has('learning')).toBe(true);
        });
    });

    describe('Challenge Input', () => {
        test('should update current challenge on input', () => {
            const input = { target: { value: 'Test challenge' } };
            app.handleChallengeInput(input);

            expect(app.currentChallenge).toBe('Test challenge');
        });

        test('should trim whitespace from challenge', () => {
            const input = { target: { value: '  Test challenge  ' } };
            app.handleChallengeInput(input);

            expect(app.currentChallenge).toBe('Test challenge');
        });

        test('should update character count', () => {
            const challengeText = 'This is a test challenge';
            document.getElementById('challenge-input').value = challengeText;

            const input = { target: { value: challengeText } };
            app.handleChallengeInput(input);

            const charCount = document.getElementById('char-count');
            expect(charCount.textContent).toBe(challengeText.length.toString());
        });
    });

    describe('UI State Management', () => {
        test('should disable generate button when no expertise selected', () => {
            app.currentChallenge = 'Valid challenge text';
            app.updateUI();

            const generateBtn = document.getElementById('generate-btn');
            expect(generateBtn.disabled).toBe(true);
        });

        test('should disable generate button when challenge too short', () => {
            app.selectedExpertise.add('marketing');
            app.currentChallenge = 'Short';
            app.updateUI();

            const generateBtn = document.getElementById('generate-btn');
            expect(generateBtn.disabled).toBe(true);
        });

        test('should enable generate button when both conditions met', () => {
            app.selectedExpertise.add('marketing');
            app.currentChallenge = 'This is a valid challenge description';
            app.updateUI();

            const generateBtn = document.getElementById('generate-btn');
            expect(generateBtn.disabled).toBe(false);
        });

        test('should update button text based on state', () => {
            app.updateUI();

            const btnText = document.querySelector('.btn-text');
            expect(btnText.textContent).toBe('Select expertise and describe challenge');
        });
    });

    describe('SPARC Solution Generation', () => {
        beforeEach(() => {
            app.selectedExpertise.add('marketing');
            app.currentChallenge = 'Improve conversion rates for e-commerce site';
        });

        test('should generate expertise context correctly', () => {
            const context = app.getExpertiseContext(['marketing']);

            expect(context).toHaveLength(1);
            expect(context[0].focus).toContain('marketing campaigns');
            expect(context[0].keywords).toContain('conversion');
        });

        test('should generate specification phase', () => {
            const spec = app.generateSpecificationPhase(['marketing'], app.currentChallenge);

            expect(spec.title).toBe('Specification - Requirements Analysis');
            expect(spec.items).toHaveLength(4);
            expect(spec.items[0]).toContain('target audience');
        });

        test('should generate pseudocode phase', () => {
            const pseudocode = app.generatePseudocodePhase(['marketing'], app.currentChallenge);

            expect(pseudocode.title).toBe('Pseudocode - Logical Framework');
            expect(pseudocode.items.length).toBeGreaterThan(0);
            expect(pseudocode.items[0]).toContain('IF');
        });

        test('should generate architecture phase', () => {
            const architecture = app.generateArchitecturePhase(['marketing'], app.currentChallenge);

            expect(architecture.title).toBe('Architecture - System Design');
            expect(architecture.items.length).toBeGreaterThan(0);
            expect(architecture.items[0]).toContain('campaign');
        });

        test('should generate refinement phase', () => {
            const refinement = app.generateRefinementPhase(['marketing'], app.currentChallenge);

            expect(refinement.title).toBe('Refinement - Optimization Process');
            expect(refinement.items.length).toBeGreaterThan(0);
            expect(refinement.items[0]).toContain('test');
        });

        test('should generate completion phase', () => {
            const completion = app.generateCompletionPhase(['marketing'], app.currentChallenge);

            expect(completion.title).toBe('Completion - Implementation & Launch');
            expect(completion.items.length).toBeGreaterThan(0);
            expect(completion.items[0]).toContain('Launch');
        });

        test('should generate recommendations', () => {
            const recommendations = app.generateRecommendations(['marketing']);

            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations[0]).toContain('data-driven');
        });

        test('should generate next steps', () => {
            const nextSteps = app.generateNextSteps(['marketing']);

            expect(nextSteps).toHaveLength(6);
            expect(nextSteps[0]).toContain('Review and validate');
        });
    });

    describe('Multi-Expertise Scenarios', () => {
        test('should handle marketing + sales combination', () => {
            const expertise = ['marketing', 'sales'];
            const spec = app.generateSpecificationPhase(expertise, 'Improve lead conversion');

            expect(spec.items.length).toBeLessThanOrEqual(6);
            expect(spec.items.some(item => item.includes('target audience'))).toBe(true);
            expect(spec.items.some(item => item.includes('customer journey'))).toBe(true);
        });

        test('should handle all expertise areas combined', () => {
            const expertise = ['marketing', 'sales', 'learning'];
            const recommendations = app.generateRecommendations(expertise);

            expect(recommendations.length).toBeLessThanOrEqual(6);
            expect(recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('Solution Display', () => {
        test('should generate solution HTML correctly', () => {
            const mockSolution = {
                expertise: ['marketing'],
                challenge: 'Test challenge',
                phases: {
                    specification: {
                        title: 'Test Spec',
                        description: 'Test description',
                        items: ['Item 1', 'Item 2']
                    }
                },
                recommendations: ['Rec 1', 'Rec 2'],
                nextSteps: ['Step 1', 'Step 2']
            };

            const html = app.generateSolutionHTML(mockSolution);

            expect(html).toContain('Applied Expertise');
            expect(html).toContain('Marketing');
            expect(html).toContain('Test challenge');
            expect(html).toContain('Test Spec');
            expect(html).toContain('Item 1');
            expect(html).toContain('Key Recommendations');
            expect(html).toContain('Next Steps');
        });
    });

    describe('Utility Functions', () => {
        test('should create delay promise', async () => {
            const start = Date.now();
            await app.delay(50);
            const end = Date.now();

            expect(end - start).toBeGreaterThanOrEqual(45);
        });
    });

    describe('Reset and New Challenge', () => {
        test('should reset form on new challenge', () => {
            // Set up initial state
            app.selectedExpertise.add('marketing');
            app.currentChallenge = 'Test challenge';
            document.getElementById('challenge-input').value = 'Test challenge';
            document.getElementById('marketing').checked = true;

            app.startNewChallenge();

            expect(app.selectedExpertise.size).toBe(0);
            expect(app.currentChallenge).toBe('');
            expect(document.getElementById('challenge-input').value).toBe('');
            expect(document.getElementById('marketing').checked).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should show error state on failure', () => {
            app.showErrorState('Test error message');

            const outputContent = document.getElementById('output-content');
            expect(outputContent.innerHTML).toContain('⚠️ Error');
            expect(outputContent.innerHTML).toContain('Test error message');
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA labels and roles', () => {
            const checkboxes = document.querySelectorAll('.expertise-checkbox');
            checkboxes.forEach(checkbox => {
                expect(checkbox.getAttribute('id')).toBeTruthy();
                expect(document.querySelector(`label[for="${checkbox.id}"]`)).toBeTruthy();
            });
        });

        test('should support keyboard navigation', () => {
            const card = document.querySelector('.expertise-card');
            const event = new dom.window.KeyboardEvent('keydown', { key: 'Enter' });

            // Should not throw error
            expect(() => {
                card.dispatchEvent(event);
            }).not.toThrow();
        });
    });
});

describe('Integration Tests', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        app = new ClaudeFlowApp();
    });

    test('should handle complete workflow from selection to solution', () => {
        // Select expertise
        const marketingCheckbox = document.getElementById('marketing');
        marketingCheckbox.checked = true;
        app.handleExpertiseChange({ target: marketingCheckbox });

        // Add challenge
        const challengeInput = { target: { value: 'Improve email marketing conversion rates' } };
        app.handleChallengeInput(challengeInput);

        // Check UI state
        app.updateUI();
        const generateBtn = document.getElementById('generate-btn');
        expect(generateBtn.disabled).toBe(false);

        // Generate solution (without async parts for testing)
        const solution = app.generateSparcSolution();
        expect(solution).resolves.toHaveProperty('expertise');
        expect(solution).resolves.toHaveProperty('phases');
    });

    test('should maintain state consistency throughout workflow', () => {
        app.selectedExpertise.add('sales');
        app.currentChallenge = 'Reduce sales cycle length';

        const solution = app.generateSparcSolution();

        return solution.then(result => {
            expect(result.expertise).toContain('sales');
            expect(result.challenge).toBe('Reduce sales cycle length');
            expect(result.phases).toHaveProperty('specification');
            expect(result.phases).toHaveProperty('pseudocode');
            expect(result.phases).toHaveProperty('architecture');
            expect(result.phases).toHaveProperty('refinement');
            expect(result.phases).toHaveProperty('completion');
        });
    });
});

// Performance tests
describe('Performance Tests', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        app = new ClaudeFlowApp();
    });

    test('should generate solution quickly for single expertise', () => {
        app.selectedExpertise.add('marketing');
        app.currentChallenge = 'Test challenge';

        const start = Date.now();
        const solution = app.generateSparcSolution();

        return solution.then(() => {
            const end = Date.now();
            expect(end - start).toBeLessThan(100); // Should be very fast in test
        });
    });

    test('should handle large challenge text efficiently', () => {
        app.selectedExpertise.add('learning');
        app.currentChallenge = 'A'.repeat(1000); // Large text

        const start = Date.now();
        const solution = app.generateSparcSolution();

        return solution.then(() => {
            const end = Date.now();
            expect(end - start).toBeLessThan(200);
        });
    });
});

module.exports = ClaudeFlowApp;