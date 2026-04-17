import { notFound } from 'next/navigation';
import { writings, Writing } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import WritingContent from './WritingContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface WritingNav {
  slug: string;
  title: string;
}

// Allow dynamic params for database writings
export const dynamicParams = true;

// Generate static params for known static writings
export async function generateStaticParams() {
  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

async function getAllWritings(): Promise<{ slug: string; title: string }[]> {
  try {
    const { data, error } = await supabase
      .from('writings')
      .select('slug, title')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return writings.map(w => ({ slug: w.slug, title: w.title }));
    }

    return data;
  } catch {
    return writings.map(w => ({ slug: w.slug, title: w.title }));
  }
}

interface WritingWithBlocks extends Writing {
  blocks?: { type: string; content: string; meta?: Record<string, unknown> }[];
}

async function getWritingFromDatabase(slug: string): Promise<WritingWithBlocks | null> {
  try {
    const { data, error } = await supabase
      .from('writings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date || '',
      cover: data.cover || '',
      blocks: data.blocks || [],
    };
  } catch {
    return null;
  }
}

export default async function WritingPage({ params }: PageProps) {
  const { slug } = await params;

  // Get all writings for navigation
  const allWritings = await getAllWritings();

  // First try database (has latest data with blocks)
  let writing = await getWritingFromDatabase(slug);

  // Fall back to static writing if not in database
  if (!writing) {
    const staticWriting = writings.find(w => w.slug === slug);
    if (staticWriting) {
      writing = { ...staticWriting, blocks: [] };
    }
  }

  if (!writing) {
    notFound();
  }

  // Find current writing index and determine prev/next
  const currentIndex = allWritings.findIndex(w => w.slug === slug);
  const prevWriting: WritingNav | null = currentIndex > 0 ? allWritings[currentIndex - 1] : null;
  const nextWriting: WritingNav | null = currentIndex < allWritings.length - 1 ? allWritings[currentIndex + 1] : null;

  return <WritingContent writing={writing} prevWriting={prevWriting} nextWriting={nextWriting} />;
}
