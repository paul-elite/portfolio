import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const projects = [
  {
    id: "1",
    slug: "interaction-prototypes",
    title: "Interaction prototypes",
    description: "Interaction Design",
    preview: "/previews/interaction.png",
    year: "2024",
    role: "Design & Development",
    case_study: {
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
    case_study: {
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
    case_study: {
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
    case_study: {
      overview: "Comprehensive brand systems for startups and agencies.",
      challenge: "Distinctive yet flexible identities that scale.",
      approach: "Strategy-first, then logo, typography, and guidelines.",
      outcome: "Clear brand direction across all channels.",
    },
  },
];

const writings = [
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

const illustrations = [
  {
    id: "i1",
    slug: "abstract-forms",
    title: "Abstract forms",
    description: "Geometric compositions exploring shape and color.",
    youtube_url: "https://youtube.com/watch?v=example1",
  },
  {
    id: "i2",
    slug: "interface-sketches",
    title: "Interface sketches",
    description: "Early-stage explorations and wireframes.",
    youtube_url: "https://youtube.com/watch?v=example2",
  },
  {
    id: "i3",
    slug: "motion-studies",
    title: "Motion studies",
    description: "Animation principles in practice.",
    youtube_url: "https://youtube.com/watch?v=example3",
  },
  {
    id: "i4",
    slug: "color-experiments",
    title: "Color experiments",
    description: "Exploring palettes and gradients.",
    youtube_url: "https://youtube.com/watch?v=example4",
  },
  {
    id: "i5",
    slug: "typography-play",
    title: "Typography play",
    description: "Letterforms and type compositions.",
    youtube_url: "https://youtube.com/watch?v=example5",
  },
  {
    id: "i6",
    slug: "3d-renders",
    title: "3D renders",
    description: "Abstract 3D scenes and objects.",
    youtube_url: "https://youtube.com/watch?v=example6",
  },
];

const interactions = [
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

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await supabase.from('projects').delete().neq('id', '');
  await supabase.from('writings').delete().neq('id', '');
  await supabase.from('illustrations').delete().neq('id', '');
  await supabase.from('interactions').delete().neq('id', '');

  // Insert projects
  const { error: projectsError } = await supabase.from('projects').insert(projects);
  if (projectsError) console.error('Projects error:', projectsError);
  else console.log('Projects seeded');

  // Insert writings
  const { error: writingsError } = await supabase.from('writings').insert(writings);
  if (writingsError) console.error('Writings error:', writingsError);
  else console.log('Writings seeded');

  // Insert illustrations
  const { error: illustrationsError } = await supabase.from('illustrations').insert(illustrations);
  if (illustrationsError) console.error('Illustrations error:', illustrationsError);
  else console.log('Illustrations seeded');

  // Insert interactions
  const { error: interactionsError } = await supabase.from('interactions').insert(interactions);
  if (interactionsError) console.error('Interactions error:', interactionsError);
  else console.log('Interactions seeded');

  console.log('Done!');
}

seed();
