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
        name: "freelance.tsx",
        language: "typescript",
        content: `/**
 * Freelance Developer
 * Full-Stack Developer + DevOps
 * 2025 - Present
 * 
 * Building products from 0 to 1
 */

const experience = {
  company: "Freelance",
  role: "Full-Stack Developer + DevOps",
  duration: "2024 - Present",
  location: "Remote",
  
  responsibilities: [
    "Turning ideas into products",
    "Building products from 0 to 1",
    "Optimizing existing products",
    "Deploying and maintaining products",
    "Optimizing messy vibe coded projects",
  ],
  
  techStack: [
    "React", "Next.js", "TypeScript", "Node.js", "Plasmo(Browser Extension)",
    "PostgreSQL", "AWS", "Docker", "FastAPI", "Python", "Git", "Bash", "Linux"
  ]
};

export default experience;`
      },
      {
        name: "Study_Medic.tsx",
        language: "Javascript",
        content: `/**
 * Study Medic
 * Full-Stack Developer
 * 2023 - 2024
 * 
 * Builded in house products to automate operational tasks
 */

const experience = {
  company: "Study Medic",
  role: "Full-Stack Developer",
  duration: "2020 - 2022",
  location: "Thrissur, Kerala, India",
  
  responsibilities: [
    "Successfully delivering innovative projects on time, showcasing a commitment to quality and efficiency.",
    "Spearheading the development of dynamic web applications using the MERN stack (MongoDB, Express.js, React, and Node.js) at Study Medic.",
    "Collaborating closely with cross-functional teams to understand client requirements and translate them into responsive and user-friendly interfaces.",
    "Proactively identifying and resolving technical challenges to ensure smooth project progression."
  ],
  
  techStack: [
    "React", "Express.js", "MongoDB",
    "Node.js", "Firebase", "Vercel"
  ],
  
};

export default experience;`
      },
      {
        name: "Packapeer_Academy_Pvt_Ltd.tsx",
        language: "typescript",
        content: `/**
 * Packapeer Academy Pvt. Ltd.
 * Software Developer Intern
 * 2022 - 2023
 * 
 * Building solutions for diverse clients
 */

const experience = {
  role: "Mern Stack Developer Intern",
  duration: "2022 - 2023",
  location: "Kozhikode, Kerala, India",
  
  projects: [
    "Hiverr, Freelancing Website",
    "Foodbia, A Fully Functional Ecommerce Website for Food Delivery | Node js",
  ],
};

export default experience;`
      }
    ],
    defaultFile: "freelance.tsx"
  },

  projects: {
    title: "Projects",
    icon: "FolderGit2",
    files: [
      {
        name: "hiverr_ai.tsx",
        language: "typescript",
        content: `/**
 * Hiverr AI - Personal Assistant App
 * Cross-Platform AI Application
 * 
 * AI-powered task and event management through conversational flows
 */

const project = {
  name: "Hiverr AI - Personal Assistant App",
  type: "Cross-Platform Mobile Application",
  status: "Production",
  
  description: \`
    A sophisticated AI-powered personal assistant app that manages
    tasks and events through natural conversational flows and 
    intelligent automation.
  \`,
  
  features: [
    "Multi-mode AI chatbot (Ask, Agent, LLM modes)",
    "Ask Mode powered by Gemma model",
    "Agent Mode with Gemini + LangChain orchestration",
    "Voice-to-text transcription for hands-free input",
    "Event-driven workflows using Inngest",
    "Intelligent task and event management",
    "Natural language processing for commands"
  ],
  
  techStack: {
    mobile: ["React Native", "Expo"],
    backend: ["Node.js"],
    ai: ["Gemma", "Google GenAI", "LangChain"],
    automation: ["Inngest"]
  },
  
  highlights: [
    "Agentic workflows for seamless task creation",
    "Intelligent orchestration with LangChain",
    "Multi-modal interaction (voice, text, chat)"
  ]
};

export default project;`
      },
      {
        name: "ai_ticket_system.tsx",
        language: "typescript",
        content: `/**
 * AI-Powered Ticket Management System
 * Intelligent Automation Platform
 * 
 * Automated ticket handling with AI-driven workflows
 */

const project = {
  name: "AI-Powered Ticket Management System",
  type: "Enterprise Automation System",
  status: "Production",
  
  description: \`
    An intelligent ticket management system that leverages AI
    to auto-generate descriptions, prioritize issues, and assign
    tickets to the right moderators based on their skills.
  \`,
  
  features: [
    "Auto-generated issue descriptions using Gemini",
    "Intelligent priority assignment",
    "Skill-based moderator matching",
    "AI-agentic workflow automation with Inngest",
    "Event-driven ticket processing",
    "Smart classification and categorization",
    "Webhook integrations for real-time updates"
  ],
  
  techStack: {
    frontend: ["Next.js"],
    backend: ["Node.js"],
    ai: ["Gemini", "OpenAI"],
    automation: ["Inngest"],
    integration: ["Webhooks"]
  },
  
  impact: {
    automation: "90% reduction in manual ticket processing",
    accuracy: "95% correct priority assignment",
    efficiency: "3x faster ticket resolution"
  }
};

export default project;`
      },
      {
        name: "hiverr_meet.js",
        language: "javascript",
        content: `/**
 * Hiverr Meet - Video Conferencing Platform
 * Real-Time Communication Application
 * 
 * Google Meet alternative with screen sharing and group chat
 */

const project = {
  name: "Hiverr Meet - Video Conferencing",
  type: "Web Application",
  status: "Production",
  
  description: \`
    A feature-rich video conferencing platform offering
    functionalities similar to Google Meet, including
    video sharing, screen sharing, and real-time group chat.
  \`,
  
  features: [
    "High-quality video conferencing",
    "Screen sharing capabilities",
    "Real-time group chat",
    "Multi-participant support",
    "Video and audio controls",
    "Easy meeting links and invitations"
  ],
  
  techStack: {
    frontend: ["HTML", "JavaScript"],
    realtime: ["Agora Web SDK"],
    communication: ["WebRTC"]
  },
  
  capabilities: {
    videoQuality: "Up to 1080p",
    participants: "50+ concurrent users",
    latency: "< 200ms"
  }
};

export default project;`
      },
      {
        name: "hiverr_freelancing.tsx",
        language: "typescript",
        content: `/**
 * Hiverr - Freelancing Marketplace
 * Full-Stack Web Platform
 * 
 * Complete freelancing ecosystem with payments and communication
 */

const project = {
  name: "Hiverr - Freelancing Website",
  type: "Full-Stack Marketplace",
  status: "Production",
  
  description: \`
    A comprehensive freelancing platform connecting clients
    with skilled freelancers. Features integrated payments,
    real-time chat, and video conferencing capabilities.
  \`,
  
  features: [
    "Freelancer marketplace and job posting",
    "Razorpay payment integration",
    "Real-time chat with Socket.IO",
    "Video calls and screen sharing via Agora",
    "Rich text editor with Quill",
    "JWT authentication and authorization",
    "AI chatbot integration with Dialogflow",
    "Email notifications with Nodemailer",
    "Firebase integration"
  ],
  
  techStack: {
    frontend: ["React", "Redux", "Material UI", "Tailwind CSS"],
    backend: ["Node.js", "Express"],
    database: ["MongoDB", "Mongoose"],
    realtime: ["Socket.IO", "Agora"],
    payments: ["Razorpay"],
    other: ["JWT", "Quill", "Firebase", "Dialogflow", "Multer", "Formik"]
  },
  
  architecture: {
    pattern: "MVC",
    stateManagement: "Redux",
    fileUpload: "Multer",
    formHandling: "Formik"
  }
};

export default project;`
      },
      {
        name: "foodbia.js",
        language: "javascript",
        content: `/**
 * Foodbia - Food Delivery Marketplace
 * E-Commerce Platform
 * 
 * Complete food delivery ecosystem with admin dashboard
 */

const project = {
  name: "Foodbia - Food Delivery Website",
  type: "E-Commerce Platform",
  status: "Production",
  
  description: \`
    A comprehensive food delivery marketplace featuring
    product management, order processing, and a powerful
    admin dashboard for business analytics.
  \`,
  
  features: [
    "Complete food ordering system",
    "OTP verification for security",
    "Cart and wishlist management",
    "Coupon code integration",
    "Admin panel with analytics dashboard",
    "User management system",
    "Product catalog management",
    "Sales reports and analytics",
    "Secure payment processing"
  ],
  
  techStack: {
    backend: ["Node.js", "Express.js"],
    database: ["MongoDB", "Mongoose"],
    frontend: ["EJS"],
    architecture: ["MVC"],
    communication: ["Ajax", "Axios"],
    deployment: ["Nginx", "AWS EC2"]
  },
  
  infrastructure: {
    hosting: "AWS EC2",
    webServer: "Nginx",
    database: "MongoDB Atlas"
  },
  
  adminFeatures: [
    "User management and analytics",
    "Product CRUD operations",
    "Order tracking and management",
    "Sales reports and insights",
    "Coupon management system"
  ]
};

export default project;`
      }
    ],
    defaultFile: "hiverr_ai.tsx"
  },

  about: {
    title: "About Me",
    icon: "User",
    files: [
      {
        name: "README.md",
        language: "markdown",
        content: `# Hello, World!

I'm a **Full-Stack Developer** passionate about building human-architected, machine-written software.

## Who I Am

\`\`\`
const developer = {
  code: ["TypeScript", "JavaScript", "Python", "C#", "Java"],
  technologies: {
    frontend: ["React", "Next.js", "Svelte", "HTML", "CSS"],
    backend: ["Express.js", "FastAPI"],
    database: ["PostgreSQL", "MongoDB"],
    cloud: ["AWS", "Vercel", "Netlify", "Render"]
  },
  currentFocus: "Building human-architected, machine-written software",
  funFact: "I debug with console.log and I'm not ashamed"
};
\`\`\`

## My Philosophy

> "The **vibe** is just a suggestion. The validation is where the real engineering happens."

I believe in:
- Validated Architecture
- Latency-Aware Intelligence
- Problem Solving
- Continuous Learning
- Human-AI Orchestration
- Least Operation Principle

## Beyond Code

When I'm not coding, you'll find me:
- Reading tech blogs and documentation
- Perfecting my coffee brewing technique
- Listening to podcasts or music
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
      "apis": ["REST", "GraphQL"]
    },
    "devops": {
      "cloud": ["AWS", "Vercel", "Netlify"],
      "containers": ["Docker"],
      "ci_cd": ["GitHub Actions"]
    }
  },
  "soft_skills": [
    "Problem Solving",
    "Learning",
    "Team Leadership",
    "Mentoring",
    "Communication",
    "Adaptability"
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
  
  headline: "Focuses on business outcomes and ROI.",
  
  coreStrengths: [
    {
      title: "I don’t just build features",
      description: \`
        As a Value-Focused Developer, I bridge the gap between technical architecture and product ROI.
      \`
    },
    {
      title: "Radical Adaptability: Thriving in the Startup "Pivot"",
      description: \`
       I am built for the high-velocity environment of a startup.
       My workflow is Frontier-Native, meaning I don't just adapt to new tools—I orchestrate them to keep the company lean
      \`
    },
    {
      title: "Full-Stack Ownership: Bridging the "Zero-to-One" Gap",
      description: \`
       I bring a founder’s mindset to every line of code;
       I don't just wait for tickets;
       I proactively identify technical risks and adapt my workflow to ensure the product remains scalable and the user experience stays seamless during rapid pivots;
      \`
    },
    {
      title: "Team Player & Mentor",
      description: \`
        I elevate the entire team through knowledge sharing,
        code reviews, and mentorship.
      \`
    }
  ],
  
  availability: {
    type: "Open to opportunities",
    preference: ["Full-time", "Contract", "Freelance"],
    remote: true,
    timezone: "Flexible"
  }
};

export default whyHireMe;`
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
  34
  channels: {
    email: {
      address: "hidash920@gmail.com",
    },
    
    linkedin: {
      url: "https://www.linkedin.com/in/muhammed-hidash-74144a228/",
      status: "Open to connect"
    },
    
    github: {
      url: "https://github.com/Hidash-broto",
    },
    
    instagram: {
      handle: "@hidashtechtalks",
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
  
  callToAction: "Let's build something amazing together!"
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
      "notice_period": "Immediate"
    },
    "contract": {
      "available": true,
    },
    "freelance": {
      "available": true,
      "project_types": ["Web Apps", "APIs", "Consulting", "Mobile Apps"],
      "hourly_available": true
    }
  }
}
`
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
