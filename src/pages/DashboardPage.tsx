import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWalletStore, useDashboardStore, useToastStore } from "@/stores/appStore";
import { fetchFromWalrus } from "@/lib/walrus";
import { sealDecrypt } from "@/lib/seal";
import { Button, Badge, EmptyState, Skeleton, Modal, ProtocolAttribution, cn } from "@/components/ui";
import type { FormSchema, FormIndex, FormSubmission, SubmissionMeta, PriorityTag } from "@/types";
import { 
  Wallet, 
  SquaresFour, 
  Lock, 
  MagnifyingGlass, 
  Star, 
  CalendarBlank, 
  CaretRight, 
  ArrowLeft, 
  NotePencil, 
  ArrowSquareOut, 
  FileXls, 
  FileJs, 
  FileText, 
  ShieldCheck, 
  TrendUp,
  Clock,
  Export,
  Database,
  X,
  ChartLineUp,
  Rows
} from "@phosphor-icons/react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type TabType = 'forms' | 'submissions' | 'analytics';

export function DashboardPage() {
  const { address, connect, isConnecting } = useWalletStore();
  const { forms } = useDashboardStore();
  const { addToast, removeToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<TabType>('forms');
  const [selectedFormBlobId, setSelectedFormBlobId] = useState<string | null>(null);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionMeta[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<PriorityTag | 'all'>('all');
  const [notesModal, setNotesModal] = useState<{ subBlobId: string; notes: string; } | null>(null);

  useEffect(() => {
    console.log("FormSeal Dashboard: Native Page Mode Active");
  }, []);

  // ─── Load submissions for a form ───
  const loadFormDetail = useCallback(async (formBlobId: string) => {
    setSelectedFormBlobId(formBlobId);
    setLoadingSubmissions(true);
    setSubmissions([]);

    try {
      const schema = await fetchFromWalrus<FormSchema>(formBlobId);
      setFormSchema(schema);

      const indexKey = `formseal-index-${formBlobId}`;
      const indexBlobId = localStorage.getItem(indexKey);

      if (!indexBlobId) {
        setLoadingSubmissions(false);
        return;
      }

      const index = await fetchFromWalrus<FormIndex>(indexBlobId);
      const metas: SubmissionMeta[] = [];

      for (const subBlobId of index.submissionBlobIds) {
        try {
          const raw = await fetchFromWalrus<any>(subBlobId);
          const noteKey = `formseal-note-${subBlobId}`;
          const storedMeta = JSON.parse(localStorage.getItem(noteKey) || '{}');

          if (raw.encrypted) {
            metas.push({
              blobId: subBlobId,
              submission: {
                id: subBlobId,
                formBlobId,
                fields: [],
                submittedAt: raw.submittedAt || Date.now(),
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
        title: 'Sync Error',
        description: 'Walrus aggregator is unreachable.'
      });
    } finally {
      setLoadingSubmissions(false);
    }
  }, [addToast]);

  // ─── Decrypt ───
  const handleDecrypt = useCallback(async (subBlobId: string) => {
    if (!address) return;
    const tId = addToast({ type: 'loading', title: 'Authorizing Seal Access...' });
    try {
      const raw = await fetchFromWalrus<{ encrypted: boolean; payload: string }>(subBlobId);
      const submission = JSON.parse(await sealDecrypt(raw.payload, address));
      setSubmissions(prev => prev.map(s => s.blobId === subBlobId ? { ...s, submission, decrypted: true } : s));
      removeToast(tId);
      addToast({ type: 'success', title: 'Data Decrypted' });
    } catch (err) {
      removeToast(tId);
      addToast({ type: 'error', title: 'Decryption Failed' });
    }
  }, [address, addToast, removeToast]);

  // ─── Export ───
  const handleExport = useCallback((format: 'json' | 'xlsx') => {
    const exportData = submissions.filter(s => s.decrypted).map(s => {
      const row: any = { id: s.blobId, timestamp: new Date(s.submission.submittedAt).toISOString() };
      s.submission.fields.forEach(f => {
        const field = formSchema?.fields.find(ff => ff.id === f.fieldId);
        row[field?.label || f.fieldId] = f.value;
      });
      return row;
    });

    if (format === 'json') {
      saveAs(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }), 'export.json');
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      saveAs(new Blob([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })]), 'export.xlsx');
    }
  }, [submissions, formSchema]);

  // ─── Wallet Gate ───
  if (!address) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-[#f0eeeb] min-h-screen">
        <div className="max-w-[420px] w-full text-center animate-fade-in">
          <div className="doppelrand mb-10">
            <div className="doppelrand-inner bg-white p-12">
              <div className="w-20 h-20 rounded-3xl bg-black/[0.03] border border-black/5 flex items-center justify-center mx-auto mb-8">
                <Lock weight="duotone" className="w-10 h-10 text-black/20" />
              </div>
              <h1 className="text-[2rem] font-black tracking-tight text-black mb-4">Architect Vault</h1>
              <p className="text-[0.9375rem] text-black/40 font-medium mb-10 leading-relaxed">
                Connect your identity to manage Walrus form architectures.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={connect}
                loading={isConnecting}
                className="w-full h-14 !rounded-2xl !bg-black !text-white"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
          <ProtocolAttribution compact />
        </div>
      </div>
    );
  }

  // ─── Main Content ───
  return (
    <div className="flex-1 px-4 md:px-12 pt-36 pb-24 bg-[#f0eeeb] min-h-screen">
      <div className="max-w-[1200px] mx-auto animate-fade-in space-y-16">
        
        {/* Page Header - Directly on background */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-black/40">Secure Console</span>
            </div>
            <h1 className="text-[4rem] font-black tracking-tighter text-black leading-[0.9]">
              Control Center
            </h1>
            <p className="text-[1.125rem] text-black/40 font-medium max-w-[480px] leading-relaxed">
              Manage your decentralized architectures. Submissions are fetched directly from Walrus blobs.
            </p>
          </div>

          <div className="flex flex-col items-end gap-6">
             {/* Tab Switcher - Directly on background */}
             <div className="flex p-1.5 bg-black/[0.04] rounded-2xl w-fit">
                {(['forms', 'submissions', 'analytics'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSelectedFormBlobId(null); }}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[0.875rem] font-black transition-all",
                      activeTab === tab ? "bg-white text-black shadow-sm" : "text-black/30 hover:text-black"
                    )}
                  >
                    {tab === 'forms' ? 'My Forms' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
          </div>
        </div>

        {/* Stats Grid - Independent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="doppelrand">
            <div className="doppelrand-inner bg-white p-10 flex flex-col justify-between h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.02] border border-black/5 flex items-center justify-center">
                <SquaresFour weight="bold" className="text-black/20 w-7 h-7" />
              </div>
              <div>
                <div className="text-[3rem] font-black text-black leading-none">{forms.length}</div>
                <div className="text-[0.625rem] font-black text-black/30 uppercase tracking-[0.2em] mt-3">Active Architectures</div>
              </div>
            </div>
          </div>

          <div className="doppelrand">
            <div className="doppelrand-inner bg-white p-10 flex flex-col justify-between h-[220px]">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-black/[0.02] border border-black/5 flex items-center justify-center">
                  <ChartLineUp weight="bold" className="text-black/20 w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#34d399]/10 text-[#34d399] text-[0.625rem] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Live Sync
                </div>
              </div>
              <div>
                <div className="text-[3rem] font-black text-black leading-none">
                  {forms.reduce((a, f) => a + (f.submissionCount || 0), 0)}
                </div>
                <div className="text-[0.625rem] font-black text-black/30 uppercase tracking-[0.2em] mt-3">Total Submissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Selection logic */}
        <div className="space-y-6">
          
          {/* Form List View */}
          {activeTab === 'forms' && !selectedFormBlobId && (
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2 mb-2">
                 <h2 className="text-[0.625rem] font-black text-black/30 uppercase tracking-[0.4em]">Vault Inventory</h2>
               </div>
               {forms.length === 0 ? (
                 <div className="doppelrand"><div className="doppelrand-inner bg-white p-24 text-center"><EmptyState icon={<FileText />} title="Empty Vault" description="No forms published yet." /></div></div>
               ) : (
                 forms.map((form, i) => (
                   <div key={form.formBlobId} className="doppelrand group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                     <div 
                        className="doppelrand-inner bg-white p-8 cursor-pointer hover:bg-black/[0.01] transition-all"
                        onClick={() => loadFormDetail(form.formBlobId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <div className="w-14 h-14 rounded-2xl bg-black/[0.03] flex items-center justify-center group-hover:bg-black group-hover:scale-110 transition-all duration-500">
                              <FileText weight="bold" className="w-7 h-7 text-black/20 group-hover:text-white" />
                            </div>
                            <div>
                              <h3 className="text-[1.25rem] font-black text-black tracking-tight mb-1">{form.title || 'Untitled'}</h3>
                              <div className="flex items-center gap-3 text-[0.8125rem] font-bold text-black/30">
                                <span>{form.submissionCount} Records</span>
                                <span className="w-1 h-1 rounded-full bg-black/10" />
                                <span className="font-mono text-[0.75rem]">{form.formBlobId.slice(0, 16)}...</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="accent" className="!bg-black/[0.03] !text-black/40 !border-black/5">Live</Badge>
                            <Badge variant="default" className="!bg-black/5 !text-black/60"><Lock weight="fill" className="mr-1.5" /> Sealed</Badge>
                            <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-black/10 group-hover:text-black group-hover:translate-x-1 transition-all">
                              <CaretRight weight="bold" className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                     </div>
                   </div>
                 ))
               )}
            </div>
          )}

          {/* Submission Detail View */}
          {selectedFormBlobId && (
            <div className="space-y-12 animate-fade-in">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSelectedFormBlobId(null)}
                  className="w-12 h-12 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center text-black/40 hover:text-black hover:scale-110 transition-all"
                >
                  <ArrowLeft weight="bold" className="w-5 h-5" />
                </button>
                <div>
                   <h2 className="text-[2.5rem] font-black tracking-tighter text-black leading-none mb-2">{formSchema?.title}</h2>
                   <div className="text-[0.8125rem] font-bold text-black/30">ID: {selectedFormBlobId}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
                 <div className="doppelrand shadow-sm sticky top-32">
                    <div className="doppelrand-inner bg-white p-6 space-y-8">
                       <div className="space-y-4">
                         <label className="text-[0.625rem] font-black text-black/30 uppercase tracking-[0.2em] block">Search Records</label>
                         <div className="relative">
                            <MagnifyingGlass weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                            <input
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Filter results..."
                              className="w-full pl-11 pr-4 py-3.5 bg-[#fafafa] border border-black/5 rounded-xl text-[0.875rem] font-medium"
                            />
                         </div>
                       </div>
                       <div className="flex flex-col gap-3">
                          <Button variant="secondary" onClick={() => handleExport('json')} className="h-12 !bg-white !rounded-xl !border-black/5 font-bold">Export JSON</Button>
                          <Button variant="secondary" onClick={() => handleExport('xlsx')} className="h-12 !bg-white !rounded-xl !border-black/5 font-bold">Export XLSX</Button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {loadingSubmissions ? (
                      [1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />)
                    ) : (
                      submissions.map((sub, idx) => (
                        <div key={sub.blobId} className="doppelrand animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                          <div className="doppelrand-inner bg-white p-8">
                             <div className="flex items-center justify-between mb-8">
                                <div className="px-3 py-1.5 rounded-lg bg-black/[0.03] text-[0.75rem] font-bold text-black/60">
                                   {new Date(sub.submission.submittedAt).toLocaleString()}
                                </div>
                                <div className="font-mono text-[0.625rem] text-black/20">ID: {sub.blobId.slice(0, 16)}</div>
                             </div>

                             {sub.decrypted ? (
                               <div className="grid grid-cols-2 gap-8">
                                 {sub.submission.fields.map(f => (
                                   <div key={f.fieldId} className="space-y-1">
                                      <div className="text-[0.625rem] font-black text-black/30 uppercase tracking-widest">{f.fieldId}</div>
                                      <div className="font-bold text-black">{String(f.value)}</div>
                                   </div>
                                 ))}
                               </div>
                             ) : (
                               <div className="flex flex-col items-center justify-center py-10 bg-black/[0.01] rounded-3xl border border-dashed border-black/10">
                                  <ShieldCheck weight="fill" className="w-8 h-8 text-black/10 mb-4" />
                                  <p className="text-[0.875rem] font-bold text-black/40 mb-6">Payload is encrypted via Seal.</p>
                                  <Button variant="primary" onClick={() => handleDecrypt(sub.blobId)} className="!rounded-xl !bg-black !text-white h-10 px-6 font-bold">Decrypt</Button>
                               </div>
                             )}
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && !selectedFormBlobId && (
             <div className="py-24 text-center"><EmptyState icon={<Rows />} title="Submissions Feed" description="Select a vault to view specific records." /></div>
          )}

          {activeTab === 'analytics' && (
             <div className="py-24 text-center text-black/20 font-black uppercase tracking-[0.4em]">Advanced Analytics Module Disabled</div>
          )}
        </div>

        <div className="mt-24">
          <ProtocolAttribution compact />
        </div>
      </div>
    </div>
  );
}
