/**
 * Expertise Combinations Testing
 * Tests specific to different expertise area combinations
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

const ClaudeFlowApp = require('../src/app.js');

describe('Expertise Combinations Testing', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        app = new ClaudeFlowApp();
    });

    describe('Marketing Expertise', () => {
        beforeEach(() => {
            app.selectedExpertise.add('marketing');
            app.currentChallenge = 'Improve brand awareness and customer acquisition';
        });

        test('should generate marketing-focused SPARC solution', async () => {
            const solution = await app.generateSparcSolution();

            expect(solution.expertise).toContain('marketing');
            expect(solution.phases.specification.items.some(item =>
                item.toLowerCase().includes('target audience')
            )).toBe(true);
            expect(solution.phases.architecture.items.some(item =>
                item.toLowerCase().includes('campaign')
            )).toBe(true);
        });

        test('should include marketing-specific recommendations', async () => {
            const recommendations = app.generateRecommendations(['marketing']);

            expect(recommendations.some(rec =>
                rec.toLowerCase().includes('data-driven')
            )).toBe(true);
            expect(recommendations.some(rec =>
                rec.toLowerCase().includes('customer experience')
            )).toBe(true);
        });

        test('should generate marketing pseudocode patterns', () => {
            const pseudocode = app.generatePseudocodePhase(['marketing'], app.currentChallenge);

            expect(pseudocode.items.some(item =>
                item.includes('target_audience_defined')
            )).toBe(true);
            expect(pseudocode.items.some(item =>
                item.includes('marketing_channel')
            )).toBe(true);
        });
    });

    describe('Sales Expertise', () => {
        beforeEach(() => {
            app.selectedExpertise.clear();
            app.selectedExpertise.add('sales');
            app.currentChallenge = 'Optimize sales pipeline and reduce cycle time';
        });

        test('should generate sales-focused SPARC solution', async () => {
            const solution = await app.generateSparcSolution();

            expect(solution.expertise).toContain('sales');
            expect(solution.phases.specification.items.some(item =>
                item.toLowerCase().includes('customer journey')
            )).toBe(true);
            expect(solution.phases.architecture.items.some(item =>
                item.toLowerCase().includes('crm')
            )).toBe(true);
        });

        test('should include sales-specific recommendations', async () => {
            const recommendations = app.generateRecommendations(['sales']);

            expect(recommendations.some(rec =>
                rec.toLowerCase().includes('consultative selling')
            )).toBe(true);
            expect(recommendations.some(rec =>
                rec.toLowerCase().includes('qualification')
            )).toBe(true);
        });

        test('should generate sales pseudocode patterns', () => {
            const pseudocode = app.generatePseudocodePhase(['sales'], app.currentChallenge);

            expect(pseudocode.items.some(item =>
                item.includes('lead_qualified')
            )).toBe(true);
            expect(pseudocode.items.some(item =>
                item.includes('pipeline_velocity')
            )).toBe(true);
        });
    });

    describe('Learning & Development Expertise', () => {
        beforeEach(() => {
            app.selectedExpertise.clear();
            app.selectedExpertise.add('learning');
            app.currentChallenge = 'Create effective employee training program';
        });

        test('should generate learning-focused SPARC solution', async () => {
            const solution = await app.generateSparcSolution();

            expect(solution.expertise).toContain('learning');
            expect(solution.phases.specification.items.some(item =>
                item.toLowerCase().includes('learning objectives')
            )).toBe(true);
            expect(solution.phases.architecture.items.some(item =>
                item.toLowerCase().includes('lms')
            )).toBe(true);
        });

        test('should include learning-specific recommendations', async () => {
            const recommendations = app.generateRecommendations(['learning']);

            expect(recommendations.some(rec =>
                rec.toLowerCase().includes('learner-centered')
            )).toBe(true);
            expect(recommendations.some(rec =>
                rec.toLowerCase().includes('feedback')
            )).toBe(true);
        });

        test('should generate learning pseudocode patterns', () => {
            const pseudocode = app.generatePseudocodePhase(['learning'], app.currentChallenge);

            expect(pseudocode.items.some(item =>
                item.includes('learning_objective_met')
            )).toBe(true);
            expect(pseudocode.items.some(item =>
                item.includes('assess_competency')
            )).toBe(true);
        });
    });

    describe('Combined Expertise Areas', () => {
        test('should handle marketing + sales combination effectively', async () => {
            app.selectedExpertise.clear();
            app.selectedExpertise.add('marketing');
            app.selectedExpertise.add('sales');
            app.currentChallenge = 'Align marketing and sales for better lead conversion';

            const solution = await app.generateSparcSolution();

            expect(solution.expertise).toContain('marketing');
            expect(solution.expertise).toContain('sales');

            // Should combine specifications from both areas
            expect(solution.phases.specification.items.length).toBeGreaterThan(4);
            expect(solution.phases.specification.items.some(item =>
                item.toLowerCase().includes('target audience')
            )).toBe(true);
            expect(solution.phases.specification.items.some(item =>
                item.toLowerCase().includes('customer journey')
            )).toBe(true);
        });

        test('should handle sales + learning combination for sales training', async () => {
            app.selectedExpertise.clear();
            app.selectedExpertise.add('sales');
            app.selectedExpertise.add('learning');
            app.currentChallenge = 'Develop comprehensive sales training program';

            const solution = await app.generateSparcSolution();

            expect(solution.expertise).toContain('sales');
            expect(solution.expertise).toContain('learning');

            // Should include both sales process and learning elements
            expect(solution.phases.architecture.items.some(item =>
                item.toLowerCase().includes('crm') || item.toLowerCase().includes('sales')
            )).toBe(true);
            expect(solution.phases.architecture.items.some(item =>
                item.toLowerCase().includes('learning') || item.toLowerCase().includes('training')
            )).toBe(true);
        });

        test('should handle all three expertise areas comprehensively', async () => {
            app.selectedExpertise.clear();
            app.selectedExpertise.add('marketing');
            app.selectedExpertise.add('sales');
            app.selectedExpertise.add('learning');
            app.currentChallenge = 'Create integrated customer lifecycle management system';

            const solution = await app.generateSparcSolution();

            expect(solution.expertise).toHaveLength(3);
            expect(solution.expertise).toContain('marketing');
            expect(solution.expertise).toContain('sales');
            expect(solution.expertise).toContain('learning');

            // Should provide comprehensive recommendations
            expect(solution.recommendations.length).toBeGreaterThan(3);
            expect(solution.recommendations.length).toBeLessThanOrEqual(6);
        });
    });

    describe('Content Quality for Beginners', () => {
        test('should generate beginner-friendly marketing content', () => {
            const spec = app.generateSpecificationPhase(['marketing'], 'Start marketing campaign');

            // Check for beginner-friendly language
            expect(spec.items.every(item =>
                !item.includes('advanced') &&
                !item.includes('complex') &&
                item.length < 100 // Concise explanations
            )).toBe(true);
        });

        test('should provide actionable sales guidance', () => {
            const completion = app.generateCompletionPhase(['sales'], 'Improve sales process');

            expect(completion.items.every(item =>
                item.toLowerCase().includes('implement') ||
                item.toLowerCase().includes('establish') ||
                item.toLowerCase().includes('create') ||
                item.toLowerCase().includes('deploy')
            )).toBe(true);
        });

        test('should include clear learning objectives', () => {
            const spec = app.generateSpecificationPhase(['learning'], 'Create training program');

            expect(spec.items.some(item =>
                item.toLowerCase().includes('learning objectives') ||
                item.toLowerCase().includes('outcomes')
            )).toBe(true);
        });
    });
});