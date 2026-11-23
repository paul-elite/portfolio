// Appearances: places I've been invited to share ideas (podcasts, talks, interviews, panels…), kept
// apart from Work (things I've made). Shared by the public page, the admin and the API, so it holds
// only plain data and pure functions.

/** Kinds of appearance. Stored as plain text, so a new kind is one line here (no migration). */
export const APPEARANCE_TYPES = [
  { key: 'podcast', label: 'Podcast', plural: 'Podcasts' },
  { key: 'talk', label: 'Talk', plural: 'Speaking engagements' },
  { key: 'interview', label: 'Interview', plural: 'Interviews' },
  { key: 'panel', label: 'Panel', plural: 'Panel discussions' },
  { key: 'lecture', label: 'Guest lecture', plural: 'Guest lectures' },
  { key: 'workshop', label: 'Workshop', plural: 'Workshops and masterclasses' },
  { key: 'other', label: 'Appearance', plural: 'Other' },
] as const;

/**
 * The lifecycle. `stage` decides where an appearance can be seen:
 * - private: only in admin (an invitation, or one that won't happen)
 * - upcoming: confirmed and still ahead
 * - past: it has happened (published = its recording or coverage is out)
 */
export const APPEARANCE_STATUSES = [
  { key: 'invited', label: 'Invited', stage: 'private' },
  { key: 'accepted', label: 'Accepted', stage: 'upcoming' },
  { key: 'scheduled', label: 'Scheduled', stage: 'upcoming' },
  { key: 'completed', label: 'Completed', stage: 'past' },
  { key: 'published', label: 'Published', stage: 'past' },
  { key: 'declined', label: 'Declined', stage: 'private' },
  { key: 'cancelled', label: 'Cancelled', stage: 'private' },
] as const;

/**
 * What a link points at. Media links (a recording, an episode, a recap, coverage) only show once the
 * appearance is published, so an upcoming or just-recorded one never suggests there's something to watch.
 */
export const APPEARANCE_LINK_KINDS = [
  { key: 'event', label: 'Event page', media: false },
  { key: 'episode', label: 'Listen to the episode', media: true },
  { key: 'recording', label: 'Watch the recording', media: true },
  { key: 'recap', label: 'Read the recap', media: true },
  { key: 'publication', label: 'Read the coverage', media: true },
  { key: 'other', label: 'Link', media: false },
] as const;

export type AppearanceType = (typeof APPEARANCE_TYPES)[number]['key'];
export type AppearanceStatus = (typeof APPEARANCE_STATUSES)[number]['key'];
export type AppearanceLinkKind = (typeof APPEARANCE_LINK_KINDS)[number]['key'];

export interface AppearanceLink {
  kind: AppearanceLinkKind;
  url: string;
  /** Overrides the kind's own wording, e.g. "Slides" */
  label?: string;
}

export interface Appearance {
  id: string;
  slug: string;
  title: string;
  type: AppearanceType;
  /** The podcast, event or organisation */
  organisation: string;
  /** Host, organiser or interviewer */
  host?: string;
  /** YYYY-MM-DD */
  date?: string;
  /** One or two lines: what it was about */
  description: string;
  /** The longer write-up for the detail view (paragraphs split by blank lines) */
  body?: string;
  topics: string[];
  cover?: string;
  links: AppearanceLink[];
  status: AppearanceStatus;
  featured: boolean;
  visible: boolean;
}

export const typeInfo = (key: string) => APPEARANCE_TYPES.find((t) => t.key === key) ?? APPEARANCE_TYPES[APPEARANCE_TYPES.length - 1];
export const statusInfo = (key: string) => APPEARANCE_STATUSES.find((s) => s.key === key) ?? APPEARANCE_STATUSES[0];
export const linkKindInfo = (key: string) => APPEARANCE_LINK_KINDS.find((k) => k.key === key) ?? APPEARANCE_LINK_KINDS[APPEARANCE_LINK_KINDS.length - 1];

const isType = (v: unknown): v is AppearanceType => APPEARANCE_TYPES.some((t) => t.key === v);
const isStatus = (v: unknown): v is AppearanceStatus => APPEARANCE_STATUSES.some((s) => s.key === v);
const isLinkKind = (v: unknown): v is AppearanceLinkKind => APPEARANCE_LINK_KINDS.some((k) => k.key === v);

