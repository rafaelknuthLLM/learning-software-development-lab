/**
 * SPARC Framework Data and Templates
 * Contains detailed SPARC methodology information and templates
 */

const SPARC_METHODOLOGY = {
    phases: {
        specification: {
            name: 'Specification',
            description: 'Clear definition of requirements, constraints, and success criteria',
            icon: 'S',
            color: '#3b82f6',
            objectives: [
                'Define clear, measurable requirements',
                'Identify constraints and limitations',
                'Establish success criteria and KPIs',
                'Document assumptions and dependencies',
                'Validate requirements with stakeholders'
            ],
            deliverables: [
                'Requirements specification document',
                'Acceptance criteria definitions',
                'Constraint analysis',
                'Success metrics framework'
            ]
        },
        pseudocode: {
            name: 'Pseudocode',
            description: 'High-level logical structure and decision-making processes',
            icon: 'P',
            color: '#8b5cf6',
            objectives: [
                'Design logical flow and decision points',
                'Define process sequences and conditions',
                'Identify key algorithms and logic',
                'Plan data flow and transformations',
                'Structure problem-solving approach'
            ],
            deliverables: [
                'Pseudocode algorithms',
                'Process flow diagrams',
                'Decision trees',
                'Logic validation scenarios'
            ]
        },
        architecture: {
            name: 'Architecture',
            description: 'Comprehensive system design and component relationships',
            icon: 'A',
            color: '#10b981',
            objectives: [
                'Design system architecture and components',
                'Define interfaces and integrations',
                'Plan scalability and performance',
                'Design security and compliance measures',
                'Create technical specifications'
            ],
            deliverables: [
                'System architecture diagrams',
                'Component specifications',
                'Integration design',
                'Technical documentation'
            ]
        },
        refinement: {
            name: 'Refinement',
            description: 'Iterative improvement and optimization strategies',
            icon: 'R',
            color: '#f59e0b',
            objectives: [
                'Optimize performance and efficiency',
                'Improve user experience and usability',
                'Enhance security and reliability',
                'Refine based on feedback and testing',
                'Implement continuous improvement'
            ],
            deliverables: [
                'Optimization recommendations',
                'Performance improvements',
                'User experience enhancements',
                'Quality assurance results'
            ]
        },
        completion: {
            name: 'Completion',
            description: 'Final implementation, testing, and deployment strategies',
            icon: 'C',
            color: '#ef4444',
            objectives: [
                'Finalize implementation and testing',
                'Prepare deployment and rollout',
                'Create documentation and training',
                'Establish monitoring and support',
                'Plan maintenance and updates'
            ],
            deliverables: [
                'Complete implementation',
                'Deployment package',
                'User documentation',
                'Support procedures'
            ]
        }
    },

    expertiseTemplates: {
        marketing: {
            name: 'Marketing',
            focus: 'Strategic marketing campaigns, brand positioning, and customer acquisition',
            sparcApproach: 'Campaign Architecture & Market Refinement',
            keyAreas: [
                'Customer segmentation and targeting',
                'Brand positioning and messaging',
                'Multi-channel campaign orchestration',
                'Performance measurement and optimization',
                'Customer journey mapping',
                'Content strategy and creation'
            ],
            commonChallenges: [
                'Low conversion rates',
                'Poor lead quality',
                'Ineffective messaging',
                'Budget allocation optimization',
                'Attribution modeling',
                'Customer acquisition cost reduction'
            ],
            sparcTemplates: {
                specification: [
                    'Define target audience demographics and psychographics',
                    'Establish clear marketing objectives and KPIs',
                    'Identify primary and secondary marketing channels',
                    'Set budget allocation and resource requirements',
                    'Document brand guidelines and messaging framework',
                    'Specify campaign timeline and milestones'
                ],
                pseudocode: [
                    'IF target_audience_defined THEN create_messaging_framework',
                    'FOR each marketing_channel DO optimize_content_strategy',
                    'WHILE campaign_active DO monitor_and_adjust_metrics',
                    'IF conversion_rate < threshold THEN analyze_and_optimize',
                    'FUNCTION calculate_roi(cost, revenue) RETURN (revenue - cost) / cost',
                    'WHEN lead_generated THEN qualify_and_score_lead'
                ],
                architecture: [
                    'Multi-channel campaign orchestration system',
                    'Customer data platform (CDP) integration',
                    'Marketing automation workflow engine',
                    'Performance analytics and attribution modeling',
                    'Content management and personalization layer',
                    'Lead scoring and qualification system'
                ],
                refinement: [
                    'A/B test messaging variations across segments',
                    'Optimize conversion funnels based on analytics',
                    'Refine targeting parameters using performance data',
                    'Iterate creative assets based on engagement metrics',
                    'Adjust budget allocation across high-performing channels',
                    'Enhance personalization using behavioral data'
                ],
                completion: [
                    'Launch integrated multi-channel campaign',
                    'Implement comprehensive tracking and attribution',
                    'Establish regular performance review cycles',
                    'Create scaling playbooks for successful tactics',
                    'Document lessons learned and best practices',
                    'Set up automated reporting and alerts'
                ]
            }
        },

        sales: {
            name: 'Sales',
            focus: 'Sales processes, lead generation, and conversion optimization',
            sparcApproach: 'Process Specification & Conversion Completion',
            keyAreas: [
                'Lead generation and qualification',
                'Sales process optimization',
                'Customer relationship management',
                'Conversion rate improvement',
                'Sales team training and enablement',
                'Performance analytics and forecasting'
            ],
            commonChallenges: [
                'Low lead conversion rates',
                'Long sales cycles',
                'Poor lead quality',
                'Ineffective sales processes',
                'Inadequate follow-up',
                'Difficulty in closing deals'
            ],
            sparcTemplates: {
                specification: [
                    'Map customer journey and touchpoints',
                    'Define qualification criteria and scoring',
                    'Establish sales process stages and metrics',
                    'Identify required tools and technology stack',
                    'Set sales targets and quotas',
                    'Document objection handling procedures'
                ],
                pseudocode: [
                    'IF lead_qualified THEN move_to_opportunity_stage',
                    'FOR each prospect DO personalize_outreach_sequence',
                    'WHILE negotiating DO address_objections_systematically',
                    'IF prospect_engaged THEN schedule_follow_up',
                    'FUNCTION calculate_pipeline_velocity(deals, avg_time) RETURN deals / avg_time',
                    'WHEN opportunity_stalled THEN trigger_re_engagement'
                ],
                architecture: [
                    'CRM system with pipeline management',
                    'Lead scoring and qualification engine',
                    'Sales enablement content repository',
                    'Communication and follow-up automation',
                    'Revenue forecasting and reporting dashboard',
                    'Integration with marketing automation'
                ],
                refinement: [
                    'Refine qualification criteria based on win rates',
                    'Optimize outreach sequences using response rates',
                    'Improve objection handling through pattern analysis',
                    'Enhance proposal templates using success metrics',
                    'Streamline handoff processes between teams',
                    'Personalize approach based on customer data'
                ],
                completion: [
                    'Deploy optimized sales process across team',
                    'Implement performance monitoring dashboard',
                    'Establish regular coaching and training programs',
                    'Create standardized playbooks and templates',
                    'Set up continuous improvement feedback loops',
                    'Launch revenue forecasting system'
                ]
            }
        },

        learning: {
            name: 'Learning & Development',
            focus: 'Training programs, skill development, and educational content creation',
            sparcApproach: 'Educational Architecture & Progressive Refinement',
            keyAreas: [
                'Curriculum design and development',
                'Learning experience optimization',
                'Assessment and evaluation',
                'Skill gap analysis',
                'Training delivery methods',
                'Learning analytics and insights'
            ],
            commonChallenges: [
                'Low learner engagement',
                'Poor knowledge retention',
                'Ineffective training methods',
                'Lack of practical application',
                'Measuring learning outcomes',
                'Scalability of training programs'
            ],
            sparcTemplates: {
                specification: [
                    'Define learning objectives and outcomes',
                    'Identify target learner personas and needs',
                    'Establish assessment criteria and methods',
                    'Determine delivery modalities and technologies',
                    'Set engagement and completion targets',
                    'Document accessibility requirements'
                ],
                pseudocode: [
                    'IF learning_objective_met THEN progress_to_next_module',
                    'FOR each learner DO adapt_content_to_learning_style',
                    'WHILE course_active DO track_engagement_metrics',
                    'IF performance_below_threshold THEN provide_additional_support',
                    'FUNCTION assess_competency(skill_level, benchmark) RETURN skill_level >= benchmark',
                    'WHEN module_completed THEN update_learner_progress'
                ],
                architecture: [
                    'Learning management system (LMS) architecture',
                    'Adaptive learning path engine',
                    'Assessment and certification framework',
                    'Social learning and collaboration tools',
                    'Analytics and progress tracking system',
                    'Content authoring and management platform'
                ],
                refinement: [
                    'Adapt content difficulty based on learner performance',
                    'Optimize assessment questions using item analysis',
                    'Refine learning paths using completion data',
                    'Improve engagement through gamification elements',
                    'Enhance accessibility based on learner feedback',
                    'Personalize content delivery using learning analytics'
                ],
                completion: [
                    'Launch complete learning program with all modules',
                    'Implement learner support and success systems',
                    'Establish ongoing content maintenance processes',
                    'Create instructor training and certification',
                    'Deploy analytics and reporting infrastructure',
                    'Set up continuous curriculum improvement'
                ]
            }
        }
    },

    crossFunctionalTemplates: {
        marketingSales: {
            name: 'Marketing + Sales Alignment',
            focus: 'Integrated lead generation and conversion optimization',
            sparcTemplates: {
                specification: [
                    'Align marketing qualified lead (MQL) and sales qualified lead (SQL) definitions',
                    'Establish lead handoff processes and criteria',
                    'Create unified customer journey mapping',
                    'Define shared metrics and attribution models'
                ],
                architecture: [
                    'Integrated CRM and marketing automation platform',
                    'Unified lead scoring and qualification system',
                    'Shared reporting and analytics dashboard',
                    'Seamless data flow between marketing and sales tools'
                ]
            }
        },

        salesLearning: {
            name: 'Sales + Learning & Development',
            focus: 'Sales team training and performance optimization',
            sparcTemplates: {
                specification: [
                    'Identify sales skill gaps and training needs',
                    'Define competency frameworks for different sales roles',
                    'Establish performance improvement metrics',
                    'Create ongoing coaching and development plans'
                ],
                architecture: [
                    'Sales training LMS with performance tracking',
                    'Role-play simulation and practice platforms',
                    'Sales coaching and mentorship programs',
                    'Performance analytics and skill assessment tools'
                ]
            }
        },

        marketingLearning: {
            name: 'Marketing + Learning & Development',
            focus: 'Educational content marketing and customer training',
            sparcTemplates: {
                specification: [
                    'Develop educational content marketing strategy',
                    'Create customer onboarding and training programs',
                    'Design thought leadership and expertise positioning',
                    'Establish educational content distribution channels'
                ],
                architecture: [
                    'Educational content management system',
                    'Customer training and certification platform',
                    'Knowledge base and self-service portal',
                    'Educational email marketing automation'
                ]
            }
        }
    },

    industrySpecificTemplates: {
        technology: {
            focus: 'Tech product marketing, developer relations, and technical training',
            commonUseCases: [
                'Developer onboarding and documentation',
                'Product adoption and user engagement',
                'Technical content marketing',
                'API and integration training'
            ]
        },
        healthcare: {
            focus: 'Healthcare marketing compliance, medical training, and patient education',
            commonUseCases: [
                'Regulatory compliant marketing campaigns',
                'Medical professional training programs',
                'Patient education and engagement',
                'Healthcare sales process optimization'
            ]
        },
        finance: {
            focus: 'Financial services marketing, compliance training, and client education',
            commonUseCases: [
                'Regulatory compliance training',
                'Client onboarding and education',
                'Financial product marketing',
                'Risk management training'
            ]
        },
        ecommerce: {
            focus: 'E-commerce optimization, customer experience, and conversion training',
            commonUseCases: [
                'Conversion rate optimization',
                'Customer service training',
                'Product marketing and positioning',
                'Affiliate and partner training'
            ]
        }
    }
};

const SPARC_BEST_PRACTICES = {
    specification: [
        'Use SMART criteria for all objectives',
        'Involve all stakeholders in requirement gathering',
        'Document assumptions and constraints clearly',
        'Validate requirements before proceeding',
        'Create measurable acceptance criteria'
    ],
    pseudocode: [
        'Focus on logic, not implementation details',
        'Use clear, understandable language',
        'Include error handling and edge cases',
        'Validate logic with stakeholders',
        'Keep it technology-agnostic'
    ],
    architecture: [
        'Design for scalability and flexibility',
        'Consider security and compliance early',
        'Plan for integration and interoperability',
        'Document architectural decisions',
        'Consider performance and reliability'
    ],
    refinement: [
        'Base improvements on data and feedback',
        'Prioritize high-impact optimizations',
        'Test changes systematically',
        'Document all modifications',
        'Maintain version control'
    ],
    completion: [
        'Validate against original requirements',
        'Conduct thorough testing',
        'Prepare comprehensive documentation',
        'Plan deployment and rollback procedures',
        'Establish monitoring and maintenance'
    ]
};

// Global access for the application
window.SPARC_DATA = {
    SPARC_METHODOLOGY,
    SPARC_BEST_PRACTICES
};