export interface ContentBlock {
  type: 'text' | 'heading' | 'image' | 'svg' | 'code' | 'quote';
  content: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  avatar?: string;
  preview?: string;
  previewImages?: string[];
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
  blocks?: ContentBlock[];
}

export const siteConfig = {
  name: "Elite",
  title: "Designer & Developer",
  avatar: "",
  bio: "I design and build digital products with a focus on interaction design, prototyping, and front-end development.",
  social: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "hello@example.com",
    behance: "https://behance.net",
    instagram: "https://instagram.com",
  },
};

export const projects: Project[] = [
  {
    id: "1",
    slug: "interaction-prototypes",
    title: "Interaction prototypes",
    description: "Interaction Design",
    preview: "/previews/interaction.png",
    year: "2024",
    role: "Design & Development",
    tags: ["Interaction", "Prototyping"],
    caseStudy: {
      overview: "Experimental prototypes exploring fluid micro-interactions and gestural interfaces.",
      challenge: "Making digital interactions feel responsive and natural.",
      approach: "Physics-based animations built with Framer Motion and React.",
      outcome: "Referenced in production features across mobile and desktop.",
    },
  },
  {
    id: "2",
    slug: "animation-studio",
    title: "Animation Studio",
    description: "Design Tool",
    preview: "/previews/animation.png",
    link: "https://animation-tool-one.vercel.app",
    year: "2024",
    role: "Design & Development",
    tags: ["React", "Framer Motion"],
    caseStudy: {
      overview: "Visual tool for creating CSS animations with real-time preview.",
      challenge: "Bridging the gap between code and visual animation design.",
      approach: "Drag-and-drop keyframes with instant visual feedback.",
      outcome: "Streamlined animation workflows for rapid prototyping.",
    },
  },
  {
    id: "3",
    slug: "typing-trainer",
    title: "Typing Trainer",
    description: "Web App",
    preview: "/previews/typing.png",
    link: "https://digital-keyboard.vercel.app",
    year: "2024",
    role: "Design & Development",
    tags: ["Next.js", "SVG"],
    caseStudy: {
      overview: "Typing practice with realistic keyboard visualization.",
      challenge: "Making typing practice engaging and enjoyable.",
      approach: "SVG keyboard with real-time feedback and sound.",
      outcome: "Measurable improvements in speed and accuracy.",
    },
  },
  {
    id: "4",
    slug: "brand-identity",
    title: "Brand identity systems",
    description: "Visual Design",
    preview: "/previews/brand.png",
    year: "2023",
    role: "Visual Design",
    tags: ["Branding", "Typography"],
    caseStudy: {
      overview: "Comprehensive brand systems for startups and agencies.",
      challenge: "Distinctive yet flexible identities that scale.",
      approach: "Strategy-first, then logo, typography, and guidelines.",
      outcome: "Clear brand direction across all channels.",
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
  avatar?: string;
  link?: string;
  date?: string;
  cover?: string;
}

export interface Illustration {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  youtubeUrl?: string;
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
    date: "2024-01-15",
    cover: "",
  },
  {
    id: "w2",
    slug: "subtle-animations",
    title: "The case for subtle animations",
    description: "How micro-interactions improve usability without overwhelming users.",
    date: "2024-02-20",
    cover: "",
  },
  {
    id: "w3",
    slug: "designing-for-the-hand",
    title: "Designing for the hand",
    description: "Rethinking mobile interfaces around natural thumb movement and one-handed use.",
    date: "2024-03-10",
    cover: "",
  },
];

export const illustrations: Illustration[] = [
  {
    id: "i1",
    slug: "abstract-forms",
    title: "Abstract forms",
    description: "Geometric compositions exploring shape and color.",
    youtubeUrl: "https://youtube.com/watch?v=example1",
  },
  {
    id: "i2",
    slug: "interface-sketches",
    title: "Interface sketches",
    description: "Early-stage explorations and wireframes.",
    youtubeUrl: "https://youtube.com/watch?v=example2",
  },
  {
    id: "i3",
    slug: "motion-studies",
    title: "Motion studies",
    description: "Animation principles in practice.",
    youtubeUrl: "https://youtube.com/watch?v=example3",
  },
  {
    id: "i4",
    slug: "color-experiments",
    title: "Color experiments",
    description: "Exploring palettes and gradients.",
    youtubeUrl: "https://youtube.com/watch?v=example4",
  },
  {
    id: "i5",
    slug: "typography-play",
    title: "Typography play",
    description: "Letterforms and type compositions.",
    youtubeUrl: "https://youtube.com/watch?v=example5",
  },
  {
    id: "i6",
    slug: "3d-renders",
    title: "3D renders",
    description: "Abstract 3D scenes and objects.",
    youtubeUrl: "https://youtube.com/watch?v=example6",
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