export function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** A database row (or admin form data) as an Appearance, with anything malformed dropped. */
export function toAppearance(row: Record<string, unknown>): Appearance {
  const links = Array.isArray(row.links) ? row.links : [];
  const topics = Array.isArray(row.topics) ? row.topics : [];
  const date = str(row.date).slice(0, 10);
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    type: isType(row.type) ? row.type : 'other',
    organisation: str(row.organisation),
    host: str(row.host) || undefined,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    description: str(row.description),
    body: str(row.body) || undefined,
    topics: topics.map(str).filter(Boolean),
    cover: str(row.cover) || undefined,
    links: links
      .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
      .map((l) => ({ kind: isLinkKind(l.kind) ? l.kind : 'other', url: str(l.url), label: str(l.label) || undefined }))
      .filter((l) => isHttpUrl(l.url)),
    status: isStatus(row.status) ? row.status : 'invited',
    featured: row.featured === true,
    visible: row.visible === true,
  };
}

/**
 * Checks what the admin sends before it's saved. Returns the clean record (in database columns) or
 * the first problem, worded for the person filling the form.
 */
export function validateAppearance(input: Record<string, unknown>): { ok: true; row: Record<string, unknown> } | { ok: false; error: string } {
  const title = str(input.title);
  const organisation = str(input.organisation);
  const date = str(input.date);
  const cover = str(input.cover);
  if (!title) return { ok: false, error: 'Give the appearance a title.' };
  if (!organisation) return { ok: false, error: 'Add the podcast, event or organisation.' };
  if (!isType(input.type)) return { ok: false, error: 'Pick what kind of appearance this is.' };
  if (!isStatus(input.status)) return { ok: false, error: 'Pick a status.' };
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) return { ok: false, error: 'The date should be a real date.' };
  if (['scheduled', 'completed', 'published'].includes(input.status as string) && !date) {
    return { ok: false, error: `A ${input.status} appearance needs its date.` };
  }
  if (cover && !isHttpUrl(cover)) return { ok: false, error: 'The cover image should be an uploaded image or a web address.' };

  const rawLinks = Array.isArray(input.links) ? input.links : [];
  const links: AppearanceLink[] = [];
  for (const l of rawLinks) {
    if (!l || typeof l !== 'object') continue;
    const { kind, url, label } = l as Record<string, unknown>;
    if (!str(url) && !str(label)) continue; // an empty row in the form
    if (!isHttpUrl(str(url))) return { ok: false, error: `"${str(url) || str(label)}" isn't a full web address (it should start with https://).` };
    links.push({ kind: isLinkKind(kind) ? kind : 'other', url: str(url), ...(str(label) ? { label: str(label) } : {}) });
  }

  const rawTopics = Array.isArray(input.topics) ? input.topics : str(input.topics).split(',');
  const topics = [...new Set(rawTopics.map(str).filter(Boolean))].slice(0, 12);

  return {
    ok: true,
    row: {
      title,
      type: input.type,
      organisation,
      host: str(input.host),
      date: date || null,
      description: str(input.description),
      body: str(input.body),
      topics,
      cover,
      links,
      status: input.status,
      featured: input.featured === true,
      visible: input.visible === true,
    },
  };
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Where an appearance belongs on the public page, or null when it stays private: hidden, still an
 * invitation, declined or cancelled, or confirmed for a date that has passed without being marked
 * as completed (it may not have happened, so it isn't shown as either).
 */
export function publicStage(a: Appearance, today = todayIso()): 'upcoming' | 'past' | null {
  if (!a.visible) return null;
  const stage = statusInfo(a.status).stage;
  if (stage === 'private') return null;
  if (stage === 'upcoming') return !a.date || a.date >= today ? 'upcoming' : null;
  return 'past';
}

/** The links a visitor can see: media only once it's published. */
export function publicLinks(a: Appearance) {
  return a.links
    .filter((l) => a.status === 'published' || !linkKindInfo(l.kind).media)
    .map((l) => ({ href: l.url, label: l.label || linkKindInfo(l.kind).label, media: linkKindInfo(l.kind).media }))
    // The recording or episode leads
    .sort((x, y) => Number(y.media) - Number(x.media));
}

/** A line saying what's still to come, where that's worth saying. */
export function pendingNote(a: Appearance) {
  if (a.status === 'completed' && ['podcast', 'interview'].includes(a.type)) return 'Recorded, not out yet';
  if (a.status === 'accepted' && !a.date) return 'Date to be announced';
  return undefined;
}
