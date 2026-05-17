import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui';
import type { FormField } from '@/types';
import {
  DotsSixVertical,
  Trash,
  Plus,
  X,
  TextT,
  TextAlignLeft,
  CaretDown,
  CheckSquare,
  Star,
  Globe,
  Envelope,
  FileText,
  Image as ImageIcon,
  VideoCamera,
} from '@phosphor-icons/react';

const FIELD_ICONS: Record<FormField['type'], typeof TextT> = {
  short_text: TextT,
  long_text: TextAlignLeft,
  email: Envelope,
  dropdown: CaretDown,
  checkbox_group: CheckSquare,
  star_rating: Star,
  file_upload: FileText,
  image_upload: ImageIcon,
  video_upload: VideoCamera,
  url: Globe,
};

const FIELD_TYPE_LABELS: Record<FormField['type'], string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  email: 'Email Address',
  dropdown: 'Dropdown Selection',
  checkbox_group: 'Checkbox Group',
  star_rating: 'Star Rating',
  file_upload: 'File Upload',
  image_upload: 'Image Upload',
  video_upload: 'Video Upload',
  url: 'URL',
};

interface BuilderFieldCardProps {
  field: FormField;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onRemoveOption: (optionId: string) => void;
}

export function BuilderFieldCard({
  field,
  index,
  isActive,
  onSelect,
  onRemove,
  onUpdate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: BuilderFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = FIELD_ICONS[field.type];
  const hasOptions = field.type === 'dropdown' || field.type === 'checkbox_group';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`
        group/field relative transition-all duration-300
        ${isDragging ? 'opacity-50 scale-[0.98] z-50' : 'z-10'}
      `}
    >
      <div className={`
        bg-white rounded-md border transition-all duration-300 overflow-hidden
        ${isActive ? 'border-accent/30 shadow-md ring-1 ring-accent/10' : 'border-black/[0.08] hover:border-black/20 shadow-sm'}
      `}>
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.03] bg-black/[0.01]">
          <div className="flex items-center gap-4">
            <button
              {...attributes}
              {...listeners}
              className="flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-grab active:cursor-grabbing"
            >
              <DotsSixVertical weight="bold" className="w-5 h-5" />
            </button>
            <span className="text-[0.875rem] font-black text-black tracking-tight">
              Question {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Description Toggle */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (typeof field.description === 'string') {
                  onUpdate({ description: undefined });
                } else {
                  onUpdate({ description: '' });
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group/desc"
            >
              <div 
                className={`w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center
                  ${typeof field.description === 'string' ? 'bg-black border-black shadow-sm' : 'border-black/10 bg-white group-hover/desc:border-black/20'}
                `}
              >
                {typeof field.description === 'string' && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white stroke-[4]" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[0.75rem] font-bold text-black/40 group-hover/desc:text-black transition-colors">Description</span>
            </div>

            {/* Required Toggle */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ required: !field.required });
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group/req"
            >
              <div 
                className={`w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center
                  ${field.required ? 'bg-black border-black shadow-sm' : 'border-black/10 bg-white group-hover/req:border-black/20'}
                `}
              >
                {field.required && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white stroke-[4]" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[0.75rem] font-bold text-black/40 group-hover/req:text-black transition-colors">Required</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="w-8 h-8 flex items-center justify-center text-danger/30 hover:text-danger hover:bg-danger/5 border border-black/[0.03] hover:border-danger/20 transition-all rounded"
            >
              <Trash weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Field Body */}
        <div className="p-6 space-y-4">
          {/* Container 1: Field Type Display */}
          <div className="w-full px-5 py-3.5 bg-black/[0.02] border border-black/[0.05] rounded-md text-[0.8125rem] font-bold text-black/40 flex items-center gap-3">
            <Icon weight="bold" className="w-4 h-4 opacity-40" />
            {FIELD_TYPE_LABELS[field.type]}
          </div>

          {/* Container 2: Question Input */}
          <div className="relative">
            {field.type === 'long_text' ? (
              <textarea
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder={field.labelPlaceholder || "Enter your long-form question..."}
                className="w-full px-5 py-5 bg-white border border-black/10 rounded-md text-[1rem] font-medium text-black focus:border-black/30 focus:outline-none transition-all resize-none min-h-[140px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '140px';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            ) : (
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder={field.labelPlaceholder || "Enter your question title"}
                className="!bg-white !border-black/10 !rounded-md !py-5 !text-[1rem] !font-medium !text-black focus:!border-black/30 focus:!ring-0 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            )}
          </div>

          {/* Container 2.5: Description Input */}
          {typeof field.description === 'string' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="text-[0.6875rem] font-black text-black/20 uppercase tracking-widest">Description Text</span>
              </div>
              <textarea
                value={field.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Enter description for respondents (supports links)..."
                className="w-full px-5 py-4 bg-white border border-black/10 rounded-md text-[0.875rem] font-medium text-black focus:border-black/30 focus:outline-none transition-all resize-none min-h-[90px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '90px';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
          )}

          {/* Placeholder Editing / Previews */}
          {(field.type === 'short_text' || field.type === 'email' || field.type === 'url') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="text-[0.6875rem] font-black text-black/20 uppercase tracking-widest">Placeholder Text</span>
              </div>
              <Input
                value={field.placeholder}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Enter placeholder for respondents..."
                className="!bg-black/[0.02] !border-black/10 !border-dashed !rounded-md !py-4 !text-[0.8125rem] !font-medium !text-black/60 placeholder:text-black/10 focus:!border-black/20 focus:!ring-0 transition-all"
              />
            </div>
          )}

          {field.type === 'long_text' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="text-[0.6875rem] font-black text-black/20 uppercase tracking-widest">Placeholder Text</span>
              </div>
              <textarea
                value={field.placeholder}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder for respondents..."
                className="w-full px-4 py-4 bg-black/[0.02] border border-dashed border-black/10 rounded-md text-[0.8125rem] font-medium text-black/60 placeholder:text-black/10 focus:border-black/20 focus:outline-none transition-all resize-none min-h-[100px]"
              />
            </div>
          )}

          {(field.type === 'file_upload' || field.type === 'image_upload' || field.type === 'video_upload') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="text-[0.6875rem] font-black text-black/20 uppercase tracking-widest">Upload Hint</span>
              </div>
              <div className="w-full py-8 bg-black/[0.02] border border-dashed border-black/10 rounded-md flex flex-col items-center justify-center gap-3 group/upload">
                <Icon weight="bold" className="w-6 h-6 text-black/20 group-hover/upload:text-black/40 transition-colors" />
                <Input
                  value={field.placeholder}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="e.g. Click to upload files"
                  className="!w-auto !min-w-[240px] !bg-transparent !border-none !text-center !text-[0.8125rem] !font-medium !text-black/40 placeholder:text-black/10 focus:!ring-0 transition-all"
                />
              </div>
            </div>
          )}

          {field.type === 'star_rating' && (
            <div className="pt-2 flex items-center gap-2 px-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} weight="fill" className="w-7 h-7 text-[#fbbf24]/20 hover:text-[#fbbf24]/40 transition-colors cursor-default" />
              ))}
            </div>
          )}

          {field.type === 'dropdown' && !field.options?.length && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="text-[0.6875rem] font-black text-black/20 uppercase tracking-widest">Placeholder</span>
              </div>
              <div className="relative group/dd">
                <Input
                  value={field.placeholder}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Select an option..."
                  className="!bg-black/[0.02] !border-black/10 !border-dashed !rounded-md !py-4 !text-[0.8125rem] !font-medium !text-black/60 placeholder:text-black/10 focus:!border-black/20 focus:!ring-0 transition-all !pr-10"
                />
                <CaretDown weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20" />
              </div>
            </div>
          )}

          {/* Options (if applicable) */}
          {hasOptions && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                <span className="text-[0.6875rem] font-black text-black/20 uppercase tracking-widest">Options</span>
              </div>
              {field.options?.map((option, optIndex) => (
                <div key={option.id} className="flex items-center gap-3 group/opt">
                  {field.type === 'checkbox_group' ? (
                    <div className="w-9 h-9 rounded border-2 border-black/[0.05] flex items-center justify-center bg-black/[0.01]">
                      <div className="w-4 h-4 rounded-sm border-2 border-black/20" />
                    </div>
                  ) : field.type === 'dropdown' ? (
                    <div className="w-9 h-9 rounded-xl border border-black/5 flex items-center justify-center bg-black/[0.01]">
                      <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl border border-black/5 flex items-center justify-center text-[0.75rem] font-black text-black/30 bg-black/[0.01] group-hover/opt:text-black/60 transition-colors">
                      {optIndex + 1}
                    </div>
                  )}
                  <Input
                    value={option.label}
                    onChange={(e) => onUpdateOption(option.id, e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="flex-1 !h-10 !bg-transparent !border-none !px-0 !py-0 !text-[0.875rem] !font-medium !ring-0 focus:!border-b focus:!border-black/20 rounded-none transition-all"
                    placeholder={`Option ${optIndex + 1}`}
                  />
                  <button
                    onClick={() => onRemoveOption(option.id)}
                    className="w-8 h-8 flex items-center justify-center text-danger/20 hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
                  >
                    <X weight="bold" className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={onAddOption}
                className="flex items-center gap-2.5 text-[0.8125rem] font-bold text-black/40 hover:text-black transition-all pl-12 py-2"
              >
                <Plus weight="bold" className="w-3.5 h-3.5" />
                Add another option
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
