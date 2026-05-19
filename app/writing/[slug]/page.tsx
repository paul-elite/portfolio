import { notFound } from 'next/navigation';
import { writings } from '@/lib/data';
import { getSiblingItems, getWritingBySlug, getWritingNavigation } from '@/lib/content-service';
import WritingContent from './WritingContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Allow dynamic params for database writings
export const dynamicParams = true;

// Generate static params for known static writings
export async function generateStaticParams() {
  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

export default async function WritingPage({ params }: PageProps) {
  const { slug } = await params;

  const [allWritings, writing] = await Promise.all([
    getWritingNavigation(),
    getWritingBySlug(slug),
  ]);

  if (!writing) {
    notFound();
  }

  const { previous: prevWriting, next: nextWriting } = getSiblingItems(allWritings, slug);

  return <WritingContent writing={writing} prevWriting={prevWriting} nextWriting={nextWriting} />;
}
