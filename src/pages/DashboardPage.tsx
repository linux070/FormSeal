import { useState, useCallback } from 'react';
import { useWalletStore, useDashboardStore, useToastStore } from '@/stores/appStore';
import { fetchFromWalrus } from '@/lib/walrus';
import { sealDecrypt } from '@/lib/seal';
import { Button, Badge, EmptyState, Skeleton, Modal, ProtocolAttribution } from '@/components/ui';
import type {
  FormSchema,
  FormIndex,
  FormSubmission,
  SubmissionMeta,
  PriorityTag,
} from '@/types';
import {
  Wallet,
  SquaresFour,
  Eye,
  Lock,
  LockOpen,
  Funnel,
  Star,
  CalendarBlank,
  CaretRight,
  ArrowLeft,
  MagnifyingGlass,
  NotePencil,
  ArrowSquareOut,
  FileXls,
  FileJs,
  DownloadSimple,
  X,
  ChartBar,
  FileText,
  ShieldCheck,
  TrendUp,
} from '@phosphor-icons/react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

type DashboardView = 'list' | 'detail';

const PRIORITY_CONFIG: Record<
  PriorityTag,
  { label: string; variant: 'default' | 'info' | 'warning' | 'danger' }
> = {
  low: { label: 'Low', variant: 'default' },
  medium: { label: 'Medium', variant: 'info' },
  high: { label: 'High', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
};

export function DashboardPage() {
  const { address, connect, isConnecting } = useWalletStore();
  const { forms } = useDashboardStore();
  const { addToast, removeToast } = useToastStore();

  const [view, setView] = useState<DashboardView>('list');
  const [activeTab, setActiveTab] = useState<'forms' | 'submissions' | 'analytics'>('forms');
  const [selectedFormBlobId, setSelectedFormBlobId] = useState<string | null>(null);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionMeta[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<PriorityTag | 'all'>('all');
  const [notesModal, setNotesModal] = useState<{
    subBlobId: string;
    notes: string;
  } | null>(null);

  // ─── Load submissions for a form ───
  const loadFormDetail = useCallback(
    async (formBlobId: string) => {
      setSelectedFormBlobId(formBlobId);
      setView('detail');
      setLoadingSubmissions(true);
      setSubmissions([]);

      try {
        // Load form schema
        const schema = await fetchFromWalrus<FormSchema>(formBlobId);
        setFormSchema(schema);

        // Load index blob
        const indexKey = `formseal-index-${formBlobId}`;
        const indexBlobId = localStorage.getItem(indexKey);

        if (!indexBlobId) {
          setLoadingSubmissions(false);
          return;
        }

        const index = await fetchFromWalrus<FormIndex>(indexBlobId);

        // Load each submission
        const metas: SubmissionMeta[] = [];
        for (const subBlobId of index.submissionBlobIds) {
          try {
            const raw = await fetchFromWalrus<FormSubmission | { encrypted: boolean; payload: string }>(
              subBlobId
            );

            // Load persisted notes/priority from localStorage
            const noteKey = `formseal-note-${subBlobId}`;
            const storedMeta = JSON.parse(localStorage.getItem(noteKey) || '{}');

            if ('payload' in raw && raw.encrypted) {
              metas.push({
                blobId: subBlobId,
                submission: {
                  id: subBlobId,
                  formBlobId,
                  fields: [],
                  submittedAt: (raw as unknown as Record<string, number>).submittedAt || Date.now(),
                  encrypted: true,
                },
                notes: storedMeta.notes || '',
                priority: storedMeta.priority || 'low',
                decrypted: false,
              });
            } else {
              metas.push({
                blobId: subBlobId,
                submission: raw as FormSubmission,
                notes: storedMeta.notes || '',
                priority: storedMeta.priority || 'low',
                decrypted: true,
              });
            }
          } catch (err) {
            console.warn(`Failed to load submission ${subBlobId}`, err);
          }
        }

        setSubmissions(metas);
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to load form',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        setLoadingSubmissions(false);
      }
    },
    [addToast]
  );

  // ─── Decrypt a submission ───
  const handleDecrypt = useCallback(
    async (subBlobId: string) => {
      if (!address) return;
      const toastId = addToast({
        type: 'loading',
        title: 'Decrypting with Seal...',
      });

      try {
        const raw = await fetchFromWalrus<{ encrypted: boolean; payload: string }>(
          subBlobId
        );

        const decrypted = await sealDecrypt(raw.payload, address);
        const submission: FormSubmission = JSON.parse(decrypted);

        setSubmissions((prev) =>
          prev.map((s) =>
            s.blobId === subBlobId
              ? { ...s, submission, decrypted: true }
              : s
          )
        );

        removeToast(toastId);
        addToast({ type: 'success', title: 'Submission decrypted' });
      } catch (err) {
        removeToast(toastId);
        addToast({
          type: 'error',
          title: 'Decryption failed',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    },
    [address, addToast, removeToast]
  );

  // ─── Update priority ───
  const updatePriority = useCallback(
    (subBlobId: string, priority: PriorityTag) => {
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.blobId !== subBlobId) return s;
          const updated = { ...s, priority };
          localStorage.setItem(
            `formseal-note-${subBlobId}`,
            JSON.stringify({ notes: updated.notes, priority: updated.priority })
          );
          return updated;
        })
      );
    },
    []
  );

  // ─── Save notes ───
  const saveNotes = useCallback(
    (subBlobId: string, notes: string) => {
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.blobId !== subBlobId) return s;
          const updated = { ...s, notes };
          localStorage.setItem(
            `formseal-note-${subBlobId}`,
            JSON.stringify({ notes: updated.notes, priority: updated.priority })
          );
          return updated;
        })
      );
      setNotesModal(null);
    },
    []
  );

  // ─── Export ───
  const handleExport = useCallback(
    (format: 'json' | 'xlsx') => {
      if (!formSchema || submissions.length === 0) return;

      const exportData = submissions
        .filter((s) => s.decrypted)
        .map((s) => {
          const row: Record<string, unknown> = {
            submissionId: s.blobId,
            submittedAt: new Date(s.submission.submittedAt).toISOString(),
            priority: s.priority,
            notes: s.notes,
          };

          s.submission.fields.forEach((f) => {
            const field = formSchema.fields.find((ff) => ff.id === f.fieldId);
            const label = field?.label || f.fieldId;
            row[label] = Array.isArray(f.value) ? f.value.join(', ') : f.value;
          });

          return row;
        });

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        saveAs(blob, `${formSchema.title || 'submissions'}.json`);
      } else {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([buf], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${formSchema.title || 'submissions'}.xlsx`);
      }

      addToast({
        type: 'success',
        title: `Exported as ${format.toUpperCase()}`,
        description: `${exportData.length} submissions exported`,
      });
    },
    [formSchema, submissions, addToast]
  );

  // ─── Filter submissions ───
  const filteredSubmissions = submissions.filter((s) => {
    if (filterPriority !== 'all' && s.priority !== filterPriority) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesBlobId = s.blobId.toLowerCase().includes(term);
      const matchesField = s.submission.fields.some((f) => {
        const val = f.value;
        if (typeof val === 'string') return val.toLowerCase().includes(term);
        if (Array.isArray(val)) return val.some((v) => v.toLowerCase().includes(term));
        return false;
      });
      return matchesBlobId || matchesField;
    }
    return true;
  });

  // ─── Wallet Gate ───
  if (!address) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent-dim border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Wallet weight="duotone" className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            Connect Your Wallet
          </h2>
          <p className="text-text-muted text-[1rem] max-w-[40ch] mx-auto mb-6">
            Your wallet address is used to verify ownership of forms. Only the creator can view submissions.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={connect}
            loading={isConnecting}
            icon={<Wallet weight="bold" className="w-5 h-5" />}
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // ─── Detail View ───
  if (view === 'detail' && selectedFormBlobId) {
    return (
      <div className="flex-1 px-4 md:px-8 pt-28 pb-10">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setView('list');
                  setSelectedFormBlobId(null);
                }}
                className="w-9 h-9 rounded-[var(--radius-md)] bg-bg-hover border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-all duration-200"
                aria-label="Back to forms list"
              >
                <ArrowLeft weight="bold" className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  {formSchema?.title || 'Form Submissions'}
                </h1>
                <p className="text-[0.8125rem] text-text-muted">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                  {formSchema?.sensitive && (
                    <span className="ml-2 inline-flex items-center gap-1 text-accent">
                      <Lock weight="fill" className="w-3 h-3" />
                      Seal Encrypted
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('json')}
                icon={<FileJs weight="bold" className="w-4 h-4" />}
                disabled={submissions.filter((s) => s.decrypted).length === 0}
              >
                Export JSON
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('xlsx')}
                icon={<FileXls weight="bold" className="w-4 h-4" />}
                disabled={submissions.filter((s) => s.decrypted).length === 0}
              >
                Export XLSX
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in"
            style={{ animationDelay: '80ms' }}
          >
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlass
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search submissions..."
                className="w-full pl-9 pr-4 py-2.5 bg-bg-input border border-border-default rounded-[var(--radius-md)] text-[0.875rem] text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Funnel weight="bold" className="w-4 h-4 text-text-muted" />
              {(['all', 'low', 'medium', 'high', 'critical'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`
                    px-3 py-1.5 rounded-full text-[0.75rem] font-medium
                    transition-all duration-200 ease-[var(--ease-out-expo)]
                    ${
                      filterPriority === p
                        ? 'bg-accent text-bg-primary'
                        : 'bg-bg-hover text-text-muted hover:text-text-primary'
                    }
                  `}
                >
                  {p === 'all' ? 'All' : PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions */}
          {loadingSubmissions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={<SquaresFour weight="duotone" className="w-7 h-7" />}
              title="No Submissions"
              description={
                searchTerm || filterPriority !== 'all'
                  ? 'No submissions match your filters.'
                  : 'This form has no submissions yet. Share the form link to start collecting responses.'
              }
            />
          ) : (
            <div className="space-y-3 field-stagger">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.blobId}
                  className="doppelrand animate-fade-in"
                >
                  <div className="doppelrand-inner p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Submission Data */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="font-mono text-[0.75rem] text-text-muted truncate max-w-[200px]">
                            {sub.blobId.slice(0, 20)}...
                          </span>
                          <Badge
                            variant={
                              sub.decrypted
                                ? PRIORITY_CONFIG[sub.priority].variant
                                : 'default'
                            }
                            size="sm"
                          >
                            {sub.decrypted
                              ? PRIORITY_CONFIG[sub.priority].label
                              : 'Encrypted'}
                          </Badge>
                          {!sub.decrypted && (
                            <Badge variant="accent" size="sm">
                              <Lock weight="fill" className="w-3 h-3 mr-1" />
                              Sealed
                            </Badge>
                          )}
                          <span className="text-[0.6875rem] text-text-muted ml-auto">
                            {new Date(sub.submission.submittedAt).toLocaleString()}
                          </span>
                        </div>

                        {sub.decrypted ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {sub.submission.fields.slice(0, 6).map((f) => {
                              const field = formSchema?.fields.find(
                                (ff) => ff.id === f.fieldId
                              );
                              return (
                                <div key={f.fieldId}>
                                  <div className="text-[0.6875rem] text-text-muted uppercase tracking-wider">
                                    {field?.label || f.fieldId}
                                  </div>
                                  <div className="text-[0.875rem] text-text-primary truncate">
                                    {field?.type === 'star_rating' ? (
                                      <span className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star
                                            key={s}
                                            weight={
                                              s <= Number(f.value) ? 'fill' : 'regular'
                                            }
                                            className={`w-3.5 h-3.5 ${
                                              s <= Number(f.value)
                                                ? 'text-warning'
                                                : 'text-text-muted/20'
                                            }`}
                                          />
                                        ))}
                                      </span>
                                    ) : Array.isArray(f.value) ? (
                                      f.value.join(', ')
                                    ) : typeof f.value === 'string' &&
                                      f.value.startsWith('data:') ? (
                                      <span className="text-accent text-[0.8125rem]">
                                        [File uploaded]
                                      </span>
                                    ) : (
                                      String(f.value || '-')
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 py-3">
                            <div className="w-10 h-10 rounded-full bg-accent-dim flex items-center justify-center">
                              <Lock weight="fill" className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-[0.875rem] font-semibold text-text-primary">
                                Encrypted Submission
                              </p>
                              <p className="text-[0.8125rem] text-text-muted">
                                Sign with your wallet to decrypt this response
                              </p>
                            </div>
                          </div>
                        )}

                        {sub.notes && (
                          <div className="mt-3 px-3 py-2 rounded-[var(--radius-md)] bg-bg-input border border-border-subtle">
                            <div className="text-[0.6875rem] text-text-muted uppercase tracking-wider mb-0.5">
                              Notes
                            </div>
                            <p className="text-[0.8125rem] text-text-secondary">
                              {sub.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                        {!sub.decrypted && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDecrypt(sub.blobId)}
                            icon={
                              <LockOpen weight="bold" className="w-3.5 h-3.5" />
                            }
                          >
                            Decrypt
                          </Button>
                        )}

                        {sub.decrypted && (
                          <>
                            {/* Priority Selector */}
                            <select
                              value={sub.priority}
                              onChange={(e) =>
                                updatePriority(
                                  sub.blobId,
                                  e.target.value as PriorityTag
                                )
                              }
                              className="bg-bg-input border border-border-subtle rounded-[var(--radius-sm)] px-2 py-1.5 text-[1rem] text-text-primary focus:outline-none focus:border-accent"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>

                            <button
                              onClick={() =>
                                setNotesModal({
                                  subBlobId: sub.blobId,
                                  notes: sub.notes,
                                })
                              }
                              className="w-8 h-8 rounded-[var(--radius-sm)] bg-bg-hover border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-all duration-200"
                              aria-label="Edit notes"
                            >
                              <NotePencil weight="bold" className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <a
                          href={`https://walruscan.com/testnet/blob/${sub.blobId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-[var(--radius-sm)] bg-bg-hover border border-border-subtle flex items-center justify-center text-text-muted hover:text-accent transition-all duration-200"
                          aria-label="View on Walrus Explorer"
                        >
                          <ArrowSquareOut weight="bold" className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Modal */}
        {notesModal && (
          <Modal
            open={true}
            onClose={() => setNotesModal(null)}
            title="Submission Notes"
          >
            <div className="space-y-4">
              <textarea
                value={notesModal.notes}
                onChange={(e) =>
                  setNotesModal((prev) =>
                    prev ? { ...prev, notes: e.target.value } : null
                  )
                }
                placeholder="Add notes about this submission..."
                className="w-full px-3.5 py-2.5 bg-bg-input text-text-primary border border-border-default rounded-[var(--radius-md)] text-[1rem] placeholder:text-text-muted resize-y min-h-[100px] focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all duration-200"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setNotesModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    saveNotes(notesModal.subBlobId, notesModal.notes)
                  }
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ─── Main Admin Dashboard UI ───
  return (
    <div className="flex-1 px-4 md:px-8 pt-32 pb-20 bg-[#f0eeeb] min-h-screen">
      <div className="max-w-[1000px] mx-auto animate-fade-in">
        <div className="bg-[#0f1115] rounded-[2rem] border border-white/5 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-purple-500/20">
                  <div className="w-full h-full bg-[#0f1115] rounded-[14px] flex items-center justify-center">
                    <ChartBar weight="fill" className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-[1.75rem] font-black text-white tracking-tight leading-none">
                  Admin Dashboard
                </h1>
              </div>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[0.9375rem] text-white/40 font-medium max-w-[50ch]">
              Wallet-gated. Submissions fetched directly from Walrus blobs and decrypted with Seal.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 md:px-12 mb-8">
            <div className="p-1.5 bg-white/[0.03] rounded-2xl inline-flex items-center gap-1 border border-white/5">
              {(['forms', 'submissions', 'analytics'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-8 py-2.5 rounded-xl text-[0.8125rem] font-bold capitalize transition-all duration-300
                    ${activeTab === tab 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'text-white/30 hover:text-white/60'
                    }
                  `}
                >
                  {tab === 'forms' ? 'My Forms' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-8 md:px-12 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-between min-h-[140px] group hover:bg-white/[0.04] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[2.5rem] font-black text-white leading-none">
                  {forms.length}
                </span>
                <FileText weight="fill" className="w-6 h-6 text-white/20 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[0.875rem] font-bold text-white/30 uppercase tracking-widest">
                Forms
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-between min-h-[140px] group hover:bg-white/[0.04] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[2.5rem] font-black text-white leading-none">
                  {forms.reduce((acc, f) => acc + (f.submissionCount || 0), 0)}
                </span>
                <div className="w-8 h-8 rounded-full border-4 border-[#34d399]/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.5)] animate-pulse" />
                </div>
              </div>
              <span className="text-[0.875rem] font-bold text-white/30 uppercase tracking-widest">
                Submissions
              </span>
            </div>
          </div>

          {/* List Area */}
          <div className="px-8 md:px-12 mb-12">
            <div className="space-y-3">
              {forms.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                  <p className="text-white/20 font-bold">No forms published yet.</p>
                </div>
              ) : (
                forms.map((form) => (
                  <button
                    key={form.formBlobId}
                    onClick={() => loadFormDetail(form.formBlobId)}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.05] hover:border-white/10 transition-all group text-left"
                  >
                    <div>
                      <h3 className="text-[1.125rem] font-bold text-white mb-1">
                        {form.title || 'Untitled Form'}
                      </h3>
                      <div className="flex items-center gap-3 text-[0.75rem] font-medium text-white/20">
                        <span>{form.submissionCount} submissions</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{form.fieldsCount || 0} fields</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="truncate max-w-[120px]">Walrus blob:{form.formBlobId.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#34d399]/10 border border-[#34d399]/20">
                        <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        <span className="text-[0.625rem] font-black text-[#34d399] uppercase tracking-wider">Live</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Lock weight="fill" className="w-3 h-3 text-amber-500" />
                        <span className="text-[0.625rem] font-black text-amber-500 uppercase tracking-wider">Sealed</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 md:px-12 py-8 bg-white/[0.01] border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handleExport('json')}
              disabled={forms.length === 0}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-white/5 text-[0.875rem] font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <DownloadSimple weight="bold" className="w-4 h-4" />
              Export JSON
            </button>
            <button 
              onClick={() => handleExport('xlsx')}
              disabled={forms.length === 0}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-white/5 text-[0.875rem] font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <DownloadSimple weight="bold" className="w-4 h-4" />
              Export XLSX
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center h-14 rounded-2xl bg-white/5 text-[0.875rem] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

        <ProtocolAttribution />
      </div>

      {/* Re-use existing detail view logic but wrap in new aesthetic if needed */}
      {view === 'detail' && selectedFormBlobId && (
        <Modal
          open={true}
          onClose={() => setView('list')}
          title={formSchema?.title || 'Form Detail'}
        >
          {/* Detail content here... keeping simplified for now */}
          <div className="py-10 text-center">
            <p className="text-black/40">Loading submission data from Walrus...</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
