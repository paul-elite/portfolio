'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import BlockEditor, { Block } from '@/components/BlockEditor';
import { ToastContainer, toast } from '@/components/Toast';

type ContentType = 'projects' | 'illustrations' | 'writings' | 'interactions';
type TabType = ContentType | 'profile' | 'contact';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  year: string;
  role: string;
  preview?: string;
  previewImages?: string[];
  link?: string;
  blocks?: Block[];
  avatar?: string;
  caseStudy?: {
    overview: string;
    challenge: string;
    approach: string;
    outcome: string;
  };
}

type IllustrationCategory = 'app-icons' | 'characters' | 'assets';

interface Illustration {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  youtubeUrl?: string;
  category?: IllustrationCategory;
}

const ILLUSTRATION_CATEGORIES: { key: IllustrationCategory; label: string }[] = [
  { key: 'app-icons', label: 'App Icons' },
  { key: 'characters', label: 'Character Illustrations' },
  { key: 'assets', label: 'Assets' },
];

interface Writing {
  id: string;
  slug: string;
  title: string;
  description: string;
  blocks?: Block[];
  avatar?: string;
}

interface Settings {
  name: string;
  title: string;
  avatar: string;
  avatarFocused: string;
  metaImage: string;
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
  twitterImage: string;
  linkedinImage: string;
  behanceImage: string;
  instagramImage: string;
  emailImage: string;
}

interface ContentStore {
  projects: Project[];
  illustrations: Illustration[];
  writings: Writing[];
  interactions: Writing[];
  settings: Settings;
}

// Reusable Input Component
function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  icon,
  helpText,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
  helpText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
            icon ? 'pl-10' : ''
          }`}
        />
      </div>
      {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
    </div>
  );
}

// Reusable Textarea Component
function Textarea({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 3,
  helpText,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  helpText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
      />
      {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
    </div>
  );
}

// File Upload Component
function FileUpload({
  label,
  accept,
  preview,
  onUpload,
  uploading,
  aspectRatio = 'square',
  helpText,
}: {
  label: string;
  accept: string;
  preview?: string;
  onUpload: (file: File) => void;
  uploading: boolean;
  aspectRatio?: 'square' | 'video' | 'wide';
  helpText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const aspectClasses = {
    square: 'aspect-square w-24',
    video: 'aspect-video w-48',
    wide: 'aspect-[2/1] w-48',
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className={`${aspectClasses[aspectRatio]} rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-dashed transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-gray-400">Uploading...</span>
            </div>
          ) : preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={192}
              height={192}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center gap-1 p-2">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-xs text-gray-400 text-center">Drop or click</span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={inputRef}
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {preview ? 'Change' : 'Upload'}
          </button>
          {helpText && <p className="text-xs text-gray-400 max-w-[150px]">{helpText}</p>}
        </div>
      </div>
    </div>
  );
}

