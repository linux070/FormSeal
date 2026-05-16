import { useCallback, useRef, useState } from 'react';
import { Input } from '@/components/ui';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { FormField } from '@/types';
import {
  Star,
  X,
  FilmStrip,
  TextB,
  TextItalic,
  ListBullets,
  ListNumbers,
  Quotes,
  CaretDown,
  Image as ImageIcon,
  Envelope,
  Globe,
  TextT,
} from '@phosphor-icons/react';

interface FormFieldRendererProps {
  field: FormField;
  value: string | string[] | number | null;
  error?: string;
  accentColor?: string;
  onChange: (value: string | string[] | number | null) => void;
}

export function FormFieldRenderer({
  field,
  value,
  error,
  accentColor = '#34d399',
  onChange,
}: FormFieldRendererProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TipTap editor for long_text
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: field.placeholder || 'Write your response...',
      }),
    ],
    content: typeof value === 'string' ? value : '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none min-h-[120px] p-4 text-[1rem] text-text-primary leading-relaxed',
      },
    },
  });

  // File upload handler
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  // Checkbox toggle handler
  const handleCheckboxToggle = useCallback(
    (optionLabel: string) => {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const idx = currentValues.indexOf(optionLabel);
      if (idx > -1) {
        onChange(currentValues.filter((v) => v !== optionLabel));
      } else {
        onChange([...currentValues, optionLabel]);
      }
    },
    [value, onChange]
  );

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-2 text-[0.8125rem] font-black text-black uppercase tracking-widest opacity-40">
        {field.label || field.labelPlaceholder}
        {field.required && (
          <span className="text-danger" aria-label="Required field">*</span>
        )}
      </label>

      {/* ΓöÇΓöÇΓöÇ Short Text ΓöÇΓöÇΓöÇ */}
      {field.type === 'short_text' && (
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors pointer-events-none z-10">
            <TextT weight="bold" className="w-4 h-4" />
          </div>
          <Input
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'Type your answer here...'}
            error={error}
            style={{ '--focus-border': accentColor } as any}
            className="!pl-12 !bg-black/[0.02] !border-black/10 !rounded-md !py-[1.125rem] !text-[1rem] !font-medium !text-text-primary placeholder:text-text-muted/40 focus:!border-[var(--focus-border)] focus:!ring-0 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ Email Address ΓöÇΓöÇΓöÇ */}
      {field.type === 'email' && (
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors pointer-events-none z-10">
            <Envelope weight="bold" className="w-4 h-4" />
          </div>
          <Input
            type="email"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'hello@example.com'}
            error={error}
            style={{ '--focus-border': accentColor } as any}
            className="!pl-12 !bg-black/[0.02] !border-black/10 !rounded-md !py-[1.125rem] !text-[1rem] !font-medium !text-text-primary placeholder:text-text-muted/40 focus:!border-[var(--focus-border)] focus:!ring-0 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ Long Text (Rich Text / TipTap) ΓöÇΓöÇΓöÇ */}
      {field.type === 'long_text' && (
        <div className="animate-fade-in group">
          <div
            style={{ '--focus-border': accentColor } as any}
            className={`
              tiptap-editor bg-black/[0.02] border border-black/10 rounded-md overflow-hidden
              transition-all duration-300 ease-[var(--ease-out-expo)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]
              ${error ? 'border-danger ring-1 ring-danger/20' : 'focus-within:border-[var(--focus-border)]'}
            `}
          >
            {/* Toolbar */}
            {editor && (
              <div className="flex items-center gap-1 px-3 py-2 border-b border-black/[0.03] bg-white/50 backdrop-blur-md sticky top-0 z-10 rounded-t-md">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('bold') ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:bg-black/5 hover:text-black'}`}
                  title="Bold"
                  aria-label="Toggle bold"
                >
                  <TextB weight="bold" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('italic') ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:bg-black/5 hover:text-black'}`}
                  title="Italic"
                  aria-label="Toggle italic"
                >
                  <TextItalic weight="bold" className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-black/[0.05] mx-1" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('bulletList') ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:bg-black/5 hover:text-black'}`}
                  title="Bullet List"
                  aria-label="Toggle bullet list"
                >
                  <ListBullets weight="bold" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('orderedList') ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:bg-black/5 hover:text-black'}`}
                  title="Numbered List"
                  aria-label="Toggle numbered list"
                >
                  <ListNumbers weight="bold" className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-black/[0.05] mx-1" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('blockquote') ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:bg-black/5 hover:text-black'}`}
                  title="Quote"
                  aria-label="Toggle blockquote"
                >
                  <Quotes weight="bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="rounded-b-md overflow-hidden">
              <EditorContent editor={editor} />
            </div>
          </div>
          {error && <p className="text-[0.75rem] text-danger mt-1.5 flex items-center gap-1 font-medium"><X className="w-3 h-3" /> {error}</p>}
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ Dropdown ΓöÇΓöÇΓöÇ */}
      {field.type === 'dropdown' && (
        <div className="relative group">
          <Dropdown
            field={field}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            error={error}
            accentColor={accentColor}
          />
          {error && <p className="text-[0.75rem] text-danger mt-1.5 flex items-center gap-1 font-medium"><X className="w-3 h-3" /> {error}</p>}
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ Checkbox Group ΓöÇΓöÇΓöÇ */}
      {field.type === 'checkbox_group' && (
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-2">
            {field.options?.map((opt) => {
              const isChecked = Array.isArray(value) && value.includes(opt.label);
              return (
                <div
                  key={opt.id}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCheckboxToggle(opt.label);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleCheckboxToggle(opt.label);
                    }
                  }}
                  className={`
                    flex items-center gap-3 cursor-pointer group px-4 py-2.5 rounded-md 
                    border transition-all duration-300 select-none
                    outline-none focus-visible:ring-2 focus-visible:ring-black/20
                    ${isChecked 
                      ? 'bg-black/[0.04] border-black/10 shadow-sm' 
                      : 'bg-black/[0.03] border-black/5 hover:border-black/10 hover:bg-black/[0.05]'
                    }
                  `}
                >
                  <div
                    className={`
                      w-5 h-5 rounded-lg border-2 flex items-center justify-center
                      transition-all duration-300 ease-[var(--ease-spring)] flex-shrink-0
                      ${isChecked
                        ? 'border-transparent shadow-sm'
                        : 'border-black/10 bg-black/[0.02] group-hover:border-black/20'
                      }
                    `}
                    style={isChecked ? { backgroundColor: accentColor || '#34d399' } : {}}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className={`w-3.5 h-3.5 stroke-[4] transition-opacity ${isChecked ? 'text-white opacity-100' : 'text-black/[0.05] opacity-100'}`} 
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`text-[1rem] font-medium transition-colors ${isChecked ? 'text-black' : 'text-black/60'}`}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
          {error && <p className="text-[0.75rem] text-danger mt-1.5 flex items-center gap-1 font-medium px-1"><X className="w-3 h-3" /> {error}</p>}
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ Star Rating ΓöÇΓöÇΓöÇ */}
      {field.type === 'star_rating' && (
        <div className="bg-black/[0.03] p-6 border border-black/10 rounded-md">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = typeof value === 'number' && star <= value;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(star);
                  }}
                  className="p-1 hover:scale-110 active:scale-95 transition-transform"
                  aria-label={`Rate ${star} out of 5`}
                >
                  <Star
                    weight={isFilled ? 'fill' : 'bold'}
                    className={`w-7 h-7 transition-colors duration-300`}
                    style={{ color: isFilled ? '#f59e0b' : 'rgba(0,0,0,0.05)' }}
                  />
                </button>
              );
            })}
          </div>
          {error && <p className="text-[0.75rem] text-danger mt-3 flex items-center gap-1 font-medium"><X className="w-3 h-3" /> {error}</p>}
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ File Upload (Screenshots & Video) ΓöÇΓöÇΓöÇ */}
      {field.type === 'file_upload' && (
        <div className="animate-fade-in">
          {value && typeof value === 'string' && value.startsWith('data:') ? (
            <div className="relative rounded-md overflow-hidden border border-border-default bg-bg-input shadow-lg group">
              {value.startsWith('data:image/') ? (
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full max-h-[300px] object-contain bg-black/5"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 bg-bg-elevated">
                  <div className="w-16 h-16 rounded-full bg-accent-dim flex items-center justify-center">
                    <FilmStrip weight="duotone" className="w-8 h-8 text-accent" />
                  </div>
                  <span className="text-[0.875rem] font-bold text-text-primary">
                    Video file uploaded
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onChange('')}
                  className="w-12 h-12 rounded-full bg-danger text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Remove file"
                >
                  <X weight="bold" className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className={`
                w-full py-12 rounded-md border-2 border-dashed
                flex flex-col items-center justify-center gap-4
                transition-all duration-300 ease-[var(--ease-out-expo)]
                bg-black/[0.02] hover:bg-black/[0.04] active:scale-[0.99] group
                ${error ? 'border-danger/40 ring-4 ring-danger/5' : 'border-black/10 hover:border-black/30 hover:shadow-lg hover:shadow-black/5'}
              `}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                {field.accept?.includes('video') ? (
                  <FilmStrip weight="bold" className="w-6 h-6 text-black/20 group-hover:text-black transition-colors" />
                ) : (
                  <ImageIcon weight="bold" className="w-6 h-6 text-black/20 group-hover:text-black transition-colors" />
                )}
              </div>
              <div className="text-center">
                <span className="block text-[1rem] font-bold text-black group-hover:text-black transition-colors">
                  {field.placeholder || 'Click to upload media'}
                </span>
                <span className="text-[0.8125rem] font-medium text-black/30 mt-1">
                  Supported: {field.accept === 'image/*' ? 'Images' : field.accept === 'video/*' ? 'Videos' : 'Images & Videos'}
                </span>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={field.accept || 'image/*,video/*'}
            onChange={handleFileUpload}
            className="sr-only"
          />
          {error && <p className="text-[0.75rem] text-danger mt-2 flex items-center gap-1 font-medium"><X className="w-3 h-3" /> {error}</p>}
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇ URL ΓöÇΓöÇΓöÇ */}
      {field.type === 'url' && (
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors pointer-events-none z-10">
            <Globe weight="bold" className="w-4 h-4" />
          </div>
          <Input
            type="url"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'https://example.com'}
            error={error}
            style={{ '--focus-border': accentColor } as any}
            className="!pl-12 !bg-black/[0.02] !border-black/10 !rounded-md !py-[1.125rem] !text-[1rem] !font-medium !text-text-primary placeholder:text-text-muted/40 focus:!border-[var(--focus-border)] focus:!ring-0 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>
      )}
    </div>
  );
}

/* ΓöÇΓöÇΓöÇ Custom Dropdown Component ΓöÇΓöÇΓöÇ */
function Dropdown({ field, value, onChange, error, accentColor }: { 
  field: FormField; 
  value: string; 
  onChange: (v: string) => void;
  error?: string;
  accentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ '--focus-border': accentColor } as any}
        className={`
          w-full px-5 h-[54px] bg-black/[0.03] text-text-primary
          border rounded-md text-[1rem] font-medium flex items-center justify-between
          transition-all duration-300 ease-[var(--ease-out-expo)]
          ${isOpen ? 'border-[var(--focus-border)] bg-white ring-4 ring-black/5' : 'border-black/10 hover:border-black/20'}
          ${error ? 'border-danger ring-danger/10' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <span className={!value ? 'text-text-muted/40' : ''}>
            {value || field.placeholder || 'Select an option...'}
          </span>
        </div>
        <CaretDown 
          weight="bold" 
          className={`w-4 h-4 text-black/20 transition-transform duration-500 ${isOpen ? 'rotate-180 text-black' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/[0.08] rounded-md shadow-2xl overflow-hidden z-[101] animate-in fade-in zoom-in-95 duration-300 origin-top">
            <div className="max-h-[240px] overflow-y-auto py-2 custom-scrollbar">
              {field.options?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.label);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-5 py-3.5 text-left text-[0.9375rem] font-medium transition-all duration-200
                    hover:bg-black/[0.03] flex items-center justify-between group
                    ${value === opt.label ? 'text-black' : 'text-black/60'}
                  `}
                >
                  {opt.label}
                  {value === opt.label && (
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="w-4 h-4 flex-shrink-0 stroke-[3]" 
                      stroke={accentColor || '#000000'}
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
