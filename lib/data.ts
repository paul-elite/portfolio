export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  preview?: string;
  link?: string;
  tags?: string[];
  year?: string;
  role?: string;
  caseStudy?: {
    overview: string;
    challenge: string;
    approach: string;
    outcome: string;
  };
}

export const siteConfig = {
  name: "Your Name",
  title: "Designer & Developer",
  avatar: "/avatar.jpg",
  bio: "I design and build digital products with a focus on interaction design, prototyping, and front-end development.",
  social: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "hello@example.com",
  },
};

export const projects: Project[] = [
  {
    id: "1",
    slug: "interaction-prototypes",
    title: "Interaction prototypes",
    description: "A series of software interaction prototypes exploring new and fluid ways to interact with digital interfaces.",
    preview: "/previews/interaction.png",
    year: "2024",
    role: "Design & Development",
    tags: ["Interaction", "Prototyping"],
    caseStudy: {
      overview: "A collection of experimental interaction prototypes that push the boundaries of how we interact with digital interfaces. Each prototype focuses on micro-interactions and gestural interfaces.",
      challenge: "Traditional UI patterns often feel static and disconnected from natural human movement. The challenge was to create interactions that feel responsive, intuitive, and satisfying.",
      approach: "I explored physics-based animations, gesture recognition, and novel input methods. Each prototype was built with Framer Motion and React, allowing for rapid iteration and real-time feedback.",
      outcome: "The prototypes have been used as references for production features and have helped establish new interaction patterns for mobile and desktop applications.",
    },
  },
  {
    id: "2",
    slug: "animation-studio",
    title: "Animation Studio",
    description: "A web-based tool for creating and exporting CSS animations with visual controls and real-time preview.",
    preview: "/previews/animation.png",
    link: "https://animation-tool-one.vercel.app",
    year: "2024",
    role: "Design & Development",
    tags: ["React", "Framer Motion"],
    caseStudy: {
      overview: "Animation Studio is a visual tool that makes creating CSS animations accessible to designers and developers alike. It provides real-time preview and generates production-ready code.",
      challenge: "Creating CSS animations typically requires writing code and refreshing to see changes. This disconnect slows down the creative process and limits experimentation.",
      approach: "I built a drag-and-drop interface with immediate visual feedback. Users can manipulate keyframes, adjust easing curves, and see their changes instantly reflected in the preview.",
      outcome: "The tool has streamlined animation workflows and enabled rapid prototyping of motion design concepts.",
    },
  },
  {
    id: "3",
    slug: "typing-trainer",
    title: "Typing Trainer",
    description: "An interactive typing game with realistic keyboard visualization and real-time feedback.",
    preview: "/previews/typing.png",
    link: "https://digital-keyboard.vercel.app",
    year: "2024",
    role: "Design & Development",
    tags: ["Next.js", "SVG"],
    caseStudy: {
      overview: "A typing practice application that combines gamification with a realistic keyboard visualization to help users improve their typing speed and accuracy.",
      challenge: "Most typing trainers feel utilitarian and fail to engage users. The challenge was to create an experience that is both educational and enjoyable.",
      approach: "I designed a clean interface with an SVG keyboard that provides real-time visual feedback. Sound effects and progress tracking add satisfying feedback loops.",
      outcome: "Users can track their progress and see measurable improvements in typing speed and accuracy over time.",
    },
  },
  {
    id: "4",
    slug: "brand-identity",
    title: "Brand identity systems",
    description: "Comprehensive brand identity work including logos, typography, and style guides.",
    preview: "/previews/brand.png",
    year: "2023",
    role: "Visual Design",
    tags: ["Branding", "Typography"],
    caseStudy: {
      overview: "A collection of brand identity projects spanning tech startups, creative agencies, and consumer products. Each identity is built as a comprehensive system.",
      challenge: "Creating identities that are distinctive yet flexible enough to work across all touchpoints and scale with the business.",
      approach: "I start with strategy and positioning, then develop visual systems including logo, typography, color, and comprehensive guidelines.",
      outcome: "Identities that effectively communicate brand values and provide clear direction for implementation across all channels.",
    },
  },
];

export const getProject = (slug: string): Project | undefined => {
  return projects.find((p) => p.slug === slug);
};

export interface Writing {
  id: string;
  slug: string;
  title: string;
  description: string;
  link?: string;
  date?: string;
}

export interface Illustration {
  id: string;
  slug: string;
  title: string;
  description: string;
  link?: string;
}

export interface Interaction {
  id: string;
  slug: string;
  title: string;
  description: string;
  link?: string;
}

export const writings: Writing[] = [
  {
    id: "w1",
    slug: "tools-that-feel-alive",
    title: "On building tools that feel alive",
    description: "Exploring the intersection of physics and interface design, and why digital products should respond like physical objects.",
  },
  {
    id: "w2",
    slug: "subtle-animations",
    title: "The case for subtle animations",
    description: "How micro-interactions improve usability without overwhelming users.",
  },
  {
    id: "w3",
    slug: "designing-for-the-hand",
    title: "Designing for the hand",
    description: "Rethinking mobile interfaces around natural thumb movement and one-handed use.",
  },
];

export const illustrations: Illustration[] = [
  {
    id: "i1",
    slug: "abstract-forms",
    title: "Abstract forms",
    description: "A collection of geometric compositions exploring shape and color relationships.",
  },
  {
    id: "i2",
    slug: "interface-sketches",
    title: "Interface sketches",
    description: "Early-stage explorations and wireframes for various product concepts.",
  },
];

export const interactions: Interaction[] = [
  {
    id: "int1",
    slug: "spring-physics",
    title: "Spring physics playground",
    description: "An interactive demo exploring spring-based animations and their parameters.",
  },
  {
    id: "int2",
    slug: "gesture-recognition",
    title: "Gesture recognition",
    description: "Experiments with touch gesture detection and visual feedback systems.",
  },
  {
    id: "int3",
    slug: "cursor-trails",
    title: "Cursor trails",
    description: "Playful cursor effects and pointer-following animations.",
  },
];
