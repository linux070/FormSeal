import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '@/stores/builderStore';
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
import { motion, AnimatePresence } from 'framer-motion';
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
  CaretDown,
  TextAlignLeft,
  FileText,
  Star,
  ArrowCounterClockwise,
  Plus,
  ArrowLeft,
  Envelope,
  Globe,
  Image as ImageIcon,
  Stack,
  Folder,
  CloudArrowUp,
  CircleNotch,
  VideoCamera,
} from '@phosphor-icons/react';
import { Button, Modal } from '@/components/ui';
import { BuilderFieldCard } from '@/components/BuilderFieldCard';
import { FormFieldRenderer } from '@/components/FormFieldRenderer';
import { uploadToWalrus, fetchFromWalrus } from '@/lib/walrus';
import { useDashboardStore } from '@/stores/appStore';
import type { FormField, FormSchema } from '@/types';

/* ─── Constants ─── */
const FIELD_TYPES: { type: FormField['type']; label: string; icon: any }[] = [
  { type: 'short_text', label: 'Short Text', icon: PencilSimpleLine },
  { type: 'long_text', label: 'Long Text', icon: TextAlignLeft },
  { type: 'email', label: 'Email Address', icon: Envelope },
  { type: 'dropdown', label: 'Dropdown', icon: CaretDown },
  { type: 'checkbox_group', label: 'Checkboxes', icon: CheckSquare },
  { type: 'star_rating', label: 'Star Rating', icon: Star },
  { type: 'file_upload', label: 'File Upload (PDF, DOC)', icon: FileText },
  { type: 'image_upload', label: 'Image Upload (JPG, PNG)', icon: ImageIcon },
  { type: 'video_upload', label: 'Video Upload (MP4, WEBM)', icon: VideoCamera },
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

  const dashboardForms = useDashboardStore((s) => s.forms);
  const [formsDropdownOpen, setFormsDropdownOpen] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState<string | null>(null);
  const [draggingNewField, setDraggingNewField] = useState<string | null>(null);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);

  const handleLoadForm = async (formBlobId: string) => {
    setIsLoadingForm(formBlobId);
    try {
      const fetchedForm = await fetchFromWalrus<FormSchema>(formBlobId);
      if (fetchedForm) {
        store.setForm(fetchedForm);
        setView('builder');
      } else {
        alert('Could not retrieve form schema from Walrus.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching form from Walrus. Using offline fallback.');
    } finally {
      setIsLoadingForm(null);
      setFormsDropdownOpen(false);
    }
  };

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
      <div className="max-w-[1724px] mx-auto">
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
            <div className="max-w-[800px] mx-auto mb-10 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] pb-6 gap-4">
                <h1 className="text-[2rem] font-bold tracking-tight text-black leading-none whitespace-nowrap">
                  All Forms
                </h1>

                {/* Dropdown & Create Form button group */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  {/* Active Forms Dropdown Option */}
                  <div className="relative dropdown-container shrink-0">
                    <button
                      onClick={() => setFormsDropdownOpen(!formsDropdownOpen)}
                      className="flex items-center gap-2.5 px-4 h-11 rounded-[14px] bg-[#fdfdfd] border border-black/[0.06] shadow-sm hover:border-black/15 hover:bg-black/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 text-[0.875rem] font-bold text-black/70 hover:text-black transition-all duration-200 active:scale-95 group whitespace-nowrap"
                    >
                      <Folder weight="bold" className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                      <span>Active Forms ({dashboardForms.length})</span>
                      <CaretDown weight="bold" className={`w-4 h-4 text-black/40 group-hover:text-black transition-all duration-300 ${formsDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {formsDropdownOpen && (
                        <>
                          {/* Click outside backdrop */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setFormsDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 mt-2 w-[320px] bg-white rounded-[14px] border border-black/[0.06] shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden z-50 p-2"
                          >
                            <div className="px-3 py-2.5 border-b border-black/[0.04] mb-1.5">
                              <span className="text-[0.625rem] font-bold text-black/40 uppercase tracking-[0.15em] font-mono">
                                Select to Edit
                              </span>
                            </div>

                            <div className="max-h-[240px] overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                              {dashboardForms.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                  <p className="text-[0.75rem] font-bold text-black/30 font-mono">
                                    No active forms deployed.
                                  </p>
                                </div>
                              ) : (
                                dashboardForms.map((f) => (
                                  <button
                                    key={f.formBlobId}
                                    onClick={() => handleLoadForm(f.formBlobId)}
                                    disabled={isLoadingForm !== null}
                                    className="w-full text-left px-3 py-2.5 rounded-[10px] hover:bg-black/[0.04] transition-all flex flex-col gap-0.5 group active:scale-[0.98] disabled:opacity-50"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-[0.875rem] font-bold text-black/80 group-hover:text-black transition-colors truncate max-w-[170px]">
                                        {f.title || 'Untitled Form'}
                                      </span>
                                      {isLoadingForm === f.formBlobId ? (
                                        <CircleNotch className="w-3 h-3 animate-spin text-black" />
                                      ) : (
                                        <span className="text-[0.6875rem] font-mono text-black/30 bg-[#F9F9F8] border border-[#EAEAEA] px-1.5 py-0.5 rounded">
                                          {f.formBlobId.slice(0, 8)}
                                        </span>
                                      )}
                                    </div>
                                    {f.description && (
                                      <span className="text-[0.75rem] text-black/40 truncate w-full">
                                        {f.description}
                                      </span>
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="!h-11 px-6 !rounded-[14px] text-[0.875rem] font-bold !bg-black hover:!bg-zinc-800 shadow-md active:scale-95 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 transition-all duration-200"
                    onClick={startFromScratch}
                    icon={<Plus weight="bold" className="w-5 h-5" />}
                  >
                    Create Form
                  </Button>
                </div>
              </div>
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
            <div className="flex items-center justify-between mb-8 md:mb-10 gap-4 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('selection')}
                  className="group flex items-center gap-2 py-1.5 transition-all"
                >
                   <ArrowLeft weight="bold" className="w-4 h-4 text-black/30 group-hover:text-black transition-colors" />
                   <span className="text-[0.75rem] font-bold text-black/30 group-hover:text-black transition-colors uppercase tracking-wider hidden sm:inline">Back</span>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 justify-end w-full">
                {/* Undo Button - Premium Icon-Only */}
                <button
                  onClick={() => store.undoHistory()}
                  className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-[#fdfdfd] border border-black/[0.06] shadow-sm hover:border-black/15 hover:bg-black/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 transition-all duration-200 active:scale-95 group shrink-0"
                  title="Undo (Ctrl+Z)"
                >
                  <ArrowCounterClockwise weight="bold" className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                </button>

                <div className="h-6 w-px bg-black/[0.06] mx-0.5 sm:mx-1 shrink-0" />

                {/* Preview Button */}
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center justify-center gap-2.5 h-11 px-4 sm:px-5 rounded-[14px] bg-[#fdfdfd] border border-black/[0.06] shadow-sm hover:border-black/15 hover:bg-black/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 text-[0.875rem] font-bold text-black/70 hover:text-black transition-all duration-200 active:scale-95 group whitespace-nowrap shrink-0"
                  title="Preview Form"
                >
                  <Eye weight="bold" className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/f/${store.form.id}`);
                  }}
                  className="flex items-center justify-center gap-2.5 h-11 px-4 sm:px-5 rounded-[14px] bg-[#fdfdfd] border border-black/[0.06] shadow-sm hover:border-black/15 hover:bg-black/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 text-[0.875rem] font-bold text-black/70 hover:text-black transition-all duration-200 active:scale-95 group whitespace-nowrap shrink-0"
                  title="Copy Link"
                >
                  <Copy weight="bold" className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                  <span className="hidden sm:inline">Copy Link</span>
                </button>

                {/* Publish Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  loading={isPublishing}
                  icon={<Rocket weight="fill" className="w-5 h-5" />}
                  className="h-11 px-6 sm:px-7 text-[0.875rem] font-bold !bg-black hover:!bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 !rounded-[14px] whitespace-nowrap transition-all duration-200 shadow-md active:scale-95 shrink-0"
                >
                  Publish
                </Button>
              </div>
            </div>

            {/* ─── Three Column Layout ─── */}
            <div className="flex flex-col xl:flex-row gap-8 items-start justify-center w-full">
              
              {/* ─── LEFT: Construction Zone (Add Fields) ─── */}
              <div className="w-full xl:w-[340px] shrink-0 relative xl:sticky xl:top-24 space-y-6 max-w-[820px] xl:max-w-none mx-auto xl:mx-0 order-2 xl:order-1">
                <div className="doppelrand">
                  <div className="doppelrand-inner bg-white border border-black/5 p-6">
                    <h3 className="text-[0.6875rem] font-black text-black/40 uppercase tracking-[0.2em] mb-4">
                      Add Field
                    </h3>
                    <div className="flex flex-col gap-2">
                      {FIELD_TYPES.map((ft) => {
                        const Icon = ft.icon;
                        const isCurrentlyDragging = draggingNewField === ft.type;
                        return (
                          <button
                            key={ft.type}
                            draggable="true"
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', ft.type);
                              e.dataTransfer.effectAllowed = 'copy';
                              setDraggingNewField(ft.type);
                            }}
                            onDragEnd={() => {
                              setDraggingNewField(null);
                            }}
                            onClick={() => store.addField(ft.type)}
                            className={`flex items-center gap-3.5 px-5 h-12 rounded-md border text-[0.875rem] font-semibold transition-all duration-200 active:scale-[0.97] group cursor-grab active:cursor-grabbing ${
                              isCurrentlyDragging 
                                ? 'bg-black/[0.02] border-dashed border-black/20 opacity-40' 
                                : 'bg-[#fdfdfd] border-black/[0.06] text-black/60 hover:text-black hover:bg-black/[0.02] hover:border-black/20'
                            }`}
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
              <div className="doppelrand max-w-[820px] mx-auto w-full order-1 xl:order-2">
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
                        {store.form.coverUrl && (
                          <img 
                            src={store.form.coverUrl} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover/header:scale-105"
                          />
                        )}
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
                          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 pointer-events-none">
                            <div 
                              onClick={() => logoFileInputRef.current?.click()}
                              className="w-28 h-28 rounded-md bg-white border border-black/5 shadow-2xl flex items-center justify-center pointer-events-auto group/logo cursor-pointer hover:scale-[1.02] transition-all overflow-hidden relative"
                            >
                              {store.form.logoUrl ? (
                                <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-accent/5 flex items-center justify-center">
                                  <ImageIcon weight="bold" className="w-10 h-10 text-accent/40 transition-transform duration-300 group-hover/logo:scale-110" />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <div className="bg-white/90 backdrop-blur-md border border-black/5 text-black text-[0.6875rem] font-bold h-8 px-2.5 rounded-md shadow-xl flex items-center justify-center whitespace-nowrap">
                                  Change Logo
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      store.form.showIcon && (
                        <div className="pt-20 flex justify-center">
                          <div 
                            onClick={() => logoFileInputRef.current?.click()}
                            className="w-28 h-28 rounded-md bg-white border border-black/[0.05] shadow-xl flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all overflow-hidden relative group/logo"
                          >
                            {store.form.logoUrl ? (
                              <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-accent/5 flex items-center justify-center">
                                <ImageIcon weight="bold" className="w-10 h-10 text-accent/40 transition-transform duration-300 group-hover/logo:scale-110" />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center p-2">
                              <div className="bg-white/90 backdrop-blur-md border border-black/5 text-black text-[0.6875rem] font-bold h-8 px-2.5 rounded-md shadow-xl flex items-center justify-center whitespace-nowrap">
                                Change Logo
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <div className={`px-6 md:px-12 pb-8 md:pb-12 bg-white flex flex-col gap-4 ${store.form.hasCover && store.form.showIcon ? 'pt-16' : (!store.form.hasCover && !store.form.showIcon ? 'pt-20' : 'pt-12')}`}>
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
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      setIsCanvasDragOver(true);
                    }}
                    onDragLeave={() => {
                      setIsCanvasDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsCanvasDragOver(false);
                      const fieldType = e.dataTransfer.getData('text/plain');
                      if (fieldType && FIELD_TYPES.some(ft => ft.type === fieldType)) {
                        store.addField(fieldType as any);
                      }
                    }}
                    className={`flex-1 p-4 sm:p-6 md:p-12 bg-[#fafafa] transition-all duration-300 ${
                      isCanvasDragOver ? 'bg-black/[0.01]' : ''
                    }`}
                  >
                    {store.form.fields.length === 0 ? (
                      <div className={`py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-[20px] transition-all duration-300 ${
                        isCanvasDragOver 
                          ? 'border-black/20 bg-black/[0.02] scale-[0.99] shadow-inner' 
                          : 'border-transparent bg-transparent'
                      }`}>
                        <div className={`w-16 h-16 rounded-3xl bg-white border border-black/5 shadow-sm flex items-center justify-center mb-6 transition-all duration-300 ${
                          isCanvasDragOver ? 'scale-110 border-black/15 shadow-md' : ''
                        }`}>
                          <PencilSimpleLine weight="bold" className={`w-8 h-8 text-black/15 transition-colors duration-300 ${
                            isCanvasDragOver ? 'text-black/40' : ''
                          }`} />
                        </div>
                        <h3 className="text-[1.25rem] font-black text-black mb-2 transition-colors duration-300">
                          {isCanvasDragOver ? 'Drop to Add Field!' : 'No Fields Yet'}
                        </h3>
                        <p className="text-black/40 text-[0.875rem] font-medium text-center max-w-[320px] transition-colors duration-300">
                          {isCanvasDragOver 
                            ? 'Release the mouse button to append this field.' 
                            : 'Drag a field from the left panel, or click to add.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 max-w-[700px] mx-auto">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={store.form.fields.map((f) => f.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-6">
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

                        {/* Drag and Drop append indicator */}
                        {isCanvasDragOver && (
                          <div className="border-2 border-dashed border-black/10 bg-black/[0.01] rounded-2xl h-24 flex flex-col items-center justify-center gap-1.5 animate-pulse text-[0.875rem] font-bold text-black/35 select-none transition-all duration-300">
                            <Plus weight="bold" className="w-5 h-5 text-black/20" />
                            <span>Drop here to Add {draggingNewField ? FIELD_TYPES.find(f => f.type === draggingNewField)?.label : 'Field'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── RIGHT: Inspector Zone (Settings & Style) ─── */}
              <div className="w-full xl:w-[380px] shrink-0 relative xl:sticky xl:top-24 space-y-6 max-w-[820px] xl:max-w-none mx-auto xl:mx-0 order-3">
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
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => store.setHasCover(false)}
                                className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-[12px] border transition-all duration-200 ${
                                  !store.form.hasCover 
                                    ? 'bg-white border-black text-black shadow-sm' 
                                    : 'bg-white border-black/[0.06] hover:bg-black/[0.02] hover:border-black/20 text-black/40 hover:text-black/60'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${!store.form.hasCover ? 'text-black' : 'text-black/30'}`}>
                                  <FileText weight="bold" className="w-5 h-5" />
                                </div>
                                <span className="text-[0.75rem] font-bold">No Cover</span>
                              </button>
                              <button
                                onClick={() => store.setHasCover(true)}
                                className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-[12px] border transition-all duration-200 ${
                                  store.form.hasCover 
                                    ? 'bg-white border-black text-black shadow-sm' 
                                    : 'bg-white border-black/[0.06] hover:bg-black/[0.02] hover:border-black/20 text-black/40 hover:text-black/60'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${store.form.hasCover ? 'text-black' : 'text-black/30'}`}>
                                  <ImageIcon weight="bold" className="w-5 h-5" />
                                </div>
                                <span className="text-[0.75rem] font-bold">Cover</span>
                              </button>
                            </div>

                            {store.form.hasCover && (
                              <div 
                                onClick={() => {
                                  if (!store.form.coverUrl) {
                                    document.getElementById('cover-upload')?.click();
                                  }
                                }}
                                className={`relative group aspect-[3/1] rounded-[12px] overflow-hidden border transition-all duration-300 ${
                                  store.form.coverUrl 
                                    ? 'border-black/[0.05] bg-black/[0.02]' 
                                    : 'border-dashed border-black/10 hover:border-black/25 bg-[#fdfdfd] hover:bg-black/[0.02] cursor-pointer flex flex-col items-center justify-center'
                                }`}
                              >
                                {store.form.coverUrl ? (
                                  <>
                                    <img 
                                      src={store.form.coverUrl} 
                                      alt="Cover preview" 
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          document.getElementById('cover-upload')?.click();
                                        }}
                                        className="bg-white/90 backdrop-blur-md border-none text-black text-[0.75rem] font-bold h-9 px-4 rounded-md shadow-xl hover:bg-white active:scale-95 transition-all"
                                      >
                                        Change Cover
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1 p-4 text-black/35 select-none">
                                    <ImageIcon weight="bold" className="w-5 h-5 text-black/20 group-hover:text-black/40 transition-colors" />
                                    <span className="text-[0.6875rem] font-bold tracking-tight text-black/40">Upload Cover</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Show Icon Toggle */}
                        <div className="pt-4 border-t border-black/[0.04] space-y-3">
                          <div className="flex items-center justify-between">
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

                          {store.form.showIcon && (
                            <div className="flex items-center gap-4 animate-fade-in pt-1">
                              <div
                                onClick={() => {
                                  if (!store.form.logoUrl) {
                                    document.getElementById('logo-upload')?.click();
                                  }
                                }}
                                className={`relative group w-20 h-20 rounded-[12px] overflow-hidden border transition-all duration-300 flex items-center justify-center shrink-0 ${
                                  store.form.logoUrl 
                                    ? 'border-black/[0.05] bg-black/[0.02]' 
                                    : 'border-dashed border-black/10 hover:border-black/25 bg-[#fdfdfd] hover:bg-black/[0.02] cursor-pointer'
                                }`}
                              >
                                {store.form.logoUrl ? (
                                  <>
                                    <img 
                                      src={store.form.logoUrl} 
                                      alt="Logo preview" 
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          document.getElementById('logo-upload')?.click();
                                        }}
                                        className="bg-white/90 backdrop-blur-md border-none text-black text-[0.6875rem] font-bold h-8 px-2.5 rounded shadow-md hover:bg-white active:scale-95 transition-all whitespace-nowrap"
                                      >
                                        Change Logo
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-black/35 group-hover:text-black/50 transition-colors">
                                    <ImageIcon weight="bold" className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[0.75rem] font-bold text-black">Upload Logo</span>
                                <span className="text-[0.625rem] font-medium text-black/40">Square PNG, JPG, or SVG</span>
                              </div>
                              
                              <input 
                                id="logo-upload"
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => store.setLogoUrl(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
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
                          <div className="flex items-center justify-between px-1 mt-4">
                            {['#34d399', '#3b82f6', '#f472b6', '#f59e0b', '#fb7185', '#94a3b8', '#000000'].map(color => (
                              <button
                                key={color}
                                onClick={() => store.setAccentColor(color)}
                                aria-label={`Select accent color ${color}`}
                                className={`w-8 h-8 rounded-full transition-all duration-300 ease-[var(--ease-spring)] ${
                                  store.form.accentColor === color 
                                    ? 'ring-2 ring-offset-2 ring-black scale-110 shadow-md' 
                                    : 'border border-black/10 hover:scale-110 hover:shadow-sm'
                                }`}
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
          hideHeader={true}
          noPadding={true}
          size="lg"
        >
          <div
            className="max-h-[90vh] overflow-y-auto custom-scrollbar relative bg-white"
            style={{ '--accent-color': store.form.accentColor } as any}
          >
            <div className="space-y-0 bg-white min-h-[500px]">
              {store.form.hasCover && (
                <div className="relative w-full h-[260px] sm:h-[320px] overflow-visible">
                  <img src={store.form.coverUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />
                  
                  {store.form.showIcon && (
                    <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 z-10">
                      <div className="w-28 h-28 rounded-2xl bg-white border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden">
                        {store.form.logoUrl ? (
                          <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-accent/5 flex items-center justify-center">
                            <ImageIcon weight="bold" className="w-10 h-10 text-accent/40" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`px-6 sm:px-16 py-14 space-y-10 ${store.form.hasCover && store.form.showIcon ? 'pt-24' : ''}`}>
                {!store.form.hasCover && store.form.showIcon && (
                  <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-black/[0.08] shadow-lg flex items-center justify-center overflow-hidden">
                      {store.form.logoUrl ? (
                        <img src={store.form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-accent/5 flex items-center justify-center">
                          <ImageIcon weight="bold" className="w-8 h-8 text-accent/40" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-center pb-8 border-b border-black/[0.04]">
                  <h2 className="text-[2rem] font-black text-black tracking-tight mb-3">
                    {store.form.title || 'Untitled Form'}
                  </h2>
                  <p className="text-[1.125rem] text-black/50 leading-relaxed max-w-2xl mx-auto font-medium">
                    {store.form.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-12 py-4 max-w-3xl mx-auto">
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
                    <div className="py-16 text-center bg-black/[0.02] rounded-xl border border-dashed border-black/10">
                      <p className="text-[0.875rem] font-bold text-black/30 uppercase tracking-widest">
                        No fields added to this form yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-10 mt-10 border-t border-black/[0.04] max-w-3xl mx-auto pb-6">
                  <Button
                    variant="primary"
                    className="w-full h-14 !rounded-xl !text-white !text-[1rem] font-bold shadow-xl shadow-black/10 border-none hover:scale-[1.01] active:scale-[0.98] transition-all"
                    style={{ backgroundColor: store.form.accentColor }}
                    onClick={() => {
                      alert('This is a preview. Submissions are disabled.');
                    }}
                  >
                    Submit Response
                  </Button>
                  <p className="text-center text-[0.75rem] text-black/40 mt-6 font-medium tracking-wide">
                    Secured by FormSeal Cryptography
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
