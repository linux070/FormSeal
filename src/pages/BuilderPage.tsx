import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '@/stores/builderStore';
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
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
  Palette,
  CheckSquare,
  UploadSimple,
  CaretDown,
  TextAlignLeft,
  FileText,
  Star,
  ArrowCounterClockwise,
  Plus,
  Trash,
  ArrowLeft,
  Envelope,
  Globe,
  Image as ImageIcon,
  Stack,
  Folder,
  CloudArrowUp,
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



export function BuilderPage() {
  const store = useBuilderStore();
  const currentAccount = useCurrentAccount();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [view, setView] = useState<'selection' | 'builder'>('selection');
  const navigate = useNavigate();
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        store.setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        store.setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const startFromScratch = () => {
    store.resetBuilder();
    setView('builder');
  };



  return (
    <div className="flex-1 px-4 md:px-8 pt-36 pb-10 bg-[#fafafa]">
      <div className="max-w-[1800px] mx-auto">
        {!currentAccount && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12">
            <div className="doppelrand max-w-xl w-full mx-auto animate-fade-in">
              <div className="doppelrand-inner bg-white p-10 md:p-14 text-center flex flex-col items-center justify-center min-h-[380px] border border-black/5 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/[0.05] flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-[1.375rem] font-bold text-black tracking-tight mb-2">Access Restricted</h2>
                <p className="text-[0.9375rem] font-medium text-black/50 leading-relaxed max-w-sm mb-8">
                  Connect your Web3 wallet to authenticate and deploy decentralized forms to Walrus.
                </p>
                <ConnectModal
                  trigger={
                    <Button
                      variant="primary"
                      size="md"
                    >
                      Connect Wallet
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        )}

        {currentAccount && view === 'selection' && (
          <div className="animate-fade-in">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-16 px-2">
              <h1 className="text-[2rem] font-bold tracking-tight text-black">
                All Forms
              </h1>
              <Button
                variant="primary"
                size="md"
                className="px-8 h-12"
                onClick={startFromScratch}
                icon={<Plus weight="bold" className="w-5 h-5" />}
              >
                Create Form
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center text-center pb-12 mb-6">
              <div className="w-32 h-32 mb-6 flex items-center justify-center opacity-20 transition-opacity">
                <div className="relative">
                  <Folder weight="thin" className="w-32 h-32 text-black" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[2.5rem] mt-1">
                     ☹
                  </div>
                </div>
              </div>
              <h2 className="text-[1.875rem] font-bold tracking-tight text-black leading-tight mb-3">
                You don't have any forms
              </h2>
              <p className="text-[1.0625rem] text-black/40 font-medium max-w-[40ch] mx-auto leading-relaxed">
                Create a new form from scratch or use a template to get started.
              </p>
            </div>

            <div className="max-w-[1200px] mx-auto">
              <div className="max-w-[800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Start from Scratch Card */}
                <div
                  onClick={startFromScratch}
                  className="group relative flex flex-col bg-white rounded-[2.5rem] border border-black/[0.06] shadow-sm hover:shadow-2xl hover:shadow-black/[0.04] transition-all duration-500 overflow-hidden cursor-pointer h-[400px] items-center justify-center text-center p-12"
                >
                  <div className="absolute inset-4 rounded-[1.8rem] border border-black/[0.02] bg-zinc-50/50 -z-0" />
                  <div className="flex flex-col items-center justify-center gap-12 z-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-md border border-black/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                        <Plus weight="bold" className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[1.375rem] font-bold text-black tracking-tight">Start from Scratch</h3>
                      <p className="text-[0.875rem] font-medium text-black/30">Create a new form from scratch</p>
                    </div>
                  </div>
                </div>

                {/* Use a Template Card */}
                <div
                  onClick={() => navigate('/templates')}
                  className="group relative flex flex-col bg-white rounded-[2.5rem] border border-black/[0.06] shadow-sm hover:shadow-2xl hover:shadow-black/[0.04] transition-all duration-500 overflow-hidden cursor-pointer h-[400px] items-center justify-center text-center p-12"
                >
                  <div className="absolute inset-4 rounded-[1.8rem] border border-black/[0.02] bg-zinc-50/50 -z-0" />
                  <div className="flex flex-col items-center justify-center gap-12 z-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-md border border-black/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                        <Stack weight="bold" className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[1.375rem] font-bold text-black tracking-tight">Use a Template</h3>
                      <p className="text-[0.875rem] font-medium text-black/30">Select from available templates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentAccount && view === 'builder' && (
          <div className="animate-fade-in">
            {/* ─── Builder Header ─── */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('selection')}
                  className="group flex items-center gap-2 py-1.5 transition-all"
                >
                   <ArrowLeft weight="bold" className="w-4 h-4 text-black/30 group-hover:text-black transition-colors" />
                   <span className="text-[0.75rem] font-bold text-black/30 group-hover:text-black transition-colors uppercase tracking-wider">Back</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => store.undoHistory()}
                  className="flex items-center gap-2 px-4 h-10 rounded-md bg-white border border-black/[0.12] shadow-sm hover:border-black/30 transition-all duration-300 group whitespace-nowrap mr-2"
                >
                  <ArrowCounterClockwise weight="bold" className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
                  <span className="text-[0.8125rem] font-semibold text-black/60 group-hover:text-black">
                    Undo
                  </span>
                </button>
                <div className="h-6 w-px bg-black/[0.08] mr-2" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  icon={<Eye weight="bold" className="w-5 h-5" />}
                  className="px-5 h-10"
                >
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/f/${store.form.id}`);
                  }}
                  icon={<Copy weight="bold" className="w-5 h-5" />}
                  className="px-5 h-10"
                >
                  Copy Link
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  loading={isPublishing}
                  icon={<Rocket weight="fill" className="w-5 h-5" />}
                  className="px-6 h-10"
                >
                  Publish
                </Button>
              </div>
            </div>

            {/* ─── Three Column Layout ─── */}
            <div className="grid grid-cols-[280px_1fr_320px] gap-8 items-start">
              
              {/* ─── LEFT: Construction Zone (Add Fields) ─── */}
              <div className="sticky top-24 space-y-6">
                <div className="doppelrand">
                  <div className="doppelrand-inner bg-white border border-black/5 p-6">
                    <h3 className="text-[0.625rem] font-black text-black/40 uppercase tracking-[0.2em] mb-4">
                      Construction
                    </h3>
                    <div className="flex flex-col gap-2">
                      {FIELD_TYPES.map((ft) => {
                        const Icon = ft.icon;
                        return (
                          <button
                            key={ft.type}
                            onClick={() => store.addField(ft.type)}
                            className="flex items-center gap-3 px-4 h-11 rounded-md bg-[#fdfdfd] border border-black/[0.06] text-[0.8125rem] font-semibold text-black/60 hover:text-black hover:bg-black/[0.02] hover:border-black/20 transition-all duration-200 active:scale-[0.97] group"
                          >
                            <Icon weight="bold" className="w-4 h-4 text-black/30 group-hover:text-black transition-colors" />
                            <span>{ft.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 border border-black/[0.04] rounded-2xl">
                  <div className="flex items-center gap-2 text-[0.625rem] font-black text-black/30 uppercase tracking-[0.15em] mb-1">
                    <CloudArrowUp weight="bold" className="w-3 h-3" />
                    Storage Status
                  </div>
                  <p className="text-[0.75rem] font-medium text-black/40 leading-relaxed">
                    All changes are persisted to your local session until you Publish to Walrus.
                  </p>
                </div>
              </div>

              {/* ─── CENTER: Canvas Zone (The Form) ─── */}
              <div className="doppelrand">
                <div className="doppelrand-inner bg-white p-0 overflow-hidden min-h-[700px] flex flex-col border border-black/5 shadow-sm">
                  {/* Workspace Header - Interactive */}
                  <div className="relative group/header">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {store.form.hasCover ? (
                      <div className="relative w-full h-[320px] overflow-visible bg-black/[0.02] border-b border-black/[0.05]">
                        <img 
                          src={store.form.coverUrl} 
                          alt="Form Cover" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover/header:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/header:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => coverFileInputRef.current?.click()}
                            className="!bg-white/90 !backdrop-blur-md !border-none !text-black !text-[0.75rem] font-bold h-9 px-4 rounded-md shadow-xl hover:!bg-white"
                          >
                            Change Cover
                          </Button>
                        </div>

                        {store.form.showIcon && (
                          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 pointer-events-none">
                            <div 
                              onClick={() => logoFileInputRef.current?.click()}
                              className="w-24 h-24 rounded-md bg-white border border-black/5 shadow-2xl flex items-center justify-center pointer-events-auto group/logo cursor-pointer hover:scale-[1.02] transition-all overflow-hidden"
                            >
                              {store.form.logoUrl ? (
                                <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-accent/5 flex items-center justify-center text-[1.5rem] font-black text-accent uppercase tracking-tighter">
                                  {store.form.title ? store.form.title.substring(0, 2) : 'FS'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      store.form.showIcon && (
                        <div className="pt-20 flex justify-center">
                          <div 
                            onClick={() => logoFileInputRef.current?.click()}
                            className="w-24 h-24 rounded-md bg-white border border-black/[0.05] shadow-xl flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all overflow-hidden"
                          >
                            {store.form.logoUrl ? (
                              <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-black/5 flex items-center justify-center text-[1.5rem] font-black text-black/20 uppercase tracking-tighter">
                                {store.form.title ? store.form.title.substring(0, 2) : 'FS'}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    <div className={`px-12 pb-12 bg-white flex flex-col gap-4 ${store.form.hasCover && store.form.showIcon ? 'pt-16' : (!store.form.hasCover && !store.form.showIcon ? 'pt-20' : 'pt-12')}`}>
                      <input
                        value={store.form.title}
                        onChange={(e) => store.setTitle(e.target.value)}
                        placeholder="Untitled Form"
                        className="w-full text-[2.5rem] font-bold text-black placeholder:text-black/10 bg-transparent border-none focus:outline-none focus:ring-0 p-0 transition-all text-center tracking-tight"
                      />

                      <textarea
                        value={store.form.description}
                        onChange={(e) => store.setDescription(e.target.value)}
                        placeholder="Add a description for respondents..."
                        className="w-full text-[1.125rem] font-normal text-black/40 placeholder:text-black/10 bg-transparent border-none focus:outline-none focus:ring-0 p-0 transition-all resize-none min-h-[1.5em] text-center max-w-2xl mx-auto"
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
                  <div className="flex-1 p-6 md:p-12 bg-[#fafafa]">
                    {store.form.fields.length === 0 ? (
                      <div className="py-24 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-3xl bg-white border border-black/5 shadow-sm flex items-center justify-center mb-6">
                          <PencilSimpleLine weight="bold" className="w-8 h-8 text-black/10" />
                        </div>
                        <h3 className="text-[1.25rem] font-black text-black mb-2">No Fields Yet</h3>
                        <p className="text-black/40 text-[0.875rem] font-medium text-center max-w-[300px]">
                          Add your first field from the construction panel on the left.
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
                          <div className="space-y-6 max-w-[700px] mx-auto">
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

              {/* ─── RIGHT: Inspector Zone (Settings & Style) ─── */}
              <div className="sticky top-24 space-y-6">
                <div className="doppelrand">
                  <div className="doppelrand-inner bg-white border border-black/5 flex flex-col divide-y divide-black/[0.04]">
                    {/* Form Style Section */}
                    <div className="p-6">
                      <h3 className="text-[0.625rem] font-black text-black/40 uppercase tracking-[0.2em] mb-4">
                        Form Style
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Cover Image Toggle */}
                        <div>
                          <div className="flex items-center justify-between text-[0.625rem] font-black text-black/40 uppercase tracking-wider mb-3">
                            <div className="flex items-center gap-2">
                              <ImageIcon weight="bold" className="w-3.5 h-3.5" />
                              Cover Image
                            </div>
                            {store.form.hasCover && (
                              <button
                                onClick={() => document.getElementById('cover-upload')?.click()}
                                className="text-accent hover:text-accent-light transition-colors flex items-center gap-1 normal-case font-bold"
                              >
                                <UploadSimple weight="bold" className="w-3 h-3" />
                                <span>Change</span>
                              </button>
                            )}
                          </div>
                          
                          <input 
                            id="cover-upload"
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => store.setCoverUrl(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 bg-black/[0.02] p-1 rounded-md border border-black/[0.05]">
                              <button
                                onClick={() => store.setHasCover(false)}
                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-md transition-all duration-300 ${!store.form.hasCover ? 'bg-white shadow-sm text-black border border-black/5' : 'text-black/40 hover:text-black/60'}`}
                              >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${!store.form.hasCover ? 'bg-black/5' : 'bg-transparent'}`}>
                                  <FileText weight="bold" className="w-4 h-4 opacity-40" />
                                </div>
                                <span className="text-[0.6875rem] font-bold">No Cover</span>
                              </button>
                              <button
                                onClick={() => store.setHasCover(true)}
                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-md transition-all duration-300 ${store.form.hasCover ? 'bg-white shadow-sm text-black border border-black/5' : 'text-black/40 hover:text-black/60'}`}
                              >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${store.form.hasCover ? 'bg-black/5' : 'bg-transparent'}`}>
                                  <ImageIcon weight="bold" className="w-4 h-4 opacity-40" />
                                </div>
                                <span className="text-[0.6875rem] font-bold">Cover</span>
                              </button>
                            </div>

                            {store.form.hasCover && (
                              <div className="relative group aspect-[3/1] rounded-md overflow-hidden border border-black/[0.05] bg-black/[0.02]">
                                <img 
                                  src={store.form.coverUrl} 
                                  alt="Cover preview" 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => document.getElementById('cover-upload')?.click()}
                                    className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <UploadSimple weight="bold" className="w-4 h-4 text-black" />
                                  </button>
                                  <button 
                                    onClick={() => store.setCoverUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')}
                                    className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <Trash weight="bold" className="w-4 h-4 text-danger" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Show Icon Toggle */}
                        <div className="pt-4 border-t border-black/[0.04]">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-[0.75rem] font-semibold text-black">Form Logo</div>
                              <div className="text-[0.6875rem] font-medium text-black/60">Show at the top</div>
                            </div>
                            <button
                              onClick={() => store.setShowIcon(!store.form.showIcon)}
                              className={`w-10 h-5 rounded-full transition-all relative ${store.form.showIcon ? 'bg-[#34d399]' : 'bg-black/10'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${store.form.showIcon ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Settings Section */}
                    <div className="p-6 space-y-6">
                      <h3 className="text-[0.625rem] font-black text-black/40 uppercase tracking-[0.2em] mb-5">
                        Settings
                      </h3>

                      <div className="space-y-5">
                        {/* Accent Color */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[0.625rem] font-black text-black/40 uppercase tracking-wider">
                            <Palette weight="bold" className="w-3.5 h-3.5" />
                            Accent Color
                          </div>
                          <div className="flex items-center justify-between px-1">
                            {['#34d399', '#3b82f6', '#f472b6', '#f59e0b', '#fb7185', '#94a3b8', '#000000'].map(color => (
                              <button
                                key={color}
                                onClick={() => store.setAccentColor(color)}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${store.form.accentColor === color ? 'border-black scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Sensitive Toggle */}
                        <div className="pt-4 border-t border-black/[0.04]">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[0.75rem] font-semibold text-black">Keep it Private</div>
                              <div className="text-[0.6875rem] font-medium text-black/60">Encrypt with Seal</div>
                            </div>
                            <button
                              onClick={() => store.setSensitive(!store.form.sensitive)}
                              className={`w-10 h-5 rounded-full transition-all relative ${store.form.sensitive ? 'bg-[#34d399]' : 'bg-black/10'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${store.form.sensitive ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Preview Modal ─── */}
        <Modal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Form Preview"
          size="4xl"
        >
          <div
            className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar -mx-2 px-2"
            style={{ '--accent-color': store.form.accentColor } as any}
          >
            <div className="space-y-0 rounded-2xl overflow-hidden border border-black/5 shadow-sm bg-white">
              {store.form.hasCover && (
                <div className="relative w-full h-[240px] overflow-visible">
                  <img src={store.form.coverUrl} alt="" className="w-full h-full object-cover" />
                  {store.form.showIcon && (
                    <div className="absolute left-1/2 -bottom-10 -translate-x-1/2">
                      <div className="w-20 h-20 rounded-md bg-white border border-black/5 shadow-xl flex items-center justify-center overflow-hidden">
                        {store.form.logoUrl ? (
                          <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-accent/5 flex items-center justify-center text-[1.25rem] font-black text-accent uppercase tracking-tighter">
                            {store.form.title ? store.form.title.substring(0, 2) : 'FS'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`p-10 space-y-6 ${store.form.hasCover && store.form.showIcon ? 'pt-14' : ''}`}>
                {!store.form.hasCover && store.form.showIcon && (
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-md bg-white border border-black/[0.05] shadow-lg flex items-center justify-center overflow-hidden">
                      {store.form.logoUrl ? (
                        <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black/5 flex items-center justify-center text-[1.25rem] font-black text-black/20 uppercase tracking-tighter">
                          {store.form.title ? store.form.title.substring(0, 2) : 'FS'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-center pb-4">
                  <h2 className="text-[1.75rem] font-black text-black tracking-tight mb-2">
                    {store.form.title || 'Untitled Form'}
                  </h2>
                  <p className="text-[1rem] text-black/50 leading-relaxed max-w-xl mx-auto">
                    {store.form.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-8 py-4">
                  {store.form.fields.length > 0 ? (
                    store.form.fields.map((field: FormField) => (
                      <FormFieldRenderer
                        key={field.id}
                        field={field}
                        value={previewValues[field.id] ?? null}
                        onChange={(val: any) => setPreviewValues((prev: Record<string, any>) => ({ ...prev, [field.id]: val }))}
                        accentColor={store.form.accentColor}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center bg-black/[0.02] rounded-md border border-dashed border-black/10">
                      <p className="text-[0.75rem] font-bold text-black/20">
                        No fields added to this form yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-4 border-t border-black/[0.05]">
                  <Button
                    variant="primary"
                    className="w-full h-12 !rounded-md !text-white !text-[0.9375rem] font-bold shadow-lg border-none hover:scale-[1.01] active:scale-[0.98] transition-all"
                    style={{ backgroundColor: store.form.accentColor }}
                    onClick={() => {
                      alert('This is a preview. Submissions are disabled.');
                    }}
                  >
                    Submit Response
                  </Button>
                  <p className="text-center text-[0.6875rem] text-black/40 mt-4 font-medium">
                    Your responses are secured using threshold cryptography.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
