// All editable site content lives here.
// Add `img: 'assets/...'` to a project or moment to show a real screenshot/photo.

export const projects = [
  {
    slug: 'govnavai',
    title: 'GovNavAI',
    category: 'AI Engineering · 2nd Place · DHACK \'26',
    featured: true,
    desc: 'An AI-powered multilingual citizen assistance platform that helps Sri Lankans navigate government services with verified guidance, document checklists, pre-filled forms and office navigation. GovNavAI placed 2nd among 150+ teams in the inter-university DHACK \'26 competition.',
    tags: ['2nd Place', '150+ Teams', 'Inter-University', 'DHACK \'26', 'Team ByteMe', 'AI Assistant'],
  },
  {
    slug: 'cctv-suspicious-behavior',
    title: 'AI-Powered Theft & Suspicious Behavior Detection',
    category: 'Machine Learning · Computer Vision',
    featured: true,
    desc: 'An assistive CCTV intelligence platform that detects and tracks people, analyzes movement and pose features, scores suspicious behavior, and presents explainable alerts for human review.',
    tags: ['YOLO', 'Computer Vision', 'FastAPI', 'Next.js', 'Explainable Alerts'],
    github: 'https://github.com/MohamedSharfan/Theft-Suspicious-Behavior-Detection-CCTV-AI-',
  },
  {
    slug: 'civicflow',
    title: 'CivicFlow',
    category: 'Civic Technology · Community Platform',
    featured: true,
    desc: 'A community issue reporting and management platform that helps residents report local problems and supports transparent follow-up toward resolution.',
    tags: ['Civic Tech', 'Issue Reporting', 'Community Platform', 'Full-stack'],
  },
  {
    slug: 'muraya',
    title: 'MURAYA',
    category: 'Agentic AI · CodeSplash Finalist',
    featured: true,
    desc: 'An agentic AI decision-support system for landslide response and last-mile coordination. MURAYA was selected as a finalist at CodeSplash from more than 120 teams.',
    tags: ['Finalist · 120+ Teams', 'CodeSplash', 'Agentic AI', 'Disaster Response', 'Team ByteMe'],
  },
  {
    slug: 'chloroguard',
    title: 'ChloroGuard',
    category: 'Machine Learning · Computer Vision',
    featured: true,
    desc: 'AI-powered plant health monitoring that detects and classifies leaf diseases using computer vision and deep learning.',
    tags: ['Python', 'TensorFlow', 'Jupyter', 'Deep Learning'],
    github: 'https://github.com/MohamedSharfan/ChloroGuard',
    live: 'https://chloro-guard.vercel.app/',
  },
  {
    slug: 'housing-model',
    title: 'Housing Price Model',
    category: 'Machine Learning · Regression',
    desc: 'A model that predicts housing prices using regression techniques and exploratory data analysis on real-world data.',
    tags: ['Python', 'Scikit-learn', 'Jupyter', 'EDA'],
    github: 'https://github.com/MohamedSharfan/housing-model',
  },
  {
    slug: 'skill-swap',
    title: 'Skill-Swap Platform',
    category: 'Full-stack · Web App',
    desc: 'A full-stack platform that connects people to exchange skills — authentication, dynamic listings and a clean UI.',
    tags: ['Python', 'Flask', 'MySQL', 'JavaScript'],
    github: 'https://github.com/MohamedSharfan/skill-swap',
    live: 'https://skillswap-254444117177.us-central1.run.app/',
  },
  {
    slug: 'covid-dashboard',
    title: 'Covid-19 Dashboard',
    category: 'Data · Visualisation',
    desc: 'An interactive dashboard that visualises COVID-19 statistics with charts and filters for different regions.',
    tags: ['Python', 'Data Viz', 'Dashboard'],
    github: 'https://github.com/MohamedSharfan/Covid_19_Dashboard',
  },
  {
    slug: 'akurana-ugyg',
    title: 'Akurana UG/YG',
    category: 'Contribution · Akurana UG/YG · Web',
    desc: 'A modern, SEO-optimised Next.js website for a youth organisation, with an admin panel, live in production.',
    tags: ['Contribution', 'Next.js', 'SEO', 'Admin Panel', 'Vercel'],
    github: 'https://github.com/MohamedSharfan/akurana-ug-yg-website',
    live: 'https://ugygakurana.lk',
  },
  {
    slug: 'lucky-pass',
    title: 'Lucky Pass',
    category: 'Contribution · Rotaract Club of University of Ruhuna',
    desc: 'A premium raffle platform that digitizes ticket reservations, payment verification and live ticket management for the Rotaract Club of University of Ruhuna.',
    tags: ['Contribution', 'Next.js', 'Supabase', 'Three.js', 'Admin Dashboard'],
    github: 'https://github.com/MohamedSharfan/Rotaract-Ruhuna-LuckyPass',
  },
  {
    slug: 'sedssl-pm',
    title: 'SEDS SL PM',
    category: 'Web · React + TypeScript',
    desc: 'Frontend for the SEDS Sri Lanka project-management and team-collaboration web app.',
    tags: ['TypeScript', 'React', 'Team Collab'],
    github: 'https://github.com/MohamedSharfan/sedssl-pm-frontend',
  },
  {
    slug: 'arvina',
    title: 'ARVINA Clothing',
    category: 'E-commerce · Full-stack',
    desc: 'A full e-commerce clothing store — listings, cart, checkout, order management and a dedicated admin panel.',
    tags: ['PHP', 'MySQL', 'JavaScript', 'HTML'],
    github: 'https://github.com/MohamedSharfan/ARVINA-clothing-website-',
  },
  {
    slug: 'user-registration-api',
    title: 'User Registration API',
    category: 'Backend · REST',
    desc: 'A RESTful backend for user registration with secure authentication, input validation and a clean architecture.',
    tags: ['Python', 'REST API', 'Backend'],
    github: 'https://github.com/MohamedSharfan/user-registration-backend',
  },
];

