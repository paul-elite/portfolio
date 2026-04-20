'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export type BlockType = 'text' | 'heading' | 'image' | 'svg' | 'code' | 'quote' | 'list';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  meta?: {
    alt?: string;
    caption?: string;
    language?: string;
    size?: 'small' | 'medium' | 'large' | 'full';
    listItems?: string[];
    listBullets?: (string | null)[]; // null means default bullet, string is emoji
  };
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  onUpload: (file: File, folder: string) => Promise<string | null>;
  uploading?: boolean;
}

const blockTypeLabels: Record<BlockType, string> = {
  text: 'Text',
  heading: 'Heading',
  image: 'Image',
  svg: 'SVG',
  code: 'Code',
  quote: 'Quote',
  list: 'List',
};

const blockTypeIcons: Record<BlockType, string> = {
  text: 'T',
  heading: 'H',
  image: '🖼',
  svg: '◇',
  code: '</>',
  quote: '"',
  list: '•',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function BlockEditor({ blocks, onChange, onUpload, uploading }: BlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      meta: type === 'image' ? { size: 'large' } : type === 'list' ? { listItems: [''] } : undefined,
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    const newBlock: Block = {
      ...blockToDuplicate,
      id: generateId(),
      meta: blockToDuplicate.meta ? { ...blockToDuplicate.meta } : undefined,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const moveBlock = (from: number, to: number) => {
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, moved);
    onChange(newBlocks);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveBlock(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const path = await onUpload(file, 'projects');
      if (path) {
        updateBlock(index, { content: path });
      }
    }
  };

  const handleSvgUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // Read SVG as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgContent = event.target?.result as string;
        updateBlock(index, { content: svgContent });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Block List */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group border border-gray-200 rounded-lg bg-white transition-all ${
              draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''
            }`}
          >
            {/* Block Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <span className="cursor-grab text-gray-400 hover:text-gray-600">⋮⋮</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {blockTypeLabels[block.type]}
              </span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => moveBlock(index, Math.max(0, index - 1))}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, Math.min(blocks.length - 1, index + 1))}
                disabled={index === blocks.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => duplicateBlock(index)}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="Duplicate"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            {/* Block Content */}
            <div className="p-3">
              {/* Text Block */}
              {block.type === 'text' && (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="Enter text content..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 min-h-[100px] resize-y"
                />
              )}

              {/* Heading Block */}
              {block.type === 'heading' && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="Enter heading..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-lg font-semibold"
                />
              )}

              {/* Image Block */}
              {block.type === 'image' && (
                <div className="space-y-3">
                  {block.content ? (
                    <div className="relative">
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={block.content}
                          alt={block.meta?.alt || 'Uploaded image'}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateBlock(index, { content: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setActiveUploadIndex(index);
                        fileInputRef.current?.click();
                      }}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <span className="text-gray-400">
                        {uploading && activeUploadIndex === index ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={block.meta?.alt || ''}
                      onChange={(e) => updateBlock(index, { meta: { ...block.meta, alt: e.target.value } })}
                      placeholder="Alt text"
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                    />
                    <select
                      value={block.meta?.size || 'large'}
                      onChange={(e) => updateBlock(index, { meta: { ...block.meta, size: e.target.value as 'small' | 'medium' | 'large' | 'full' } })}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={block.meta?.caption || ''}
                    onChange={(e) => updateBlock(index, { meta: { ...block.meta, caption: e.target.value } })}
                    placeholder="Caption (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                  />
                </div>
              )}

              {/* SVG Block */}
              {block.type === 'svg' && (
                <div className="space-y-3">
                  {block.content ? (
                    <div className="relative">
                      <div
                        className="w-full p-4 bg-gray-50 rounded-lg flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                      <button
                        type="button"
                        onClick={() => updateBlock(index, { content: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div
                        onClick={() => {
                          setActiveUploadIndex(index);
                          svgInputRef.current?.click();
                        }}
                        className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <span className="text-gray-400">Click to upload SVG</span>
                      </div>
                      <p className="text-xs text-gray-400 text-center">or paste SVG code below</p>
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(index, { content: e.target.value })}
                        placeholder="<svg>...</svg>"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 min-h-[80px] resize-y font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Code Block */}
              {block.type === 'code' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={block.meta?.language || ''}
                    onChange={(e) => updateBlock(index, { meta: { ...block.meta, language: e.target.value } })}
                    placeholder="Language (e.g., javascript, python)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                  />
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Enter code..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 min-h-[120px] resize-y font-mono text-sm bg-gray-900 text-green-400"
                  />
                </div>
              )}

              {/* Quote Block */}
              {block.type === 'quote' && (
                <div className="space-y-2">
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Enter quote..."
                    className="w-full px-3 py-2 border-l-4 border-gray-400 bg-gray-50 rounded-r-lg focus:outline-none min-h-[80px] resize-y italic"
                  />
                  <input
                    type="text"
                    value={block.meta?.caption || ''}
                    onChange={(e) => updateBlock(index, { meta: { ...block.meta, caption: e.target.value } })}
                    placeholder="Attribution (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                  />
                </div>
              )}

              {/* List Block */}
              {block.type === 'list' && (
                <ListBlockEditor
                  block={block}
                  onUpdate={(updates) => updateBlock(index, updates)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (activeUploadIndex !== null) {
            handleImageUpload(e, activeUploadIndex);
          }
        }}
      />
      <input
        ref={svgInputRef}
        type="file"
        accept=".svg"
        className="hidden"
        onChange={(e) => {
          if (activeUploadIndex !== null) {
            handleSvgUpload(e, activeUploadIndex);
          }
        }}
      />

      {/* Add Block Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {(Object.keys(blockTypeLabels) as BlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <span>{blockTypeIcons[type]}</span>
            <span>{blockTypeLabels[type]}</span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No blocks yet. Click a button above to add content.</p>
        </div>
      )}
    </div>
  );
}

// Common emojis for list bullets
const BULLET_EMOJIS = [
  null, // default bullet
  '✅', '⭐', '🔥', '💡', '🎯', '🚀', '💪', '✨',
  '📌', '🔹', '🔸', '▶️', '➡️', '👉', '🎨', '💻',
  '📱', '🛠️', '⚡', '🎉', '❤️', '💎', '🌟', '📍',
];

// List Block Editor Component
function ListBlockEditor({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const [openEmojiPicker, setOpenEmojiPicker] = useState<number | null>(null);

  const items = block.meta?.listItems || [''];
  const bullets = block.meta?.listBullets || [];

  const updateItems = (newItems: string[], newBullets?: (string | null)[]) => {
    onUpdate({
      content: newItems.filter(i => i.trim()).join('\n'),
      meta: {
        ...block.meta,
        listItems: newItems,
        ...(newBullets !== undefined && { listBullets: newBullets }),
      }
    });
  };

  const setBullet = (itemIndex: number, emoji: string | null) => {
    const newBullets = [...bullets];
    // Ensure array is long enough
    while (newBullets.length <= itemIndex) {
      newBullets.push(null);
    }
    newBullets[itemIndex] = emoji;
    updateItems(items, newBullets);
    setOpenEmojiPicker(null);
  };

  const addItem = (afterIndex: number) => {
    const newItems = [...items];
    const newBullets = [...bullets];
    newItems.splice(afterIndex + 1, 0, '');
    newBullets.splice(afterIndex + 1, 0, null);
    updateItems(newItems, newBullets);
  };

  const removeItem = (itemIndex: number) => {
    const newItems = [...items];
    const newBullets = [...bullets];
    newItems.splice(itemIndex, 1);
    newBullets.splice(itemIndex, 1);
    updateItems(newItems, newBullets);
  };

  return (
    <div className="space-y-2">
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className="flex items-center gap-2">
          {/* Bullet selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenEmojiPicker(openEmojiPicker === itemIndex ? null : itemIndex)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
              title="Click to change bullet"
            >
              {bullets[itemIndex] || <span className="text-gray-400">•</span>}
            </button>

            {/* Emoji picker dropdown */}
            {openEmojiPicker === itemIndex && (
              <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64">
                <div className="grid grid-cols-8 gap-1">
                  {BULLET_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBullet(itemIndex, emoji)}
                      className={`w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-base ${
                        (emoji === null && !bullets[itemIndex]) || bullets[itemIndex] === emoji
                          ? 'bg-blue-100 ring-1 ring-blue-400'
                          : ''
                      }`}
                    >
                      {emoji || <span className="text-gray-400">•</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder="Or type any emoji..."
                    maxLength={2}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          setBullet(itemIndex, value);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Item input */}
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[itemIndex] = e.target.value;
              updateItems(newItems);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem(itemIndex);
                setTimeout(() => {
                  const container = e.currentTarget.closest('.space-y-2');
                  const inputs = container?.querySelectorAll('input[type="text"]:not([placeholder*="emoji"])');
                  (inputs?.[itemIndex + 1] as HTMLInputElement)?.focus();
                }, 0);
              } else if (e.key === 'Backspace' && item === '' && items.length > 1) {
                e.preventDefault();
                removeItem(itemIndex);
                setTimeout(() => {
                  const container = e.currentTarget.closest('.space-y-2');
                  const inputs = container?.querySelectorAll('input[type="text"]:not([placeholder*="emoji"])');
                  (inputs?.[Math.max(0, itemIndex - 1)] as HTMLInputElement)?.focus();
                }, 0);
              }
            }}
            placeholder="List item..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
          />

          {/* Delete button */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(itemIndex)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => addItem(items.length - 1)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span>+</span>
        <span>Add item</span>
      </button>
    </div>
  );
}

