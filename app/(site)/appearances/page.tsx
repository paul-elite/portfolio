import SectionPage, { sectionMetadata } from '@/components/home/SectionPage';

export const revalidate = 60;

export function generateMetadata() {
  return sectionMetadata('appearances');
}

export default function Page() {
  return <SectionPage target="appearances" />;
}
