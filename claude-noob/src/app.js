/**
 * Claude-Flow Application - SPARC-Powered Expertise Assistant
 * Implements dynamic content generation based on expertise selection
 */

class ClaudeFlowApp {
    constructor() {
        this.selectedExpertise = new Set();
        this.currentChallenge = '';
        this.sparcPhases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
        this.loadingPhases = [
            'Analyzing your challenge...',
            'Applying Specification phase...',
            'Generating Pseudocode structure...',
            'Designing Architecture...',
            'Refining solution...',
            'Completing implementation...'
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        console.log('Claude-Flow App initialized with SPARC methodology');
    }

    bindEvents() {
        // Expertise selection
        document.querySelectorAll('.expertise-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleExpertiseChange(e));
        });

        // Challenge input
        const challengeInput = document.getElementById('challenge-input');
        challengeInput.addEventListener('input', (e) => this.handleChallengeInput(e));

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => this.generateSolution());

        // Action buttons
        document.getElementById('refine-btn')?.addEventListener('click', () => this.refineSolution());
        document.getElementById('new-challenge-btn')?.addEventListener('click', () => this.startNewChallenge());

        // Keyboard accessibility
        document.querySelectorAll('.expertise-card').forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const checkbox = card.querySelector('.expertise-checkbox');
                    checkbox.checked = !checkbox.checked;
                    const changeEvent = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(changeEvent);
                }
            });
        });
    }

    handleExpertiseChange(e) {
        const expertise = e.target.id;
        const card = e.target.closest('.expertise-card');

        console.log('HandleExpertiseChange called for:', expertise, 'checked:', e.target.checked);

        if (e.target.checked) {
            this.selectedExpertise.add(expertise);
            card.classList.add('selected');
        } else {
            this.selectedExpertise.delete(expertise);
            card.classList.remove('selected');
        }

        this.updateUI();
        console.log('Expertise selection updated:', Array.from(this.selectedExpertise));
        console.log('Selected expertise set size:', this.selectedExpertise.size);
    }

    handleChallengeInput(e) {
        this.currentChallenge = e.target.value.trim();
        const charCount = document.getElementById('char-count');
        charCount.textContent = e.target.value.length;

        // Update character count color based on limit
        if (e.target.value.length > 900) {
            charCount.style.color = '#ef4444';
        } else if (e.target.value.length > 700) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#666';
        }

        this.updateUI();
    }

    updateUI() {
        const generateBtn = document.getElementById('generate-btn');
        const hasExpertise = this.selectedExpertise.size > 0;
        const hasChallenge = this.currentChallenge.length > 10;

        generateBtn.disabled = !(hasExpertise && hasChallenge);

        // Update button text based on state
        const btnText = generateBtn.querySelector('.btn-text');
        if (!hasExpertise && !hasChallenge) {
            btnText.textContent = 'Select expertise and describe challenge';
        } else if (!hasExpertise) {
            btnText.textContent = 'Select your expertise areas';
        } else if (!hasChallenge) {
            btnText.textContent = 'Describe your challenge';
        } else {
            btnText.textContent = 'Generate SPARC Solution';
        }
    }

    async generateSolution() {
        if (this.selectedExpertise.size === 0 || !this.currentChallenge) return;

        this.showLoadingState();

        try {
            // Simulate SPARC processing phases
            await this.simulateSparcProcessing();

            const solution = await this.generateSparcSolution();
            this.displaySolution(solution);

        } catch (error) {
            console.error('Error generating solution:', error);
            this.showErrorState('Failed to generate solution. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('show');

        // Animate through loading phases
        let phaseIndex = 0;
        const loadingPhaseText = document.getElementById('loading-phase');

        const phaseInterval = setInterval(() => {
            if (phaseIndex < this.loadingPhases.length) {
                loadingPhaseText.textContent = this.loadingPhases[phaseIndex];
                phaseIndex++;
            } else {
                clearInterval(phaseInterval);
            }
        }, 800);

        // Store interval ID for cleanup
        this.loadingInterval = phaseInterval;
    }

    hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('show');

        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }
    }

    async simulateSparcProcessing() {
        // Simulate processing time for each SPARC phase
        const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];

        for (const phase of phases) {
            await this.delay(600 + Math.random() * 400); // Variable delay for realism
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generateSparcSolution() {
        const expertiseArray = Array.from(this.selectedExpertise);
        const expertiseContext = this.getExpertiseContext(expertiseArray);

        return {
            expertise: expertiseArray,
            challenge: this.currentChallenge,
            phases: this.generateSparcPhases(expertiseArray, this.currentChallenge),
            recommendations: this.generateRecommendations(expertiseArray),
            nextSteps: this.generateNextSteps(expertiseArray)
        };
    }

    getExpertiseContext(expertise) {
        const contexts = {
            marketing: {
                focus: 'Strategic marketing campaigns, brand positioning, and customer acquisition',
                sparcApproach: 'Campaign Architecture & Market Refinement',
                keywords: ['targeting', 'positioning', 'conversion', 'analytics', 'roi']
            },
            sales: {
                focus: 'Sales processes, lead generation, and conversion optimization',
                sparcApproach: 'Process Specification & Conversion Completion',
                keywords: ['pipeline', 'qualification', 'closing', 'crm', 'metrics']
            },
            learning: {
                focus: 'Training programs, skill development, and educational content creation',
                sparcApproach: 'Educational Architecture & Progressive Refinement',
                keywords: ['curriculum', 'assessment', 'engagement', 'outcomes', 'pedagogy']
            }
        };

        return expertise.map(exp => contexts[exp]).filter(Boolean);
    }

    generateSparcPhases(expertise, challenge) {
        const phases = {
            specification: this.generateSpecificationPhase(expertise, challenge),
            pseudocode: this.generatePseudocodePhase(expertise, challenge),
            architecture: this.generateArchitecturePhase(expertise, challenge),
            refinement: this.generateRefinementPhase(expertise, challenge),
            completion: this.generateCompletionPhase(expertise, challenge)
        };

        return phases;
    }

    generateSpecificationPhase(expertise, challenge) {
        const specifications = {
            marketing: [
                'Define target audience demographics and psychographics',
                'Establish clear marketing objectives and KPIs',
                'Identify primary and secondary marketing channels',
                'Set budget allocation and resource requirements'
            ],
            sales: [
                'Map customer journey and touchpoints',
                'Define qualification criteria and scoring',
                'Establish sales process stages and metrics',
                'Identify required tools and technology stack'
            ],
            learning: [
                'Define learning objectives and outcomes',
                'Identify target learner personas and needs',
                'Establish assessment criteria and methods',
                'Determine delivery modalities and technologies'
            ]
        };

        let items = [];
        expertise.forEach(exp => {
            if (specifications[exp]) {
                items = items.concat(specifications[exp]);
            }
        });

        return {
            title: 'Specification - Requirements Analysis',
            description: 'Clear definition of requirements, constraints, and success criteria',
            items: items.slice(0, 6) // Limit to most relevant items
        };
    }

    generatePseudocodePhase(expertise, challenge) {
        const pseudocodes = {
            marketing: [
                'IF target_audience_defined THEN create_messaging_framework',
                'FOR each marketing_channel DO optimize_content_strategy',
                'WHILE campaign_active DO monitor_and_adjust_metrics',
                'FUNCTION calculate_roi(cost, revenue) RETURN (revenue - cost) / cost'
            ],
            sales: [
                'IF lead_qualified THEN move_to_opportunity_stage',
                'FOR each prospect DO personalize_outreach_sequence',
                'WHILE negotiating DO address_objections_systematically',
                'FUNCTION calculate_pipeline_velocity(deals, avg_time) RETURN deals / avg_time'
            ],
            learning: [
                'IF learning_objective_met THEN progress_to_next_module',
                'FOR each learner DO adapt_content_to_learning_style',
                'WHILE course_active DO track_engagement_metrics',
                'FUNCTION assess_competency(skill_level, benchmark) RETURN skill_level >= benchmark'
            ]
        };

        let items = [];
        expertise.forEach(exp => {
            if (pseudocodes[exp]) {
                items = items.concat(pseudocodes[exp]);
            }
        });

        return {
            title: 'Pseudocode - Logical Framework',
            description: 'High-level logical structure and decision-making processes',
            items: items.slice(0, 8)
        };
    }

    generateArchitecturePhase(expertise, challenge) {
        const architectures = {
            marketing: [
                'Multi-channel campaign orchestration system',
                'Customer data platform (CDP) integration',
                'Marketing automation workflow engine',
                'Performance analytics and attribution modeling',
                'Content management and personalization layer'
            ],
            sales: [
                'CRM system with pipeline management',
                'Lead scoring and qualification engine',
                'Sales enablement content repository',
                'Communication and follow-up automation',
                'Revenue forecasting and reporting dashboard'
            ],
            learning: [
                'Learning management system (LMS) architecture',
                'Adaptive learning path engine',
                'Assessment and certification framework',
                'Social learning and collaboration tools',
                'Analytics and progress tracking system'
            ]
        };

        let items = [];
        expertise.forEach(exp => {
            if (architectures[exp]) {
                items = items.concat(architectures[exp]);
            }
        });

        return {
            title: 'Architecture - System Design',
            description: 'Comprehensive system design and component relationships',
            items: items.slice(0, 6)
        };
    }

    generateRefinementPhase(expertise, challenge) {
        const refinements = {
            marketing: [
                'A/B test messaging variations across segments',
                'Optimize conversion funnels based on analytics',
                'Refine targeting parameters using performance data',
                'Iterate creative assets based on engagement metrics',
                'Adjust budget allocation across high-performing channels'
            ],
            sales: [
                'Refine qualification criteria based on win rates',
                'Optimize outreach sequences using response rates',
                'Improve objection handling through pattern analysis',
                'Enhance proposal templates using success metrics',
                'Streamline handoff processes between teams'
            ],
            learning: [
                'Adapt content difficulty based on learner performance',
                'Optimize assessment questions using item analysis',
                'Refine learning paths using completion data',
                'Improve engagement through gamification elements',
                'Enhance accessibility based on learner feedback'
            ]
        };

        let items = [];
        expertise.forEach(exp => {
            if (refinements[exp]) {
                items = items.concat(refinements[exp]);
            }
        });

        return {
            title: 'Refinement - Optimization Process',
            description: 'Iterative improvement and optimization strategies',
            items: items.slice(0, 6)
        };
    }

    generateCompletionPhase(expertise, challenge) {
        const completions = {
            marketing: [
                'Launch integrated multi-channel campaign',
                'Implement comprehensive tracking and attribution',
                'Establish regular performance review cycles',
                'Create scaling playbooks for successful tactics',
                'Document lessons learned and best practices'
            ],
            sales: [
                'Deploy optimized sales process across team',
                'Implement performance monitoring dashboard',
                'Establish regular coaching and training programs',
                'Create standardized playbooks and templates',
                'Set up continuous improvement feedback loops'
            ],
            learning: [
                'Launch complete learning program with all modules',
                'Implement learner support and success systems',
                'Establish ongoing content maintenance processes',
                'Create instructor training and certification',
                'Deploy analytics and reporting infrastructure'
            ]
        };

        let items = [];
        expertise.forEach(exp => {
            if (completions[exp]) {
                items = items.concat(completions[exp]);
            }
        });

        return {
            title: 'Completion - Implementation & Launch',
            description: 'Final implementation, testing, and deployment strategies',
            items: items.slice(0, 5)
        };
    }

    generateRecommendations(expertise) {
        const recommendations = {
            marketing: [
                'Focus on data-driven decision making throughout implementation',
                'Prioritize customer experience and journey optimization',
                'Invest in marketing technology stack integration',
                'Build strong cross-functional collaboration processes'
            ],
            sales: [
                'Emphasize consultative selling and value proposition clarity',
                'Implement robust lead qualification processes',
                'Establish clear communication and follow-up protocols',
                'Focus on relationship building and long-term value creation'
            ],
            learning: [
                'Prioritize learner-centered design and engagement',
                'Implement continuous feedback and improvement cycles',
                'Focus on practical application and skill transfer',
                'Build sustainable content maintenance processes'
            ]
        };

        let items = [];
        expertise.forEach(exp => {
            if (recommendations[exp]) {
                items = items.concat(recommendations[exp]);
            }
        });

        return items.slice(0, 6);
    }

    generateNextSteps(expertise) {
        return [
            'Review and validate the SPARC-generated solution framework',
            'Prioritize implementation phases based on impact and feasibility',
            'Gather stakeholder feedback and refine approach as needed',
            'Create detailed project timeline with milestones and deliverables',
            'Establish success metrics and measurement framework',
            'Begin implementation starting with highest-priority components'
        ];
    }

    displaySolution(solution) {
        const outputContent = document.getElementById('output-content');
        const resultsSection = document.getElementById('results-section');

        outputContent.innerHTML = this.generateSolutionHTML(solution);
        resultsSection.style.display = 'block';

        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Animate phase indicators
        this.animatePhaseIndicators();

        console.log('Solution generated and displayed');
    }

    generateSolutionHTML(solution) {
        const expertiseLabels = {
            marketing: 'Marketing',
            sales: 'Sales',
            learning: 'Learning & Development'
        };

        let html = `
            <div class="solution-header">
                <p class="expertise-summary">
                    <strong>Applied Expertise:</strong>
                    ${solution.expertise.map(exp => expertiseLabels[exp]).join(', ')}
                </p>
                <p class="challenge-summary">
                    <strong>Challenge:</strong> "${solution.challenge}"
                </p>
            </div>
        `;

        // Generate SPARC phases
        Object.entries(solution.phases).forEach(([phase, data]) => {
            html += `
                <div class="sparc-section" data-phase="${phase}">
                    <h4>
                        <span class="phase-badge">${phase.charAt(0).toUpperCase()}</span>
                        ${data.title}
                    </h4>
                    <p>${data.description}</p>
                    <ul>
                        ${data.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        // Add recommendations
        html += `
            <div class="sparc-section recommendations">
                <h4>
                    <span class="phase-badge">💡</span>
                    Key Recommendations
                </h4>
                <ul>
                    ${solution.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;

        // Add next steps
        html += `
            <div class="sparc-section next-steps">
                <h4>
                    <span class="phase-badge">🚀</span>
                    Next Steps
                </h4>
                <ul>
                    ${solution.nextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        `;

        return html;
    }

    animatePhaseIndicators() {
        const phases = document.querySelectorAll('.phase-step');

        phases.forEach((phase, index) => {
            setTimeout(() => {
                phase.classList.add('active');
            }, index * 200);
        });
    }

    refineSolution() {
        // Create refinement prompt
        const refinementPrompt = prompt(
            'What specific aspect would you like to refine or expand upon?\n\n' +
            'Examples:\n' +
            '• Add more detail to a specific SPARC phase\n' +
            '• Focus on implementation timeline\n' +
            '• Include budget considerations\n' +
            '• Add risk mitigation strategies'
        );

        if (refinementPrompt && refinementPrompt.trim()) {
            const originalChallenge = this.currentChallenge.split('\n\nRefinement request:')[0];
            this.currentChallenge = `${originalChallenge}\n\nRefinement request: ${refinementPrompt.trim()}`;
            this.generateSolution();
        }
    }

    startNewChallenge() {
        // Reset form
        document.getElementById('challenge-input').value = '';
        document.getElementById('char-count').textContent = '0';
        this.currentChallenge = '';

        // Hide results
        document.getElementById('results-section').style.display = 'none';

        // Reset expertise selection
        document.querySelectorAll('.expertise-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.expertise-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.selectedExpertise.clear();

        this.updateUI();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        console.log('New challenge started');
    }

    showErrorState(message) {
        const outputContent = document.getElementById('output-content');
        const resultsSection = document.getElementById('results-section');

        outputContent.innerHTML = `
            <div class="error-state">
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="
                        margin-top: 1rem;
                        padding: 0.5rem 1rem;
                        background: #ef4444;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;

        resultsSection.style.display = 'block';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple initializations
    if (window.claudeFlowApp) {
        console.log('Claude-Flow App already initialized');
        return;
    }

    window.claudeFlowApp = new ClaudeFlowApp();

    // Run coordination hooks if available
    if (typeof window !== 'undefined' && window.performance) {
        console.log('Claude-Flow App loaded in', window.performance.now(), 'ms');
    }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClaudeFlowApp;
}