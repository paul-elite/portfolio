import SectionPage, { sectionMetadata } from '@/components/home/SectionPage';

export const revalidate = 60;

export function generateMetadata() {
  return sectionMetadata('writings');
}

export default function Page() {
  return <SectionPage target="writings" />;
}
