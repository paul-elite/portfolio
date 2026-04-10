'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import BlockEditor, { Block } from '@/components/BlockEditor';

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
  link?: string;
  blocks?: Block[];
  caseStudy?: {
    overview: string;
    challenge: string;
    approach: string;
    outcome: string;
  };
}

interface Illustration {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  youtubeUrl?: string;
}

interface Writing {
  id: string;
  slug: string;
  title: string;
  description: string;
  blocks?: Block[];
}

interface Settings {
  name: string;
  title: string;
  avatar: string;
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
}

interface ContentStore {
  projects: Project[];
  illustrations: Illustration[];
  writings: Writing[];
  interactions: Writing[];
  settings: Settings;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [content, setContent] = useState<ContentStore | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [projectBlocks, setProjectBlocks] = useState<Block[]>([]);
  const [writingBlocks, setWritingBlocks] = useState<Block[]>([]);
  const [settings, setSettings] = useState<Settings>({
    name: '',
    title: '',
    avatar: '',
    twitter: '',
    github: '',
    linkedin: '',
    email: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Failed to fetch content');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      } else {
        setMessage('Invalid password');
      }
    } catch {
      setMessage('Error logging in');
    }
    setLoading(false);
  };

  const handleFileUpload = async (file: File, folder: string): Promise<string | null> => {
    setUploading(true);
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
        return data.path;
      }
    } catch {
      setMessage('Failed to upload file');
    } finally {
      setUploading(false);
    }
    return null;
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditingId(item.id as string);

    // Load basic fields
    const data: Record<string, string> = {
      title: (item.title as string) || '',
      description: (item.description as string) || '',
    };

    // Load type-specific fields
    if (activeTab === 'projects') {
      data.year = (item.year as string) || '';
      data.role = (item.role as string) || '';
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
    } else if (activeTab === 'illustrations') {
      data.thumbnail = (item.thumbnail as string) || '';
      data.youtubeUrl = (item.youtubeUrl as string) || '';
    } else if (activeTab === 'writings') {
      data.cover = (item.cover as string) || '';
      data.date = (item.date as string) || '';
      setWritingBlocks((item.blocks as Block[]) || []);
    } else if (activeTab === 'interactions') {
      data.link = (item.link as string) || '';
    }

    setFormData(data);
    if (data.preview) setPreviewImages({ preview: data.preview });
    if (data.thumbnail) setPreviewImages({ thumbnail: data.thumbnail });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setPreviewImages({});
    setProjectBlocks([]);
    setWritingBlocks([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: Record<string, unknown> = { ...formData };

      // Handle blocks and case study for projects
      if (activeTab === 'projects') {
        if (projectBlocks.length > 0) {
          data.blocks = projectBlocks;
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

      // Handle blocks for writings
      if (activeTab === 'writings') {
        if (writingBlocks.length > 0) {
          data.blocks = writingBlocks;
        }
      }

      // Handle illustrations - convert youtubeUrl to youtube_url for database
      if (activeTab === 'illustrations') {
        data.youtube_url = data.youtubeUrl;
        delete data.youtubeUrl;
      }

      const isEditing = !!editingId;
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
        setMessage(isEditing ? 'Updated successfully!' : 'Created successfully!');
        setFormData({});
        setPreviewImages({});
        setProjectBlocks([]);
        setWritingBlocks([]);
        setEditingId(null);
        fetchContent();
      } else {
        setMessage(isEditing ? 'Failed to update' : 'Failed to create');
      }
    } catch {
      setMessage('Error saving');
    }
    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        setMessage('Settings saved!');
        fetchContent();
      } else {
        setMessage('Failed to save settings');
      }
    } catch {
      setMessage('Error saving settings');
    }
    setLoading(false);
  };

  const handleDelete = async (type: ContentType, id: string) => {
    if (!confirm('Are you sure?')) return;

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
        setMessage('Deleted successfully!');
        fetchContent();
      }
    } catch {
      setMessage('Error deleting');
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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          {message && <p className="text-red-500 text-sm mt-4">{message}</p>}
        </form>
      </main>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'contact', label: 'Contact' },
    { key: 'projects', label: 'Projects' },
    { key: 'illustrations', label: 'Illustrations' },
    { key: 'writings', label: 'Writings' },
    { key: 'interactions', label: 'Interactions' },
  ];

  const isContentTab = ['projects', 'illustrations', 'writings', 'interactions'].includes(activeTab);

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => {
              localStorage.removeItem('admin_password');
              setIsAuthenticated(false);
              setPassword('');
            }}
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-100 pb-4 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setFormData({});
                setPreviewImages({});
                setProjectBlocks([]);
                setWritingBlocks([]);
                setEditingId(null);
              }}
              className={`text-sm transition-colors ${
                activeTab === tab.key
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Profile Photo</h2>

              <div className="flex items-center gap-6">
                {(avatarPreview || settings.avatar) ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={avatarPreview || settings.avatar}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized={!!avatarPreview}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No photo</span>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Show instant preview
                        const previewUrl = URL.createObjectURL(file);
                        setAvatarPreview(previewUrl);

                        // Upload file
                        const path = await handleFileUpload(file, '');
                        if (path) {
                          setSettings({ ...settings, avatar: path });
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG. Max 5MB.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg space-y-4">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Profile Info</h2>

              <input
                type="text"
                placeholder="Your Name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
              <input
                type="text"
                placeholder="Your Title (e.g., Designer & Developer)"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg space-y-4">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Social Links</h2>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Twitter URL</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={settings.twitter}
                  onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={settings.github}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={settings.linkedin}
                  onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Contact Info'}
            </button>
          </form>
        )}

        {/* Content Tabs */}
        {isContentTab && (
          <>
            {/* Add/Edit Form */}
            <div className="mb-12 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-900">
                  {editingId ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  required
                />

                {activeTab === 'projects' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Year (e.g., 2024)"
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={formData.role || ''}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                    </div>

                    {/* Preview Image Upload */}
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">Preview Image</label>
                      <div className="flex items-center gap-4">
                        {(previewImages.preview || formData.preview) && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={previewImages.preview || formData.preview}
                              alt="Preview"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized={!!previewImages.preview}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setPreviewImages({ ...previewImages, preview: previewUrl });

                              const path = await handleFileUpload(file, 'previews');
                              if (path) {
                                setFormData({ ...formData, preview: path });
                              }
                            }
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Live link (optional)"
                      value={formData.link || ''}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    />

                    {/* Block Editor for Project Content */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Project Content</h3>
                      <p className="text-xs text-gray-400 mb-4">
                        Build your project page with blocks. Add text, images, SVGs, code snippets, and more.
                      </p>
                      <BlockEditor
                        blocks={projectBlocks}
                        onChange={setProjectBlocks}
                        onUpload={handleFileUpload}
                        uploading={uploading}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'illustrations' && (
                  <>
                    {/* Thumbnail Upload */}
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">Thumbnail Image</label>
                      <div className="flex items-center gap-4">
                        {(previewImages.thumbnail || formData.thumbnail) && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={previewImages.thumbnail || formData.thumbnail}
                              alt="Thumbnail"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized={!!previewImages.thumbnail}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setPreviewImages({ ...previewImages, thumbnail: previewUrl });

                              const path = await handleFileUpload(file, 'illustrations');
                              if (path) {
                                setFormData({ ...formData, thumbnail: path });
                              }
                            }
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="YouTube URL"
                      value={formData.youtubeUrl || ''}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    />
                  </>
                )}

                {activeTab === 'writings' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Article Content</h3>
                    <p className="text-xs text-gray-400 mb-4">
                      Build your article with blocks. Add text, images, code snippets, quotes, and more.
                    </p>
                    <BlockEditor
                      blocks={writingBlocks}
                      onChange={setWritingBlocks}
                      onUpload={handleFileUpload}
                      uploading={uploading}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </form>
            </div>

            {/* Content List */}
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-4">
                Existing {activeTab}
              </h2>
              <div className="space-y-2">
                {content && content[activeTab as ContentType]?.length === 0 && (
                  <p className="text-sm text-gray-400">No items yet</p>
                )}
                {content &&
                  content[activeTab as ContentType]?.map((item: Record<string, unknown>) => (
                    <div
                      key={item.id as string}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        editingId === item.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title as string}</p>
                        <p className="text-xs text-gray-400">{item.description as string}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(activeTab as ContentType, item.id as string)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Note */}
        <p className="text-xs text-gray-300 mt-12">
          Content is stored in Supabase and synced to the frontend with a 60-second cache.
        </p>
      </div>
    </main>
  );
}
