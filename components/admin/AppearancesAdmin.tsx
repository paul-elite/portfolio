'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from '@/components/Toast';
import { Button, FileUpload, Input, Section, Textarea } from './fields';
import {
  APPEARANCE_LINK_KINDS,
  APPEARANCE_STATUSES,
  APPEARANCE_TYPES,
  publicStage,
  statusInfo,
  typeInfo,
  validateAppearance,
  type Appearance,
  type AppearanceLink,
  type AppearanceStatus,
  type AppearanceType,
} from '@/lib/appearances';

type Draft = Omit<Appearance, 'id' | 'slug' | 'links'> & { links: (AppearanceLink & { key: string })[] };

const blank = (): Draft => ({
  title: '',
  type: 'podcast',
  organisation: '',
  host: '',
  date: '',
  description: '',
  body: '',
  topics: [],
  cover: '',
  links: [],
  status: 'invited',
  featured: false,
  visible: true,
});

const STATUS_HINT: Record<AppearanceStatus, string> = {
  invited: "Only you can see it. It shows on the site once you've accepted.",
  accepted: 'Shown under Upcoming. Add the date once it’s confirmed.',
  scheduled: 'Shown under Upcoming with its date.',
  completed: 'Shown under Past. Recording links stay hidden until it’s published.',
  published: 'Shown under Past, leading with its recording or episode.',
  declined: 'Only you can see it.',
  cancelled: 'Only you can see it.',
};

const selectClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

// Where an appearance shows on the public page, or why it doesn't
function placement(a: Appearance) {
  const stage = publicStage(a);
  if (stage === 'upcoming') return { label: 'Upcoming', tone: 'text-emerald-600' };
  if (stage === 'past') return { label: 'Past', tone: 'text-emerald-600' };
  if (!a.visible) return { label: 'Hidden', tone: 'text-gray-400' };
  if (statusInfo(a.status).stage === 'upcoming') return { label: 'Date passed: mark it completed or cancelled', tone: 'text-amber-600' };
  return { label: 'Not on the site', tone: 'text-gray-400' };
}

