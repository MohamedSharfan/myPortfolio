// All editable site content lives here.
// Add `img: 'assets/...'` to a project or moment to show a real screenshot/photo.

export const projects = [
  {
    slug: 'chloroguard',
    title: 'ChloroGuard',
    category: 'AI / ML · Computer Vision',
    featured: true,
    desc: 'AI-powered plant health monitoring that detects and classifies leaf diseases using computer vision and deep learning.',
    tags: ['Python', 'TensorFlow', 'Jupyter', 'Deep Learning'],
    github: 'https://github.com/MohamedSharfan/ChloroGuard',
    live: 'https://chloro-guard.vercel.app/',
  },
  {
    slug: 'govnavai',
    title: 'GovNavAI',
    category: 'AI Assistant · DHACK Finalist',
    featured: true,
    desc: 'A Sinhala / Tamil / English AI assistant for Sri Lankan government paperwork — ask, get a checklist, a pre-filled form and the right office. 42 verified procedures.',
    tags: ['AI Assistant', 'Multilingual', 'Figma', 'Product'],
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
    category: 'Full-stack Web App',
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
    category: 'Web · Next.js',
    desc: 'A modern, SEO-optimised Next.js website for a youth organisation, with an admin panel, live in production.',
    tags: ['Next.js', 'SEO', 'Admin Panel', 'Vercel'],
    github: 'https://github.com/MohamedSharfan/akurana-ug-yg-website',
    live: 'https://ugygakurana.lk',
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
  {
    slug: 'crewzero',
    title: 'CrewZero',
    category: 'Web App · Team Coordination',
    desc: 'A collaborative app for team management and coordination with a dynamic, responsive interface.',
    tags: ['JavaScript', 'HTML', 'CSS'],
    github: 'https://github.com/MohamedSharfan/CrewZero',
  },
];

export const services = [
  { title: 'Machine Learning', desc: 'Computer vision, regression and data pipelines in Python.' },
  { title: 'Full-stack Web', desc: 'React, Next.js, Flask and Node apps — shipped live.' },
  { title: 'Data & Dashboards', desc: 'EDA and interactive dashboards that make data readable.' },
  { title: 'Product & UI', desc: 'Figma prototypes and interfaces built around real users.' },
];

export const skills = {
  'ML / AI': ['Python', 'TensorFlow', 'Scikit-learn', 'Jupyter'],
  Web: ['React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
  Other: ['Java', 'MySQL', 'Docker', 'Git'],
};

// Season reel. status: FINALIST | COMPETED | FOUNDER | ONGOING | PROJECT | OFF CODE
export const moments = [
  { kind: 'moment', title: 'DHACK Finals', place: 'Univ. of Sri Jayewardenepura', year: '2026', status: 'FINALIST', note: 'Team ByteMe — top 5 of 110+ teams with GovNavAI.' },
  { kind: 'moment', title: 'ML & AI Nexus', place: '24h Kaggle round', year: '2026', status: 'COMPETED', note: 'Hospital readmission prediction, Trustworthy AI track.' },
  { kind: 'quote', text: "It's not where you start, it's how fast you iterate." },
  { kind: 'moment', title: 'lablab.ai × AssemblyAI', place: 'Voice-Agent Hackathon', year: '2026', status: 'COMPETED', note: 'Building voice agents on real-time speech AI.' },
  { kind: 'moment', title: 'StudyBuddy', place: 'Founder', year: 'Now', status: 'FOUNDER', note: 'Tamil-medium O/L revision guides for students.' },
  { kind: 'quote', text: 'Train in public. Ship in production.' },
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
