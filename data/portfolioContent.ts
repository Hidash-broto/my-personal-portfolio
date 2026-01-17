export interface FileItem {
    name: string;
    language: string;
    content: string;
}

export interface Category {
    title: string;
    icon: string;
    files: FileItem[];
    defaultFile: string;
}

export const portfolioContent: Record<string, Category> = {
    experience: {
        title: "Experience",
        icon: "Briefcase",
        files: [
            {
                name: "tech_corp.tsx",
                language: "typescript",
                content: `/**
 * Tech Corp Inc.
 * Senior Full-Stack Developer
 * 2022 - Present
 * 
 * Leading development of enterprise-scale applications
 */

const experience = {
  company: "Tech Corp Inc.",
  role: "Senior Full-Stack Developer",
  duration: "2022 - Present",
  location: "San Francisco, CA",
  
  responsibilities: [
    "Lead a team of 5 developers on microservices architecture",
    "Reduced API response time by 60% through optimization",
    "Implemented CI/CD pipelines with 99.9% deployment success rate",
    "Mentored junior developers in React and TypeScript best practices"
  ],
  
  techStack: [
    "React", "Next.js", "TypeScript", "Node.js",
    "PostgreSQL", "Redis", "AWS", "Docker"
  ],
  
  achievements: [
    "🏆 Promoted to Senior Developer within 8 months",
    "📈 Increased test coverage from 45% to 92%",
    "🚀 Delivered 3 major product launches on schedule"
  ]
};

export default experience;`
            },
            {
                name: "startup_xyz.tsx",
                language: "typescript",
                content: `/**
 * Startup XYZ
 * Full-Stack Developer
 * 2020 - 2022
 * 
 * Building innovative products from 0 to 1
 */

const experience = {
  company: "Startup XYZ",
  role: "Full-Stack Developer",
  duration: "2020 - 2022",
  location: "Remote",
  
  responsibilities: [
    "Built core product features serving 50K+ users",
    "Designed and implemented RESTful APIs",
    "Integrated third-party payment and auth systems",
    "Collaborated directly with founders on product strategy"
  ],
  
  techStack: [
    "React", "Express.js", "MongoDB",
    "Stripe", "Firebase", "Vercel"
  ],
  
  achievements: [
    "🎯 First engineering hire - built foundation",
    "💰 Helped secure Series A funding with MVP",
    "⚡ Reduced page load time by 70%"
  ]
};

export default experience;`
            },
            {
                name: "freelance_work.tsx",
                language: "typescript",
                content: `/**
 * Freelance Developer
 * 2018 - 2020
 * 
 * Building solutions for diverse clients
 */

const experience = {
  role: "Freelance Full-Stack Developer",
  duration: "2018 - 2020",
  location: "Worldwide (Remote)",
  
  clients: [
    "E-commerce businesses",
    "Healthcare startups",
    "Educational platforms",
    "Local businesses"
  ],
  
  projects: [
    "Custom CMS for publishing company",
    "Inventory management system",
    "Online booking platforms",
    "Portfolio websites & landing pages"
  ],
  
  skills: [
    "Client communication",
    "Project estimation",
    "End-to-end delivery",
    "Long-term maintenance"
  ]
};

export default experience;`
            }
        ],
        defaultFile: "tech_corp.tsx"
    },

    projects: {
        title: "Projects",
        icon: "FolderGit2",
        files: [
            {
                name: "ecommerce_platform.tsx",
                language: "typescript",
                content: `/**
 * E-Commerce Platform
 * Full-Stack Application
 * 
 * Modern shopping experience with real-time features
 */

const project = {
  name: "ShopFlow - E-Commerce Platform",
  type: "Full-Stack Application",
  status: "Production",
  
  description: \`
    A modern e-commerce platform featuring real-time inventory,
    AI-powered recommendations, and seamless checkout experience.
  \`,
  
  features: [
    "🛒 Real-time cart synchronization",
    "🤖 AI product recommendations",
    "💳 Multiple payment gateways (Stripe, PayPal)",
    "📦 Order tracking with live updates",
    "📊 Admin dashboard with analytics"
  ],
  
  techStack: {
    frontend: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    backend: ["Node.js", "Express", "PostgreSQL", "Redis"],
    infrastructure: ["AWS", "Docker", "GitHub Actions"]
  },
  
  metrics: {
    users: "10,000+",
    uptime: "99.9%",
    loadTime: "< 1.5s"
  },
  
  links: {
    demo: "https://shopflow.demo.com",
    github: "https://github.com/user/shopflow"
  }
};

export default project;`
            },
            {
                name: "ai_assistant.py",
                language: "python",
                content: `"""
AI Code Assistant
Machine Learning Project

Intelligent coding companion powered by LLMs
"""

project = {
    "name": "CodeMate - AI Assistant",
    "type": "Machine Learning Application",
    "status": "Beta",
    
    "description": """
        An AI-powered coding assistant that provides
        intelligent code suggestions, refactoring help,
        and documentation generation.
    """,
    
    "features": [
        "💡 Context-aware code completion",
        "🔄 Automated refactoring suggestions",
        "📝 Docstring generation",
        "🐛 Bug detection and fixes",
        "🧪 Test case generation"
    ],
    
    "tech_stack": {
        "ml": ["Python", "PyTorch", "Transformers"],
        "backend": ["FastAPI", "PostgreSQL"],
        "deployment": ["Docker", "Kubernetes"]
    },
    
    "model_info": {
        "base": "CodeLlama-7B",
        "fine_tuned": True,
        "training_data": "500K code samples"
    }
}
`
            },
            {
                name: "realtime_dashboard.tsx",
                language: "typescript",
                content: `/**
 * Real-Time Analytics Dashboard
 * Data Visualization Project
 * 
 * Live metrics with interactive charts
 */

const project = {
  name: "MetricsHub - Analytics Dashboard",
  type: "Data Visualization",
  status: "Production",
  
  description: \`
    Real-time analytics dashboard for monitoring business metrics
    with interactive visualizations and alerting capabilities.
  \`,
  
  features: [
    "📊 Real-time data streaming via WebSockets",
    "📈 Interactive D3.js visualizations",
    "🔔 Custom alert thresholds",
    "📱 Responsive design for all devices",
    "🔐 Role-based access control"
  ],
  
  techStack: {
    frontend: ["React", "D3.js", "Socket.io", "Tailwind CSS"],
    backend: ["Node.js", "Redis Streams", "TimescaleDB"],
    monitoring: ["Grafana", "Prometheus"]
  },
  
  performance: {
    dataPoints: "1M+ per day",
    latency: "< 50ms",
    concurrent: "500+ users"
  }
};

export default project;`
            }
        ],
        defaultFile: "ecommerce_platform.tsx"
    },

    about: {
        title: "About Me",
        icon: "User",
        files: [
            {
                name: "README.md",
                language: "markdown",
                content: `# 👋 Hello, World!

I'm a **Full-Stack Developer** passionate about building
exceptional digital experiences.

## Who I Am

\`\`\`
const developer = {
  code: ["TypeScript", "Python", "Go"],
  technologies: {
    frontend: ["React", "Next.js", "Vue"],
    backend: ["Node.js", "FastAPI", "Go"],
    database: ["PostgreSQL", "MongoDB", "Redis"],
    cloud: ["AWS", "GCP", "Vercel"]
  },
  currentFocus: "Building scalable web applications",
  funFact: "I debug with console.log and I'm not ashamed 😄"
};
\`\`\`

## My Philosophy

> "Write code that humans can read, not just machines."

I believe in:
- 🎯 Clean, maintainable code
- 🚀 Performance-first development
- 🤝 Collaborative problem solving
- 📚 Continuous learning

## Beyond Code

When I'm not coding, you'll find me:
- 📖 Reading tech blogs and documentation
- 🎮 Exploring indie games
- ☕ Perfecting my coffee brewing technique
- 🌍 Contributing to open source
`
            },
            {
                name: "skills.json",
                language: "json",
                content: `{
  "technical_skills": {
    "languages": {
      "expert": ["TypeScript", "JavaScript", "Python"],
      "proficient": ["Go", "Rust", "SQL"],
      "familiar": ["Java", "C++"]
    },
    "frontend": {
      "frameworks": ["React", "Next.js", "Vue.js"],
      "styling": ["Tailwind CSS", "Styled Components", "SASS"],
      "state": ["Redux", "Zustand", "React Query"]
    },
    "backend": {
      "frameworks": ["Node.js", "Express", "FastAPI", "Gin"],
      "databases": ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
      "apis": ["REST", "GraphQL", "gRPC"]
    },
    "devops": {
      "cloud": ["AWS", "GCP", "Vercel", "Netlify"],
      "containers": ["Docker", "Kubernetes"],
      "ci_cd": ["GitHub Actions", "GitLab CI", "Jenkins"]
    }
  },
  "soft_skills": [
    "Problem Solving",
    "Team Leadership",
    "Technical Writing",
    "Mentoring",
    "Agile/Scrum"
  ]
}`
            }
        ],
        defaultFile: "README.md"
    },

    whyHireMe: {
        title: "Why Hire Me",
        icon: "Rocket",
        files: [
            {
                name: "value_proposition.tsx",
                language: "typescript",
                content: `/**
 * Why You Should Hire Me
 * The Value I Bring to Your Team
 */

const whyHireMe = {
  
  headline: "I Don't Just Write Code, I Solve Problems",
  
  coreStrengths: [
    {
      title: "🚀 Ship Fast, Ship Quality",
      description: \`
        I understand that speed matters in business.
        My code is production-ready, well-tested,
        and delivered on time.
      \`
    },
    {
      title: "🧠 Full-Stack Versatility",
      description: \`
        From pixel-perfect UIs to optimized database queries,
        I handle the entire stack. One less handoff,
        faster delivery.
      \`
    },
    {
      title: "📈 Business-Minded Developer",
      description: \`
        I don't just build features, I understand WHY.
        Every line of code serves a business goal.
      \`
    },
    {
      title: "🤝 Team Player & Mentor",
      description: \`
        I elevate the entire team through knowledge sharing,
        code reviews, and mentorship.
      \`
    }
  ],
  
  metrics: {
    projectsDelivered: "50+",
    codeReviewsCompleted: "500+",
    uptime: "99.99%",
    clientSatisfaction: "100%"
  },
  
  availability: {
    type: "Open to opportunities",
    preference: ["Full-time", "Contract", "Freelance"],
    remote: true,
    timezone: "Flexible"
  }
};

export default whyHireMe;`
            },
            {
                name: "testimonials.json",
                language: "json",
                content: `{
  "testimonials": [
    {
      "quote": "One of the most talented developers I've worked with. Delivers exceptional quality consistently.",
      "author": "CTO, Tech Startup",
      "rating": 5
    },
    {
      "quote": "Not just technically excellent, but a great communicator who truly understands our needs.",
      "author": "Product Manager, Enterprise Co",
      "rating": 5
    },
    {
      "quote": "Transformed our legacy codebase into a modern, maintainable system. Highly recommend!",
      "author": "Engineering Lead, SaaS Company",
      "rating": 5
    }
  ],
  
  "companies_worked_with": [
    "Startups (Seed to Series C)",
    "Mid-size tech companies",
    "Enterprise clients",
    "Digital agencies"
  ],
  
  "industries": [
    "E-commerce",
    "FinTech",
    "HealthTech",
    "EdTech",
    "SaaS"
  ]
}`
            }
        ],
        defaultFile: "value_proposition.tsx"
    },

    contact: {
        title: "Contact",
        icon: "Mail",
        files: [
            {
                name: "contact_me.tsx",
                language: "typescript",
                content: `/**
 * Let's Connect!
 * I'm always open to new opportunities
 */

const contact = {
  
  message: \`
    Whether you have a project in mind, 
    a job opportunity, or just want to say hi,
    I'd love to hear from you!
  \`,
  
  channels: {
    email: {
      address: "hello@developer.com",
      responseTime: "Within 24 hours"
    },
    
    linkedin: {
      url: "linkedin.com/in/developer",
      status: "Open to connect"
    },
    
    github: {
      url: "github.com/developer",
      openSource: true
    },
    
    twitter: {
      handle: "@developer",
      dms: "Open"
    }
  },
  
  availability: {
    freelance: true,
    fullTime: true,
    consulting: true,
    mentoring: true
  },
  
  preferredProjects: [
    "Challenging technical problems",
    "Products with real impact",
    "Teams that value quality",
    "Opportunities to learn & grow"
  ],
  
  callToAction: "Let's build something amazing together! 🚀"
};

export default contact;`
            },
            {
                name: "availability.json",
                language: "json",
                content: `{
  "current_status": "Available for new projects",
  
  "engagement_types": {
    "full_time": {
      "available": true,
      "preferences": ["Remote", "Hybrid"],
      "notice_period": "2 weeks"
    },
    "contract": {
      "available": true,
      "min_duration": "3 months",
      "rate": "Competitive"
    },
    "freelance": {
      "available": true,
      "project_types": ["Web Apps", "APIs", "Consulting"],
      "hourly_available": true
    }
  },
  
  "response_times": {
    "email": "< 24 hours",
    "linkedin": "< 48 hours"
  },
  
  "meeting_availability": {
    "timezone": "Flexible",
    "scheduling": "Calendly link available",
    "preferred_times": "Weekdays, business hours"
  }
}`
            }
        ],
        defaultFile: "contact_me.tsx"
    }
};

export const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
        'tsx': 'typescript',
        'ts': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'json': 'json',
        'md': 'markdown',
    };
    return languageMap[ext || ''] || 'plaintext';
};