export default function AppearancesAdmin({
  password,
  items,
  setup,
  onChanged,
  upload,
  uploading,
}: {
  password: string;
  items: Appearance[];
  /** Set when the table doesn't exist yet */
  setup: string | null;
  onChanged: () => void;
  upload: (file: File, folder: string, fieldId?: string) => Promise<string | null>;
  uploading: Set<string>;
}) {
  const [draft, setDraft] = useState<Draft>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const reset = () => {
    setDraft(blank());
    setEditingId(null);
    setTopicInput('');
    setCoverPreview('');
    setError('');
  };

  const edit = (a: Appearance) => {
    setDraft({ ...a, host: a.host ?? '', date: a.date ?? '', body: a.body ?? '', cover: a.cover ?? '', links: a.links.map((l) => ({ ...l, key: crypto.randomUUID() })) });
    setEditingId(a.id);
    setCoverPreview('');
    setError('');
    toast.info(`Editing "${a.title}"`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addTopics = (raw: string) => {
    const next = raw.split(',').map((t) => t.trim()).filter(Boolean);
    if (next.length) set('topics', [...new Set([...draft.topics, ...next])].slice(0, 12));
    setTopicInput('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    // Any topic still being typed counts
    const topics = topicInput.trim() ? [...new Set([...draft.topics, ...topicInput.split(',').map((t) => t.trim()).filter(Boolean)])] : draft.topics;
    const data = { ...draft, topics, links: draft.links.map(({ kind, url, label }) => ({ kind, url, label })) };
    const checked = validateAppearance(data);
    if (!checked.ok) {
      setError(checked.error);
      toast.error(checked.error);
      return;
    }
    setError('');
    setSaving(true);
    const loading = toast.loading(editingId ? 'Updating…' : 'Creating…');
    try {
      const res = await fetch('/api/admin/content', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ type: 'appearances', id: editingId, data }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body.details || body.error || 'Couldn’t save the appearance';
        setError(msg);
        toast.update(loading, msg, 'error');
      } else {
        toast.update(loading, editingId ? 'Appearance updated' : 'Appearance added', 'success');
        reset();
        onChanged();
      }
    } catch {
      toast.update(loading, 'Something went wrong', 'error');
    }
    setSaving(false);
  };

  const remove = async (a: Appearance) => {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    const loading = toast.loading('Deleting…');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ type: 'appearances', id: a.id }),
      });
      if (res.ok) {
        toast.update(loading, 'Deleted', 'success');
        if (editingId === a.id) reset();
        onChanged();
      } else {
        toast.update(loading, 'Failed to delete', 'error');
      }
    } catch {
      toast.update(loading, 'Something went wrong', 'error');
    }
  };

  const needsDate = ['scheduled', 'completed', 'published'].includes(draft.status);

  return (
    <div className="space-y-8">
      {setup && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-medium">Appearances can’t be saved yet</p>
          <p className="mt-1">{setup} Open the Supabase SQL editor, paste the “Appearances” block from that file, and run it.</p>
        </div>
      )}

      <Section title={editingId ? 'Edit appearance' : 'Add an appearance'}>
        {editingId && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
            <span className="text-sm text-blue-700">Editing mode</span>
            <button type="button" onClick={reset} className="ml-auto text-sm text-blue-500 hover:text-blue-700">Cancel</button>
          </div>
        )}

        <form onSubmit={save} className="space-y-5" noValidate>
          <Input label="Title" placeholder="What the conversation or talk was called" value={draft.title} onChange={(v) => set('title', v)} required />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className={selectClass} value={draft.type} onChange={(e) => set('type', e.target.value as AppearanceType)}>
                {APPEARANCE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.plural}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select className={selectClass} value={draft.status} onChange={(e) => set('status', e.target.value as AppearanceStatus)}>
                {APPEARANCE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <p className="text-xs text-gray-400">{STATUS_HINT[draft.status]}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label={draft.type === 'podcast' ? 'Podcast' : 'Event or organisation'} placeholder={draft.type === 'podcast' ? 'The show’s name' : 'Where it happened'} value={draft.organisation} onChange={(v) => set('organisation', v)} required />
            <Input label={draft.type === 'podcast' || draft.type === 'interview' ? 'Host or interviewer' : 'Organiser'} placeholder="Optional" value={draft.host ?? ''} onChange={(v) => set('host', v)} />
          </div>

          <Input label="Date" type="date" value={draft.date ?? ''} onChange={(v) => set('date', v)} required={needsDate} helpText={needsDate ? undefined : 'Optional until it’s scheduled'} />

          <Textarea label="Summary" placeholder="A line or two on what it was about" value={draft.description} onChange={(v) => set('description', v)} rows={2} />
          <Textarea label="Full description" placeholder="Optional: more on the discussion, shown in its details" value={draft.body ?? ''} onChange={(v) => set('body', v)} rows={5} helpText="Leave a blank line between paragraphs" />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Topics</label>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              {draft.topics.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
                  {t}
                  <button type="button" aria-label={`Remove ${t}`} className="text-gray-400 hover:text-gray-700" onClick={() => set('topics', draft.topics.filter((x) => x !== t))}>×</button>
                </span>
              ))}
              <input
                value={topicInput}
                onChange={(e) => (e.target.value.endsWith(',') ? addTopics(e.target.value) : setTopicInput(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTopics(topicInput); }
                  if (e.key === 'Backspace' && !topicInput && draft.topics.length) set('topics', draft.topics.slice(0, -1));
                }}
                onBlur={() => topicInput.trim() && addTopics(topicInput)}
                placeholder={draft.topics.length ? '' : 'Design systems, prototyping…'}
                className="min-w-[10rem] flex-1 bg-transparent py-1 outline-none"
              />
            </div>
            <p className="text-xs text-gray-400">Press Enter or type a comma after each one (up to 12)</p>
          </div>

          <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-end">
            <FileUpload
              label="Cover"
              accept="image/*"
              preview={coverPreview || draft.cover}
              uploading={uploading.has('appearanceCover')}
              aspectRatio="square"
              helpText="Podcast cover or event artwork"
              onUpload={async (file) => {
                setCoverPreview(URL.createObjectURL(file));
                const path = await upload(file, 'appearances', 'appearanceCover');
                if (path) set('cover', path);
                else setCoverPreview('');
              }}
            />
            <Input label="…or an image address" placeholder="https://" type="url" value={draft.cover ?? ''} onChange={(v) => { setCoverPreview(''); set('cover', v); }} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Links</label>
            {draft.links.map((l, i) => (
              <div key={l.key} className="grid gap-2 md:grid-cols-[11rem_1fr_9rem_auto]">
                <select
                  aria-label="Link kind"
                  className={selectClass}
                  value={l.kind}
                  onChange={(e) => set('links', draft.links.map((x, k) => (k === i ? { ...x, kind: e.target.value as AppearanceLink['kind'] } : x)))}
                >
                  {APPEARANCE_LINK_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
                <input
                  aria-label="Link address"
                  type="url"
                  placeholder="https://"
                  value={l.url}
                  onChange={(e) => set('links', draft.links.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))}
                  className={selectClass}
                />
                <input
                  aria-label="Link wording"
                  placeholder="Wording (optional)"
                  value={l.label ?? ''}
                  onChange={(e) => set('links', draft.links.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))}
                  className={selectClass}
                />
                <Button variant="ghost" onClick={() => set('links', draft.links.filter((_, k) => k !== i))} className="!px-3">Remove</Button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => set('links', [...draft.links, { key: crypto.randomUUID(), kind: draft.links.length ? 'other' : 'event', url: '' }])}>
              Add a link
            </Button>
            <p className="text-xs text-gray-400">Episode, recording, recap and coverage links only appear once the status is Published.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={draft.visible} onChange={(e) => set('visible', e.target.checked)} />
              Show on the site
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={draft.featured} onChange={(e) => set('featured', e.target.checked)} />
              Feature on the home page
            </label>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} disabled={!!setup}>{editingId ? 'Update' : 'Create'}</Button>
            {editingId && <Button variant="secondary" onClick={reset}>Cancel</Button>}
          </div>
        </form>
      </Section>

      <Section title="All appearances">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">No appearances yet</p>
            <p className="mt-1 text-xs text-gray-300">Add your first one above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => {
              const place = placement(a);
              return (
                <div
                  key={a.id}
                  className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${editingId === a.id ? 'border-blue-200 bg-blue-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200 text-sm text-gray-400">
                      {a.cover ? <Image src={a.cover} alt="" width={48} height={48} className="h-full w-full object-cover" unoptimized /> : a.title[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {a.title}
                        {a.featured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">Featured</span>}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {[a.organisation, typeInfo(a.type).label, a.date, statusInfo(a.status).label].filter(Boolean).join(' · ')}
                      </p>
                      <p className={`text-xs ${place.tone}`}>{place.label}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                    <Button variant="ghost" onClick={() => edit(a)} className="!px-3 !py-1.5">Edit</Button>
                    <Button variant="ghost" onClick={() => remove(a)} className="!px-3 !py-1.5 !text-red-500 hover:!bg-red-50 hover:!text-red-600">Delete</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
