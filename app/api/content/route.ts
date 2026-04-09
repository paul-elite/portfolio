import { NextResponse } from 'next/server';
import {
  projects as staticProjects,
  illustrations as staticIllustrations,
  writings as staticWritings,
  interactions as staticInteractions,
} from '@/lib/data';

// Get combined static + dynamic content
export async function GET() {
  const dynamicContent = global.contentStore || {
    projects: [],
    illustrations: [],
    writings: [],
    interactions: [],
  };

  return NextResponse.json({
    projects: [...staticProjects, ...dynamicContent.projects],
    illustrations: [...staticIllustrations, ...dynamicContent.illustrations],
    writings: [...staticWritings, ...dynamicContent.writings],
    interactions: [...staticInteractions, ...dynamicContent.interactions],
  });
}
