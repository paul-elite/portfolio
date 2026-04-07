export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  tags?: string[];
}

export interface WorkCategory {
  slug: string;
  title: string;
  discipline: string;
  description: string;
  projects: Project[];
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

export const workCategories: WorkCategory[] = [
  {
    slug: "interaction-prototypes",
    title: "Interaction prototypes",
    discipline: "Interaction Design",
    description:
      "A series of software interaction prototypes exploring new and fluid ways to interact with digital interfaces. Each prototype focuses on micro-interactions and gestural interfaces.",
    projects: [
      {
        id: "1",
        title: "Gesture-based navigation",
        description:
          "A fluid navigation system using swipe gestures and momentum-based scrolling for seamless content exploration.",
        link: "#",
        tags: ["Mobile", "Gestures"],
      },
      {
        id: "2",
        title: "Magnetic snap points",
        description:
          "Interactive elements that snap to predefined positions with spring physics, creating satisfying tactile feedback.",
        link: "#",
        tags: ["Desktop", "Physics"],
      },
      {
        id: "3",
        title: "Contextual menus",
        description:
          "Radial menus that appear at the cursor position, reducing mouse travel and improving efficiency.",
        link: "#",
        tags: ["Desktop", "Productivity"],
      },
      {
        id: "4",
        title: "Elastic scrolling",
        description:
          "Scroll containers with rubber-band physics that respond naturally to user input at boundaries.",
        link: "#",
        tags: ["Mobile", "Physics"],
      },
      {
        id: "5",
        title: "Morphing transitions",
        description:
          "Shared element transitions that smoothly morph between states, maintaining spatial continuity.",
        link: "#",
        tags: ["Animation", "Transitions"],
      },
      {
        id: "6",
        title: "Pressure-sensitive controls",
        description:
          "UI elements that respond to force touch, revealing additional options based on pressure intensity.",
        link: "#",
        tags: ["Mobile", "Touch"],
      },
    ],
  },
  {
    slug: "web-applications",
    title: "Web applications",
    discipline: "Product Design",
    description:
      "Full-stack web applications built with modern technologies. Focus on performance, accessibility, and delightful user experiences.",
    projects: [
      {
        id: "7",
        title: "Animation Studio",
        description:
          "A web-based tool for creating and exporting CSS animations using visual controls and real-time preview.",
        link: "https://animation-tool-one.vercel.app",
        tags: ["React", "Framer Motion"],
      },
      {
        id: "8",
        title: "Typing Trainer",
        description:
          "An interactive typing game with a realistic keyboard visualization and real-time feedback.",
        link: "https://digital-keyboard.vercel.app",
        tags: ["Next.js", "SVG"],
      },
      {
        id: "9",
        title: "Color Tool",
        description:
          "A comprehensive color palette generator with accessibility checks and export options.",
        link: "#",
        tags: ["Design Tools", "Accessibility"],
      },
    ],
  },
  {
    slug: "brand-identity",
    title: "Brand identity",
    discipline: "Visual Design",
    description:
      "Brand identity systems including logos, typography, color palettes, and comprehensive style guides.",
    projects: [
      {
        id: "10",
        title: "Minimal Tech Startup",
        description:
          "Clean, geometric identity system for a SaaS company focused on developer tools.",
        link: "#",
        tags: ["Logo", "Guidelines"],
      },
      {
        id: "11",
        title: "Creative Agency Rebrand",
        description:
          "Bold, expressive identity with dynamic typography and vibrant color system.",
        link: "#",
        tags: ["Rebrand", "Typography"],
      },
    ],
  },
];

export const getWorkCategory = (slug: string): WorkCategory | undefined => {
  return workCategories.find((cat) => cat.slug === slug);
};
