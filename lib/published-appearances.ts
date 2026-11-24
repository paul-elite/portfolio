// Appearances shipped with the site, shown even before (or without) the appearances table. One added
// in admin with the same slug takes its place, so any of these can later be edited there.
import type { Appearance } from './appearances';

export const publishedAppearances: Appearance[] = [
  {
    id: 'what-i-let-ai-do-and-what-i-never-will',
    slug: 'what-i-let-ai-do-and-what-i-never-will',
    title: 'What I Let AI Do; and What I Never Will',
    type: 'podcast',
    organisation: 'Code & Canvas',
    date: '2026-10-20',
    description:
      'How AI changed my design workflow: what I hand off, how I tell useful output from noise, and why judgment and accountability stay with me.',
    body: [
      'An hour on where AI sits in my design work today: the tedious tasks I let it automate, the creative work it speeds up, and the tools I actually use.',
      'Most of the conversation is about filtering. AI produces a lot, and the skill is knowing what works, what doesn’t, and why. That judgment, and owning the result, is the part I keep.',
    ].join('\n\n'),
    topics: ['AI', 'Design workflow', 'Design tools', 'Craft'],
    cover: 'https://i.scdn.co/image/ab6765630000ba8aeb99d8841d9ba2e9700c136f',
    links: [{ kind: 'episode', url: 'https://open.spotify.com/episode/5vJgXlLPFsBqDCyKVm67lA', label: 'Listen on Spotify' }],
    status: 'published',
    featured: false,
    visible: true,
  },
];