// Section Card Component
function Section({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm ${className}`}>
      {title && <h2 className="text-base font-semibold text-gray-900 mb-5">{title}</h2>}
      {children}
    </div>
  );
}

// Button Component
function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [content, setContent] = useState<ContentStore | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [projectBlocks, setProjectBlocks] = useState<Block[]>([]);
  const [writingBlocks, setWritingBlocks] = useState<Block[]>([]);
  const [settings, setSettings] = useState<Settings>({
    name: '',
    title: '',
    avatar: '',
    avatarFocused: '',
    metaImage: '',
    twitter: '',
    github: '',
    linkedin: '',
    email: '',
    twitterImage: '',
    linkedinImage: '',
    behanceImage: '',
    instagramImage: '',
    emailImage: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFocusedPreview, setAvatarFocusedPreview] = useState<string>('');
  const [metaImagePreview, setMetaImagePreview] = useState<string>('');
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [homepageImages, setHomepageImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingSaveAction, setPendingSaveAction] = useState<'continue' | 'close' | null>(null);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch {
      toast.error('Failed to fetch content');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Signing in...');

    try {
      const res = await fetch('/api/admin/content', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        const data = await res.json();
        setContent(data);
        if (data.settings) {
          setSettings(data.settings);
        }
        localStorage.setItem('admin_password', password);
        toast.update(loadingToast, 'Welcome back!', 'success');
      } else {
        toast.update(loadingToast, 'Invalid password', 'error');
      }
    } catch {
      toast.update(loadingToast, 'Connection error', 'error');
    }
    setLoading(false);
  };

  const handleFileUpload = async (file: File, folder: string, fieldId?: string): Promise<string | null> => {
    if (fieldId) setUploadingField(fieldId);
    const loadingToast = toast.loading(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${password}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.update(loadingToast, 'Upload complete!', 'success');
        return data.path;
      } else {
        toast.update(loadingToast, 'Upload failed', 'error');
      }
    } catch {
      toast.update(loadingToast, 'Upload failed', 'error');
    } finally {
      setUploadingField(null);
    }
    return null;
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditingId(item.id as string);
    toast.info(`Editing "${item.title}"`);

    const data: Record<string, string> = {
      title: (item.title as string) || '',
      description: (item.description as string) || '',
    };

    if (activeTab === 'projects') {
      data.year = (item.year as string) || '';
      data.role = (item.role as string) || '';
      data.avatar = (item.avatar as string) || '';
      data.preview = (item.preview as string) || '';
      data.link = (item.link as string) || '';
      if (item.caseStudy) {
        const cs = item.caseStudy as Record<string, string>;
        data.overview = cs.overview || '';
        data.challenge = cs.challenge || '';
        data.approach = cs.approach || '';
        data.outcome = cs.outcome || '';
      }
      setProjectBlocks((item.blocks as Block[]) || []);
      setHomepageImages((item.previewImages as string[]) || []);
    } else if (activeTab === 'illustrations') {
      data.thumbnail = (item.thumbnail as string) || '';
      data.youtubeUrl = (item.youtubeUrl as string) || '';
      data.category = (item.category as string) || 'assets';
    } else if (activeTab === 'writings') {
      data.avatar = (item.avatar as string) || '';
      data.cover = (item.cover as string) || '';
      data.date = (item.date as string) || '';
      setWritingBlocks((item.blocks as Block[]) || []);
    } else if (activeTab === 'interactions') {
      data.link = (item.link as string) || '';
    }

    setFormData(data);
    if (data.avatar) setPreviewImages((prev) => ({ ...prev, avatar: data.avatar }));
    if (data.preview) setPreviewImages((prev) => ({ ...prev, preview: data.preview }));
    if (data.thumbnail) setPreviewImages((prev) => ({ ...prev, thumbnail: data.thumbnail }));

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setPreviewImages({});
    setProjectBlocks([]);
    setWritingBlocks([]);
    setHomepageImages([]);
    toast.info('Cancelled editing');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If editing, show modal to ask user what to do
    if (editingId) {
      setShowSaveModal(true);
      return;
    }

    // For new items, just create directly
    await performSave('close');
  };

  const performSave = async (action: 'continue' | 'close') => {
    setShowSaveModal(false);
    setPendingSaveAction(null);
    setLoading(true);
    const isEditing = !!editingId;
    const loadingToast = toast.loading(isEditing ? 'Updating...' : 'Creating...');

    try {
      const data: Record<string, unknown> = { ...formData };

      if (activeTab === 'projects') {
        if (projectBlocks.length > 0) {
          data.blocks = projectBlocks;
        }
        if (homepageImages.length > 0) {
          data.previewImages = homepageImages;
        }
        if (formData.overview || formData.challenge || formData.approach || formData.outcome) {
          data.caseStudy = {
            overview: formData.overview || '',
            challenge: formData.challenge || '',
            approach: formData.approach || '',
            outcome: formData.outcome || '',
          };
          delete data.overview;
          delete data.challenge;
          delete data.approach;
          delete data.outcome;
        }
      }

      if (activeTab === 'writings') {
        if (writingBlocks.length > 0) {
          data.blocks = writingBlocks;
        }
      }

      if (activeTab === 'illustrations') {
        data.youtube_url = data.youtubeUrl;
        delete data.youtubeUrl;
      }

      const res = await fetch('/api/admin/content', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          type: activeTab,
          id: editingId,
          data
        }),
      });

      if (res.ok) {
        toast.update(loadingToast, isEditing ? 'Updated successfully!' : 'Created successfully!', 'success');
        fetchContent();

        if (action === 'close') {
          // Clear form and close editing
          setFormData({});
          setPreviewImages({});
          setProjectBlocks([]);
          setWritingBlocks([]);
          setHomepageImages([]);
          setEditingId(null);
        } else {
          // Keep form open for more edits
          toast.info('You can continue editing');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.details || (isEditing ? 'Failed to update' : 'Failed to create');
        toast.update(loadingToast, errorMsg, 'error');
        console.error('Submit error:', errorData);
      }
    } catch {
      toast.update(loadingToast, 'Something went wrong', 'error');
    }
    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Saving settings...');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ type: 'settings', data: settings }),
      });

      if (res.ok) {
        toast.update(loadingToast, 'Settings saved!', 'success');
        fetchContent();
      } else {
        toast.update(loadingToast, 'Failed to save settings', 'error');
      }
    } catch {
      toast.update(loadingToast, 'Something went wrong', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (type: ContentType, id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const loadingToast = toast.loading('Deleting...');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ type, id }),
      });

      if (res.ok) {
        toast.update(loadingToast, 'Deleted successfully', 'success');
        fetchContent();
      } else {
        toast.update(loadingToast, 'Failed to delete', 'error');
      }
    } catch {
      toast.update(loadingToast, 'Something went wrong', 'error');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('admin_password');
    if (saved) {
      setPassword(saved);
      fetch('/api/admin/content', {
        headers: { Authorization: `Bearer ${saved}` },
      }).then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          res.json().then((data) => {
            setContent(data);
            if (data.settings) {
              setSettings(data.settings);
            }
          });
        }
      });
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8 tracking-tight">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-400 mt-1">Enter your password to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                  required
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  }
                />
                <Button type="submit" loading={loading} className="w-full">
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </main>
      </>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    },
    {
      key: 'contact',
      label: 'Contact',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
    },
    {
      key: 'projects',
      label: 'Projects',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
    },
    {
      key: 'illustrations',
      label: 'Illustrations',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    },
    {
      key: 'writings',
      label: 'Writings',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
    },
    {
      key: 'interactions',
      label: 'Interactions',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" /></svg>
    },
  ];

  const isContentTab = ['projects', 'illustrations', 'writings', 'interactions'].includes(activeTab);

  return (
    <>
      <ToastContainer />
      <main className="min-h-screen bg-gray-50 tracking-tight">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-400 mt-1">Manage your portfolio content</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem('admin_password');
                setIsAuthenticated(false);
                setPassword('');
                toast.info('Logged out');
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setFormData({});
                  setPreviewImages({});
                  setProjectBlocks([]);
                  setWritingBlocks([]);
                  setHomepageImages([]);
                  setEditingId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <Section title="Profile Photos">
                <p className="text-sm text-gray-500 mb-4">Default avatar shows on home. Focused avatar shows when viewing content.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Default Avatar</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={avatarPreview || settings.avatar}
                      uploading={uploadingField === 'avatar'}
                      aspectRatio="square"
                      helpText="Shows on home"
                      onUpload={async (file) => {
                        const previewUrl = URL.createObjectURL(file);
                        setAvatarPreview(previewUrl);
                        const path = await handleFileUpload(file, '', 'avatar');
                        if (path) {
                          setSettings((prev) => ({ ...prev, avatar: path }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Focused Avatar</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={avatarFocusedPreview || settings.avatarFocused}
                      uploading={uploadingField === 'avatarFocused'}
                      aspectRatio="square"
                      helpText="Shows when viewing content"
                      onUpload={async (file) => {
                        const previewUrl = URL.createObjectURL(file);
                        setAvatarFocusedPreview(previewUrl);
                        const path = await handleFileUpload(file, '', 'avatarFocused');
                        if (path) {
                          setSettings((prev) => ({ ...prev, avatarFocused: path }));
                        }
                      }}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Social Share Image">
                <p className="text-sm text-gray-500 mb-4">This image appears when your site is shared on social media.</p>
                <FileUpload
                  label=""
                  accept="image/png,image/svg+xml,image/jpeg"
                  preview={metaImagePreview || settings.metaImage}
                  uploading={uploadingField === 'metaImage'}
                  aspectRatio="wide"
                  helpText="Recommended: 1200x630px"
                  onUpload={async (file) => {
                    const previewUrl = URL.createObjectURL(file);
                    setMetaImagePreview(previewUrl);
                    const path = await handleFileUpload(file, 'meta', 'metaImage');
                    if (path) {
                      setSettings((prev) => ({ ...prev, metaImage: path }));
                    }
                  }}
                />
              </Section>

              <Section title="Profile Info">
                <div className="space-y-4">
                  <Input
                    label="Display Name"
                    placeholder="Your name"
                    value={settings.name}
                    onChange={(value) => setSettings({ ...settings, name: value })}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    }
                  />
                  <Input
                    label="Title / Role"
                    placeholder="Designer & Developer"
                    value={settings.title}
                    onChange={(value) => setSettings({ ...settings, title: value })}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    }
                  />
                </div>
              </Section>

              <Button type="submit" loading={loading}>
                Save Profile
              </Button>
            </form>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <Section title="Social Links">
                <div className="space-y-4">
                  <Input
                    label="Twitter"
                    placeholder="https://twitter.com/username"
                    value={settings.twitter}
                    onChange={(value) => setSettings({ ...settings, twitter: value })}
                    type="url"
                    icon={
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    }
                  />
                  <Input
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/username"
                    value={settings.linkedin}
                    onChange={(value) => setSettings({ ...settings, linkedin: value })}
                    type="url"
                    icon={
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    }
                  />
                  <Input
                    label="Email"
                    placeholder="you@example.com"
                    value={settings.email}
                    onChange={(value) => setSettings({ ...settings, email: value })}
                    type="email"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    }
                  />
                </div>
              </Section>

              <Section title="Hover Preview Images">
                <p className="text-sm text-gray-500 mb-4">These images appear when hovering over contact links on the homepage.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={settings.twitterImage}
                      uploading={uploadingField === 'twitterImage'}
                      aspectRatio="video"
                      onUpload={async (file) => {
                        const path = await handleFileUpload(file, 'social', 'twitterImage');
                        if (path) {
                          setSettings((prev) => ({ ...prev, twitterImage: path }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={settings.linkedinImage}
                      uploading={uploadingField === 'linkedinImage'}
                      aspectRatio="video"
                      onUpload={async (file) => {
                        const path = await handleFileUpload(file, 'social', 'linkedinImage');
                        if (path) {
                          setSettings((prev) => ({ ...prev, linkedinImage: path }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Behance</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={settings.behanceImage}
                      uploading={uploadingField === 'behanceImage'}
                      aspectRatio="video"
                      onUpload={async (file) => {
                        const path = await handleFileUpload(file, 'social', 'behanceImage');
                        if (path) {
                          setSettings((prev) => ({ ...prev, behanceImage: path }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={settings.instagramImage}
                      uploading={uploadingField === 'instagramImage'}
                      aspectRatio="video"
                      onUpload={async (file) => {
                        const path = await handleFileUpload(file, 'social', 'instagramImage');
                        if (path) {
                          setSettings((prev) => ({ ...prev, instagramImage: path }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      preview={settings.emailImage}
                      uploading={uploadingField === 'emailImage'}
                      aspectRatio="video"
                      onUpload={async (file) => {
                        const path = await handleFileUpload(file, 'social', 'emailImage');
                        if (path) {
                          setSettings((prev) => ({ ...prev, emailImage: path }));
                        }
                      }}
                    />
                  </div>
                </div>
              </Section>

              <Button type="submit" loading={loading}>
                Save Contact Info
              </Button>
            </form>
          )}

          {/* Content Tabs */}
          {isContentTab && (
            <div className="space-y-8">
              {/* Add/Edit Form */}
              <Section title={editingId ? `Edit ${activeTab.slice(0, -1)}` : `Add new ${activeTab.slice(0, -1)}`}>
                {editingId && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm text-blue-700">Editing mode</span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="ml-auto text-sm text-blue-500 hover:text-blue-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Title"
                    placeholder="Enter a title"
                    value={formData.title || ''}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                    required
                  />
                  <Textarea
                    label="Description"
                    placeholder="Brief description"
                    value={formData.description || ''}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    required
                  />

                  {activeTab === 'projects' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Year"
                          placeholder="2024"
                          value={formData.year || ''}
                          onChange={(value) => setFormData({ ...formData, year: value })}
                        />
                        <Input
                          label="Role"
                          placeholder="Lead Designer"
                          value={formData.role || ''}
                          onChange={(value) => setFormData({ ...formData, role: value })}
                        />
                      </div>

                      <FileUpload
                        label="Project Avatar"
                        accept="image/*"
                        preview={previewImages.avatar || formData.avatar}
                        uploading={uploadingField === 'projectAvatar'}
                        aspectRatio="square"
                        helpText="Shows when this project is selected"
                        onUpload={async (file) => {
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImages((prev) => ({ ...prev, avatar: previewUrl }));
                          const path = await handleFileUpload(file, 'avatars', 'projectAvatar');
                          if (path) {
                            setFormData((prev) => ({ ...prev, avatar: path }));
                          }
                        }}
                      />

                      <FileUpload
                        label="Preview Image"
                        accept="image/*"
                        preview={previewImages.preview || formData.preview}
                        uploading={uploadingField === 'preview'}
                        aspectRatio="video"
                        helpText="Shown in project list"
                        onUpload={async (file) => {
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImages((prev) => ({ ...prev, preview: previewUrl }));
                          const path = await handleFileUpload(file, 'previews', 'preview');
                          if (path) {
                            setFormData((prev) => ({ ...prev, preview: path }));
                          }
                        }}
                      />

                      <Input
                        label="Live Link"
                        placeholder="https://example.com"
                        value={formData.link || ''}
                        onChange={(value) => setFormData({ ...formData, link: value })}
                        type="url"
                        helpText="Optional external link"
                      />

                      {/* Homepage Preview Images */}
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Homepage Preview Images</h3>
                        <p className="text-xs text-gray-400 mb-4">
                          Images that cycle when hovering on the homepage. Upload multiple images.
                        </p>

                        {/* Current images */}
                        {homepageImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            {homepageImages.map((img, index) => (
                              <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={img}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHomepageImages((prev) => prev.filter((_, i) => i !== index));
                                  }}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                                  {index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new image button */}
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            id="homepage-image-upload"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const path = await handleFileUpload(file, 'previews', 'homepageImage');
                                if (path) {
                                  setHomepageImages((prev) => [...prev, path]);
                                }
                              }
                              e.target.value = '';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('homepage-image-upload')?.click()}
                            disabled={uploadingField === 'homepageImage'}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {uploadingField === 'homepageImage' ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Image
                              </>
                            )}
                          </button>
                          {homepageImages.length > 0 && (
                            <span className="text-xs text-gray-400">{homepageImages.length} image{homepageImages.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Project Content</h3>
                        <p className="text-xs text-gray-400 mb-4">
                          Add text, images, code snippets, and more.
                        </p>
                        <BlockEditor
                          blocks={projectBlocks}
                          onChange={setProjectBlocks}
                          onUpload={(file, folder) => handleFileUpload(file, folder, 'projectBlock')}
                          uploading={uploadingField === 'projectBlock'}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'illustrations' && (
                    <>
                      <FileUpload
                        label="Thumbnail"
                        accept="image/*"
                        preview={previewImages.thumbnail || formData.thumbnail}
                        uploading={uploadingField === 'thumbnail'}
                        aspectRatio="video"
                        helpText="Cover image for the illustration"
                        onUpload={async (file) => {
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImages((prev) => ({ ...prev, thumbnail: previewUrl }));
                          const path = await handleFileUpload(file, 'illustrations', 'thumbnail');
                          if (path) {
                            setFormData((prev) => ({ ...prev, thumbnail: path }));
                          }
                        }}
                      />
                      <Input
                        label="YouTube URL"
                        placeholder="https://youtube.com/watch?v=..."
                        value={formData.youtubeUrl || ''}
                        onChange={(value) => setFormData({ ...formData, youtubeUrl: value })}
                        type="url"
                        icon={
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={formData.category || 'assets'}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        >
                          {ILLUSTRATION_CATEGORIES.map((cat) => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {activeTab === 'writings' && (
                    <>
                      <FileUpload
                        label="Writing Avatar"
                        accept="image/*"
                        preview={previewImages.avatar || formData.avatar}
                        uploading={uploadingField === 'writingAvatar'}
                        aspectRatio="square"
                        helpText="Shows when this writing is selected"
                        onUpload={async (file) => {
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImages((prev) => ({ ...prev, avatar: previewUrl }));
                          const path = await handleFileUpload(file, 'avatars', 'writingAvatar');
                          if (path) {
                            setFormData((prev) => ({ ...prev, avatar: path }));
                          }
                        }}
                      />
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Article Content</h3>
                        <p className="text-xs text-gray-400 mb-4">
                          Build your article with blocks.
                        </p>
                        <BlockEditor
                          blocks={writingBlocks}
                          onChange={setWritingBlocks}
                          onUpload={(file, folder) => handleFileUpload(file, folder, 'writingBlock')}
                          uploading={uploadingField === 'writingBlock'}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" loading={loading}>
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Section>

              {/* Content List */}
              <Section title={`All ${activeTab}`}>
                {content && content[activeTab as ContentType]?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">No {activeTab} yet</p>
                    <p className="text-xs text-gray-300 mt-1">Create your first one above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {content &&
                      (content[activeTab as ContentType] as unknown as Array<{ id: string; title: string; description: string; thumbnail?: string } & Record<string, unknown>>)?.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                            editingId === item.id
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {activeTab === 'illustrations' && item.thumbnail && (
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <Image
                                  src={item.thumbnail}
                                  alt={item.title}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                              <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <Button
                              variant="ghost"
                              onClick={() => handleEdit(item as Record<string, unknown>)}
                              className="!px-3 !py-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDelete(activeTab as ContentType, item.id, item.title)}
                              className="!px-3 !py-1.5 !text-red-500 hover:!text-red-600 hover:!bg-red-50"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* Footer */}
          <p className="text-xs text-gray-300 mt-12 text-center">
            Content synced to Supabase with 60-second cache
          </p>
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Changes</h3>
              <p className="text-gray-600 mb-6">How would you like to save your changes?</p>

              <div className="space-y-3">
                <button
                  onClick={() => performSave('continue')}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors text-left"
                >
                  <span className="block">Save & Continue Editing</span>
                  <span className="text-sm text-gray-500">Keep the form open for more changes</span>
                </button>

                <button
                  onClick={() => performSave('close')}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-left"
                >
                  <span className="block">Save & Close</span>
                  <span className="text-sm text-gray-400">Save and return to the list</span>
                </button>
              </div>

              <button
                onClick={() => setShowSaveModal(false)}
                className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
