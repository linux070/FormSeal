 import { useState } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Rocket, 
  Eye, 
  Copy,
  PencilSimpleLine,
  Bug,
  Lightbulb,
  ChatCircleText,
  Palette,
  TextT,
  CheckSquare,
  UploadSimple,
  CaretDown,
  TextAlignLeft,
  FileText,
  Star,
  ArrowCounterClockwise,
  Envelope,
  Globe,
} from '@phosphor-icons/react';
import { Button, Modal } from '@/components/ui';
import { BuilderFieldCard } from '@/components/BuilderFieldCard';
import { FormFieldRenderer } from '@/components/FormFieldRenderer';
import { uploadToWalrus } from '@/lib/walrus';
import type { FormField } from '@/types';

/* ─── Constants ─── */
const FIELD_TYPES: { type: FormField['type']; label: string; icon: any }[] = [
  { type: 'short_text', label: 'Short Text', icon: PencilSimpleLine },
  { type: 'long_text', label: 'Long Text', icon: TextAlignLeft },
  { type: 'email', label: 'Email Address', icon: Envelope },
  { type: 'dropdown', label: 'Dropdown', icon: CaretDown },
  { type: 'checkbox_group', label: 'Checkboxes', icon: CheckSquare },
  { type: 'star_rating', label: 'Star Rating', icon: Star },
  { type: 'file_upload', label: 'Media Upload', icon: UploadSimple },
  { type: 'url', label: 'URL', icon: Globe },
];

const TEMPLATES = [
  {
    id: 'bug_report',
    name: 'Bug Report',
    description: 'Report technical issues and reproduction steps for the core protocol.',
    icon: Bug,
    fields: [
      { type: 'short_text', labelPlaceholder: 'Issue Title', required: true },
      { type: 'long_text', labelPlaceholder: 'Reproduction Steps', required: true },
      { type: 'file_upload', labelPlaceholder: 'Visual Evidence', required: false },
    ],
  },
  {
    id: 'feature_request',
    name: 'Feature Request',
    description: 'Propose new architectural primitives and functional improvements.',
    icon: Lightbulb,
    fields: [
      { type: 'short_text', labelPlaceholder: 'Proposed Feature Name', required: true },
      { type: 'long_text', labelPlaceholder: 'Functional Specification & Rationale', required: true },
    ],
  },
  {
    id: 'user_survey',
    name: 'Community Feedback',
    description: 'Share your experience and suggest protocol-level optimizations.',
    icon: ChatCircleText,
    fields: [
      { type: 'star_rating', labelPlaceholder: 'Protocol Satisfaction Rating', required: true },
      { type: 'long_text', labelPlaceholder: 'What is your primary use case?', required: false },
    ],
  },
];