export const services = [
  { title: 'AI Engineering', desc: 'LLM-powered products, taken from prompt to production.' },
  { title: 'RAG Systems', desc: 'Retrieval pipelines that ground answers in your own data.' },
  { title: 'AI Agents', desc: 'Tool-using agents that plan, act and finish real tasks.' },
  { title: 'Machine Learning', desc: 'Computer vision and predictive models in Python — studying it deeper every day.' },
  { title: 'Full-stack for AI', desc: "React, Next.js and Flask apps that put models in users' hands." },
];

// Marquee rows. Items without a devicon logo render as text chips.
export const skills = {
  'AI Engineering': ['LLMs', 'RAG', 'AI Agents', 'Embeddings', 'Vector Search', 'Prompt Engineering'],
  'Machine Learning': ['Python', 'TensorFlow', 'Scikit-learn', 'Jupyter'],
  Web: ['React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
  Tools: ['Java', 'MySQL', 'Docker', 'Git'],
};

// Season reel. status: FINALIST | COMPETED | FOUNDER | ONGOING | PROJECT | OFF CODE
export const moments = [
  { kind: 'moment', title: 'DHACK \'26', place: 'Inter-University · Univ. of Sri Jayewardenepura', year: '2026', status: 'FINALIST', note: '1st Runner-Up (2nd place) among 150+ teams with GovNavAI, representing the University of Ruhuna as Team ByteMe.' },
  { kind: 'moment', title: 'CodeSplash', place: 'Agentic AI Phase', year: '2026', status: 'FINALIST', note: 'MURAYA finalist among 120+ teams, representing the University of Ruhuna as Team ByteMe.' },
  { kind: 'moment', title: 'ML & AI Nexus', place: '24h Kaggle round', year: '2026', status: 'COMPETED', note: 'Hospital readmission prediction, Trustworthy AI track.' },
  { kind: 'quote', text: "It's not where you start, it's how fast you iterate." },
  { kind: 'moment', title: 'lablab.ai × AssemblyAI', place: 'Voice-Agent Hackathon', year: '2026', status: 'COMPETED', note: 'Building voice agents on real-time speech AI.' },
  { kind: 'moment', title: 'StudyBuddy', place: 'Founder', year: 'Now', status: 'FOUNDER', note: 'Tamil-medium O/L revision guides for students.' },
  { kind: 'quote', text: 'Retrieve. Reason. Act. Ship.' },
  { kind: 'moment', title: 'Rotaract Club', place: 'University of Ruhuna', year: '—', status: 'PROJECT', note: 'RotaSphere — the club website project.' },
  { kind: 'moment', title: 'Off code', place: 'Badminton · Chess · Table tennis', year: 'Always', status: 'OFF CODE', note: 'Strategy on the board, speed on the court.' },
];

export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohamedsharfan' },
  { label: 'GitHub', href: 'https://github.com/MohamedSharfan' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100079157150910&mibextid=kFxxJD' },
  { label: 'WhatsApp', href: 'https://wa.me/94784184640' },
];

export const EMAIL = 'sharfansaleem72@gmail.com';
// web3forms key (from the original site's contact form)
export const WEB3FORMS_KEY = 'fd3e94c2-2ae1-412a-a3ac-eb826b794b89';