export function BuilderPage() {
  const store = useBuilderStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});




  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = store.form.fields.findIndex((f) => f.id === active.id);
      const newIndex = store.form.fields.findIndex((f) => f.id === over.id);
      store.reorderFields(oldIndex, newIndex);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const blobId = await uploadToWalrus(store.form);
      store.setPublishedBlobId(blobId);
      alert(`Published to Walrus! Blob ID: ${blobId}`);
    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Failed to publish to Walrus.');
    } finally {
      setIsPublishing(false);
    }
  };

  const applyTemplate = (template: any) => {
    store.saveHistory();
    store.resetBuilder();
    store.setTitle(template.name);
    store.setDescription(template.description);
    
    // Batch add fields
    template.fields.forEach((f: any) => {
      store.addField(f.type);
    });

    // Update labels and placeholders
    setTimeout(() => {
      const fields = useBuilderStore.getState().form.fields;
      const templateFields = template.fields;
      templateFields.forEach((tf: any, i: number) => {
        const field = fields[i];
        if (field) {
          store.updateField(field.id, { 
            label: "", // Keep label empty so placeholder shows
            labelPlaceholder: tf.labelPlaceholder,
            required: tf.required 
          });
        }
      });
    }, 0);
  };

  return (
    <div className="flex-1 px-4 md:px-8 pt-36 pb-10 bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black">
              Form Builder
            </h1>
            <p className="text-black/40 text-[0.875rem] mt-1 font-medium">
              Create and publish decentralized forms.
            </p>
          </div>
        </div>

        {/* ─── Templates & Actions Bar ─── */}
        <div className="mb-10 py-3 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 overflow-hidden">
            <span className="text-[0.625rem] font-black text-black/40 uppercase tracking-[0.2em] whitespace-nowrap">
              Templates
            </span>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-black/[0.08] shadow-sm hover:border-black/30 transition-all duration-300 group whitespace-nowrap"
                  >
                    <Icon weight="bold" className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
                    <span className="text-[0.8125rem] font-bold text-black/60 group-hover:text-black">
                      {t.name}
                    </span>
                  </button>
                );
              })}

            </div>

            <button
              onClick={() => store.undoHistory()}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-black/[0.08] shadow-sm hover:border-black/30 transition-all duration-300 group whitespace-nowrap ml-1"
            >
              <ArrowCounterClockwise weight="bold" className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
              <span className="text-[0.8125rem] font-bold text-black/60 group-hover:text-black">
                Undo
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              icon={<Eye weight="bold" className="w-4 h-4" />}
              className="h-10 px-4 !rounded-xl !border-black/10 !text-black hover:!bg-black/5 !font-semibold"
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/f/${store.form.id}`);
              }}
              icon={<Copy weight="bold" className="w-4 h-4" />}
              className="h-10 px-4 !rounded-xl !border-black/10 !text-black hover:!bg-black/5 !font-semibold"
            >
              Copy Link
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              loading={isPublishing}
              icon={<Rocket weight="fill" className="w-4 h-4" />}
              className="h-10 px-6 !rounded-xl !bg-black !text-white shadow-xl shadow-black/10 hover:!bg-black/80 transition-all !font-semibold"
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
          {/* ─── Workspace ─── */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="doppelrand">
              <div className="doppelrand-inner bg-white p-0 overflow-hidden min-h-[600px] flex flex-col border border-black/5 shadow-sm">
                {/* Workspace Header - Interactive */}
                <div className="px-8 py-10 bg-white flex flex-col gap-6 group/header">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[0.625rem] font-black text-black/40 uppercase tracking-widest group-focus-within/title:text-accent transition-colors">
                      <TextT weight="bold" className="w-3.5 h-3.5" />
                      Title
                    </div>
                    <input
                      value={store.form.title}
                      onChange={(e) => store.setTitle(e.target.value)}
                      placeholder="Untitled Form"
                      className="w-full text-[2rem] font-black text-black placeholder:text-black/20 bg-transparent border-none focus:outline-none focus:ring-0 p-0 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[0.625rem] font-black text-black/40 uppercase tracking-widest group-focus-within/desc:text-accent transition-colors">
                      <FileText weight="bold" className="w-3.5 h-3.5" />
                      Description
                    </div>
                    <textarea
                      value={store.form.description}
                      onChange={(e) => store.setDescription(e.target.value)}
                      placeholder="Add a description for respondents..."
                      className="w-full text-[1.125rem] font-medium text-black/60 placeholder:text-black/20 bg-transparent border-none focus:outline-none focus:ring-0 p-0 transition-all resize-none min-h-[1.5em]"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                    />
                  </div>
                </div>

                {/* Workspace Body */}
                <div className="flex-1 p-6 md:p-8 bg-[#fafafa]">
                  {store.form.fields.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-white border border-black/5 shadow-sm flex items-center justify-center mb-6">
                        <PencilSimpleLine weight="bold" className="w-8 h-8 text-black/10" />
                      </div>
                      <h3 className="text-[1.25rem] font-black text-black mb-2">No Fields Yet</h3>
                      <p className="text-black/40 text-[0.875rem] font-medium text-center max-w-[300px]">
                        Add your first field using the panel on the right, or click a template above.
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={store.form.fields.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4 max-w-[700px] mx-auto">
                          {store.form.fields.map((field, index) => (
                            <BuilderFieldCard
                              key={field.id}
                              field={field}
                              index={index}
                              isActive={store.activeFieldId === field.id}
                              onSelect={() => store.setActiveField(field.id)}
                              onRemove={() => store.removeField(field.id)}
                              onUpdate={(updates) => store.updateField(field.id, updates)}
                              onAddOption={() => store.addFieldOption(field.id)}
                              onUpdateOption={(optId, label) =>
                                store.updateFieldOption(field.id, optId, label)
                              }
                              onRemoveOption={(optId) =>
                                store.removeFieldOption(field.id, optId)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Tools ─── */}
          <div
            className="animate-fade-in lg:sticky lg:top-24 lg:self-start space-y-4"
            style={{ animationDelay: '200ms' }}
          >
            {/* Add Field Section */}
            <div className="doppelrand">
              <div className="doppelrand-inner p-5 bg-white border border-black/5">
                <h3 className="text-[0.625rem] font-black text-black/40 uppercase tracking-[0.2em] mb-4">
                  Add Field
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {FIELD_TYPES.map((ft) => {
                    const Icon = ft.icon;
                    return (
                      <button
                        key={ft.type}
                        onClick={() => store.addField(ft.type)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#fdfdfd] border border-black/[0.04] text-[0.75rem] font-bold text-black/60 hover:text-black hover:bg-black/5 hover:border-black/20 transition-all duration-200 active:scale-[0.96] group"
                      >
                        <Icon weight="bold" className="w-4 h-4 text-black/30 group-hover:text-black transition-colors" />
                        <span>{ft.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="doppelrand">
              <div className="doppelrand-inner p-5 bg-white border border-black/5 space-y-6">
                <div>
                  <h3 className="text-[0.625rem] font-black text-black/40 uppercase tracking-[0.2em] mb-5">
                    Settings
                  </h3>
                  
                  <div className="space-y-5">
                    {/* Form Settings */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[0.625rem] font-black text-black/40 uppercase tracking-wider mb-2">
                          <Palette weight="bold" className="w-3.5 h-3.5" />
                          Accent Color
                        </div>
                        <div className="flex items-center justify-between px-1">
                          {['#34d399', '#3b82f6', '#f472b6', '#f59e0b', '#fb7185', '#94a3b8', '#000000'].map(color => (
                            <button
                              key={color}
                              onClick={() => store.setAccentColor(color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                store.form.accentColor === color ? 'border-black scale-110' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                              aria-label={`Set accent color to ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sensitive Toggle */}
                    <div className="pt-4 border-t border-black/[0.04]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => store.setSensitive(!store.form.sensitive)}
                            className={`w-11 h-6 rounded-full transition-all relative ${
                              store.form.sensitive ? 'bg-[#34d399]' : 'bg-black/10'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                              store.form.sensitive ? 'left-6' : 'left-1'
                            }`} />
                          </button>
                          <div>
                            <div className="text-[0.75rem] font-semibold text-black">Sensitive Form</div>
                            <div className="text-[0.6875rem] font-medium text-black/60">Encrypt submissions with Seal</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field Count */}
                    <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between px-1">
                      <div className="text-[0.6875rem] font-black text-black/30 uppercase tracking-wider">
                        Fields
                      </div>
                      <div className="text-[0.875rem] font-black text-black/60">
                        {store.form.fields.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ─── Preview Modal ─── */}

      <Modal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Form Preview"
      >
        <div 
          className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar"
          style={{ '--accent-color': store.form.accentColor } as any}
        >
          <div className="space-y-6">
            <div className="pb-4">
              <h2 className="text-2xl font-black text-black tracking-tight mb-1">
                {store.form.title || 'Untitled Form'}
              </h2>
              <p className="text-[0.875rem] text-black/50 leading-relaxed">
                {store.form.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-6">
              {store.form.fields.length > 0 ? (
                store.form.fields.map((field) => (
                  <FormFieldRenderer
                    key={field.id}
                    field={field}
                    value={previewValues[field.id] ?? null}
                    onChange={(val) => setPreviewValues(prev => ({ ...prev, [field.id]: val }))}
                    accentColor={store.form.accentColor}
                  />
                ))
              ) : (
                <div className="py-8 text-center bg-black/[0.02] rounded-2xl border border-dashed border-black/10">
                  <p className="text-[0.75rem] font-bold text-black/20">
                    No fields added to this form yet.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-black/[0.05]">
              <Button
                variant="primary"
                className="w-full h-12 !rounded-xl !text-white !text-[0.9375rem] shadow-lg border-none"
                style={{ backgroundColor: store.form.accentColor }}
                onClick={() => {
                  alert('This is a preview. Submissions are disabled.');
                }}
              >
                Submit Response
              </Button>
              <p className="text-center text-[0.6875rem] text-black/40 mt-3 font-medium">
                Your responses are secured using threshold cryptography.
              </p>
            </div>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}
