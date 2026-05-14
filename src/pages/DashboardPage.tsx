import { useState, useMemo } from 'react';
import { 
  SquaresFour, 
  FileText, 
  Database, 
  Export, 
  MagnifyingGlass, 
  Check, 
  CheckSquare,
  X, 
  ArrowUp, 
  ArrowRight, 
  ArrowDown,
  CaretLeft,
  CaretRight,
  ArrowLeft,
  Files,
  Seal,
  Globe,
  Clock,
  Plus,
  DownloadSimple,
  FilePdf,
  Code,
  User,
  AppWindow
} from "@phosphor-icons/react";
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
import { Button } from '@/components/ui';

// --- Mock Data ---
const SUBMISSIONS = [
  { 
    id: 1, 
    name: "Alex Rivera", 
    email: "alex@example.com", 
    form: "Contact Forms", 
    status: "new", 
    priority: "high", 
    time: "2m ago", 
    note: "Urgent: mentioned SLA breach", 
    content: "Hi, we need to discuss our enterprise contract renewal urgently. Please contact me ASAP.",
    blobId: "oehkoh0352bRGNPjuwcy0nye3OLKT649K62imdNAlXg",
    suiObjectId: "0x1c086e216c4d35bf4c1ea493aea701260ffa5b0070622b17271e4495a030fe83",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 2, 
    name: "Priya Sharma", 
    email: "priya@designco.io", 
    form: "Feedback Survey", 
    status: "reviewed", 
    priority: "medium", 
    time: "14m ago", 
    note: "", 
    content: "The new form builder UI is fantastic. Would love to see conditional logic features.",
    blobId: "bnpkuwcy0nye3OLKT649K62imdNAlXgoehkoh0352bR",
    suiObjectId: "0x2b17271e4495a030fe831c086e216c4d35bf4c1ea493aea701260ffa5b007062",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 3, 
    name: "Marcus T.", 
    email: "marcus@startupxyz.com", 
    form: "Demo Requests", 
    status: "pending", 
    priority: "high", 
    time: "31m ago", 
    note: "Follow up needed", 
    content: "Interested in FormSeal for our compliance workflow. Need demo ASAP, team decision this week.",
    blobId: "cy0nye3OLKT649K62imdNAlXgoehkoh0352bRGNPjuw",
    suiObjectId: "0x35bf4c1ea493aea701260ffa5b0070622b17271e4495a030fe831c086e216c4d",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 4, 
    name: "Linh Nguyen", 
    email: "linh@techwave.vn", 
    form: "Contact Forms", 
    status: "new", 
    priority: "low", 
    time: "1h ago", 
    note: "", 
    content: "Could you provide documentation on the Walrus blob persistence feature?",
    blobId: "mdNAlXgoehkoh0352bRGNPjuwcy0nye3OLKT649K62i",
    suiObjectId: "0x4c1ea493aea701260ffa5b0070622b17271e4495a030fe831c086e216c4d35bf",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 5, 
    name: "Carlos Mendez", 
    email: "carlos@blockflow.co", 
    form: "Feedback Survey", 
    status: "resolved", 
    priority: "low", 
    time: "2h ago", 
    note: "Resolved", 
    content: "Bug report: form validation on mobile seems off for email fields.",
    blobId: "GNPjuwcy0nye3OLKT649K62imdNAlXgoehkoh0352bR",
    suiObjectId: "0x5b0070622b17271e4495a030fe831c086e216c4d35bf4c1ea493aea701260ffa",
    network: "Testnet",
    encryptedWithSeal: false
  },
  { 
    id: 6, 
    name: "Sophie Wen", 
    email: "sophie@uxlab.design", 
    form: "Demo Requests", 
    status: "new", 
    priority: "medium", 
    time: "3h ago", 
    note: "", 
    content: "We run design workshops and would love a FormSeal integration. Can we schedule a call?",
    blobId: "KT649K62imdNAlXgoehkoh0352bRGNPjuwcy0nye3OL",
    suiObjectId: "0x6e216c4d35bf4c1ea493aea701260ffa5b0070622b17271e4495a030fe831c08",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 7, 
    name: "Omar Hassan", 
    email: "omar@databridge.io", 
    form: "Contact Forms", 
    status: "reviewed", 
    priority: "high", 
    time: "4h ago", 
    note: "Enterprise lead!", 
    content: "Inquiring about FormSeal for our data infrastructure. 500+ users, need SSO.",
    blobId: "uwcy0nye3OLKT649K62imdNAlXgoehkoh0352bRGNPj",
    suiObjectId: "0x701260ffa5b0070622b17271e4495a030fe831c086e216c4d35bf4c1ea493aea",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 8, 
    name: "Tamara Johnson", 
    email: "tamara@cloudnine.us", 
    form: "Feedback Survey", 
    status: "pending", 
    priority: "medium", 
    time: "5h ago", 
    note: "", 
    content: "Love the product! One request: dark mode for the form embed?",
    blobId: "ehkoh0352bRGNPjuwcy0nye3OLKT649K62imdNAlXgo",
    suiObjectId: "0x831c086e216c4d35bf4c1ea493aea701260ffa5b0070622b17271e4495a030fe",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 9, 
    name: "Yuki Tanaka", 
    email: "yuki@forgesync.jp", 
    form: "Demo Requests", 
    status: "new", 
    priority: "low", 
    time: "6h ago", 
    note: "", 
    content: "Looking for a form solution that supports Japanese characters fully.",
    blobId: "0nye3OLKT649K62imdNAlXgoehkoh0352bRGNPjuwcy",
    suiObjectId: "0x95a030fe831c086e216c4d35bf4c1ea493aea701260ffa5b0070622b17271e44",
    network: "Testnet",
    encryptedWithSeal: false
  },
  { 
    id: 10, 
    name: "Dev Patel", 
    email: "dev@launchpad.in", 
    form: "Contact Forms", 
    status: "new", 
    priority: "medium", 
    time: "7h ago", 
    note: "", 
    content: "How does FormSeal handle GDPR compliance for European submissions?",
    blobId: "649K62imdNAlXgoehkoh0352bRGNPjuwcy0nye3OLKT",
    suiObjectId: "0xa493aea701260ffa5b0070622b17271e4495a030fe831c086e216c4d35bf4c1e",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 11, 
    name: "Nina Kovac", 
    email: "nina@eurotech.eu", 
    form: "Feedback Survey", 
    status: "reviewed", 
    priority: "low", 
    time: "8h ago", 
    note: "", 
    content: "The analytics dashboard could use more granular date range selection.",
    blobId: "imdNAlXgoehkoh0352bRGNPjuwcy0nye3OLKT649K62",
    suiObjectId: "0xbf4c1ea493aea701260ffa5b0070622b17271e4495a030fe831c086e216c4d35",
    network: "Testnet",
    encryptedWithSeal: true
  },
  { 
    id: 12, 
    name: "James O'Brien", 
    email: "james@irishsaas.ie", 
    form: "Demo Requests", 
    status: "pending", 
    priority: "medium", 
    time: "10h ago", 
    note: "Scheduled call", 
    content: "We need a demo for our sales team. 3 decision-makers involved.",
    blobId: "Xgoehkoh0352bRGNPjuwcy0nye3OLKT649K62imdNAl",
    suiObjectId: "0xc086e216c4d35bf4c1ea493aea701260ffa5b0070622b17271e4495a030fe831",
    network: "Testnet",
    encryptedWithSeal: true
  },
];

const ACTIVITY = [
  { color: "var(--green)", text: "<strong>Alex Rivera</strong> submitted a Contact Form", time: "2m ago" },
  { color: "var(--blue)", text: "Admin reviewed <strong>Priya Sharma</strong>'s feedback", time: "18m ago" },
  { color: "var(--amber)", text: "Priority set to <strong>High</strong> on Marcus T.", time: "35m ago" },
  { color: "var(--sage)", text: "Note added to <strong>Omar Hassan</strong> submission", time: "4h ago" },
  { color: "var(--green)", text: "<strong>Feedback Survey</strong> collection hit 100 records", time: "5h ago" },
  { color: "var(--blue)", text: "Export completed — <strong>CSV</strong> · 87 records", time: "1d ago" },
  { color: "var(--text-tertiary)", text: "<strong>Demo Requests</strong> collection initialized", time: "2d ago" },
];

const EXPORT_HIST = [
  { fmt: "CSV", col: "All Collections", records: 248, date: "Today 09:14" },
  { fmt: "JSON", col: "Contact Forms", records: 87, date: "Yesterday" },
  { fmt: "PDF", col: "Feedback Survey", records: 124, date: "3 days ago" },
];

export function DashboardPage() {
  const currentAccount = useCurrentAccount();
  const [view, setView] = useState('dashboard');
  const [submissions, setSubmissions] = useState(SUBMISSIONS);

  /* Connection restricted state check moved inside container area */
  const [activity, setActivity] = useState(ACTIVITY);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority] = useState('all');
  const [currentSubId, setCurrentSubId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<'detail' | 'newCollection' | null>(null);
  const [tempNote, setTempNote] = useState('');

  // --- Export Function State ---
  const [exportFormat, setExportFormat] = useState('CSV');
  const [exportDateRange, setExportDateRange] = useState('Last 7 days');
  const [exportCollection, setExportCollection] = useState('All collections');
  const [includeAdminNotes, setIncludeAdminNotes] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exportHistState, setExportHistState] = useState(EXPORT_HIST);
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState(false);

  const executeExport = () => {
    setIsExporting(true);
    setExportToast(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportToast(true);
      // Prepend to persistent list
      const newEntry = {
        fmt: exportFormat,
        col: exportCollection,
        records: exportCollection === 'All collections' ? 248 : Math.floor(Math.random() * 80) + 20,
        date: 'Just now'
      };
      setExportHistState(prev => [newEntry, ...prev]);
      
      // Update real-time global event activity feed
      const newAct = {
        color: 'var(--blue)',
        text: `Export completed — <strong>${exportFormat}</strong> · ${newEntry.records} records`,
        time: 'Just now'
      };
      setActivity(prev => [newAct, ...prev]);

      // Dismiss feedback gracefully
      setTimeout(() => setExportToast(false), 4000);
    }, 1000);
  };

  // --- Filtering ---
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                            s.email.toLowerCase().includes(search.toLowerCase()) || 
                            s.form.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || s.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [submissions, search, filterStatus, filterPriority]);

  const showView = (v: string) => setView(v);

  const openDetail = (id: number) => {
    setCurrentSubId(id);
    const sub = submissions.find(s => s.id === id);
    if (sub) {
      setTempNote(sub.note);
      setIsModalOpen('detail');
    }
  };

  const navigateToSub = (direction: 'next' | 'prev') => {
    if (currentSubId === null) return;
    const currentIndex = filteredSubmissions.findIndex(s => s.id === currentSubId);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < filteredSubmissions.length) {
      const nextSub = filteredSubmissions[nextIndex];
      setCurrentSubId(nextSub.id);
      setTempNote(nextSub.note);
    }
  };

  const saveNote = () => {
    if (currentSubId !== null) {
      const sub = submissions.find(s => s.id === currentSubId);
      if (sub) {
        setSubmissions(prev => prev.map(s => s.id === currentSubId ? { ...s, note: tempNote, status: 'reviewed' } : s));
        if (tempNote) {
          const newAct = { color: 'var(--sage)', text: `Note added to <strong>${sub.name}</strong> submission`, time: 'Just now' };
          setActivity([newAct, ...activity]);
        }
      }
    }
    setIsModalOpen(null);
  };

  const currentSub = submissions.find(s => s.id === currentSubId);
  const currentIndex = filteredSubmissions.findIndex(s => s.id === currentSubId);

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = { new:'blue', reviewed:'green', pending:'amber', resolved:'neutral' };
    return (
      <div className={`badge ${map[status]}`}>
        <div className="dot"></div>
        {status}
      </div>
    );
  };

  const PriorityTag = ({ priority }: { priority: string }) => {
    const icons: Record<string, any> = { high: <ArrowUp />, medium: <ArrowRight />, low: <ArrowDown /> };
    const classes: Record<string, string> = { high: 'high', medium: 'med', low: 'low' };
    return (
      <div className={`priority ${classes[priority]}`}>
        {icons[priority]} {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </div>
    );
  };

  return (
    <div className="admin-layout">
      {/* --- Sidebar --- */}
      {currentAccount && (
        <div className="admin-sidebar">
          <SidebarItem active={view === 'dashboard'} onClick={() => showView('dashboard')} icon={<SquaresFour size={20} />} label="Dashboard" />
          <SidebarItem active={view === 'submissions'} onClick={() => showView('submissions')} icon={<FileText size={20} />} label="Submissions" />
          <SidebarItem active={view === 'collections'} onClick={() => showView('collections')} icon={<Database size={20} />} label="Collections" />
          <SidebarItem active={view === 'prioritize'} onClick={() => { showView('prioritize'); if (filteredSubmissions.length > 0 && currentSubId === null) { setCurrentSubId(filteredSubmissions[0].id); setTempNote(filteredSubmissions[0].note); } }} icon={<CheckSquare size={20} />} label="Feedback" />
          <SidebarItem active={view === 'export'} onClick={() => showView('export')} icon={<Export size={20} />} label="Export Data" />
        </div>
      )}

      <div className="admin-main">
        <div className="content-area">
          {!currentAccount ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12">
              <div className="doppelrand max-w-xl w-full mx-auto animate-fade-in">
                <div className="doppelrand-inner bg-white p-10 md:p-14 text-center flex flex-col items-center justify-center min-h-[380px] border border-black/5 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/[0.05] flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="text-[1.375rem] font-bold text-black tracking-tight mb-2">Access Restricted</h2>
                  <p className="text-[0.9375rem] font-medium text-black/50 leading-relaxed max-w-sm mb-8">
                    Connect your Web3 wallet to access the centralized management Dashboard and encrypted responses.
                  </p>
                  <ConnectModal
                    trigger={
                      <Button
                        variant="primary"
                        className="h-12 px-8 rounded-xl font-bold text-xs tracking-wider uppercase bg-black text-white hover:bg-black/90 hover:scale-105 active:scale-95 transition-all shadow-md shadow-black/5"
                      >
                        Connect Wallet
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          ) : null}

          {currentAccount && view === 'dashboard' && (
            <div id="view-dashboard" className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>Performance Overview</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Real-time stats from your decentralized form collections.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <StatCard label="Total Submissions" value="248" trend="+14.2%" trendUp icon={<Files size={24} />} />
                <StatCard label="Avg Response Time" value="12.4s" trend="-2.1s" trendUp icon={<Clock size={24} />} />
                <StatCard label="Decrypted Fields" value="1,842" trend="+340" trendUp icon={<Seal size={24} />} />
                <StatCard label="Active Forms" value="12" trend="0" icon={<SquaresFour size={24} />} />
                <StatCard label="Node Health" value="99.9%" trend="Stable" trendUp icon={<Globe size={24} />} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                 <div className="card" style={{ animationDelay: '0.1s' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Submissions</h2>
                      <button className="btn" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setView('submissions')}>View all</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Submitter</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Priority</th>
                            <th style={{ textAlign: 'right', padding: '16px 24px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.slice(0, 5).map(s => (
                            <tr key={s.id} onClick={() => openDetail(s.id)} className="table-row" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s.email}</div>
                              </td>
                              <td style={{ padding: '16px 24px' }}><StatusBadge status={s.status} /></td>
                              <td style={{ padding: '16px 24px' }}><PriorityTag priority={s.priority} /></td>
                              <td style={{ padding: '16px 24px', textAlign: 'right' }}><CaretRight size={16} color="var(--text-tertiary)" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>

                 <div className="card" style={{ animationDelay: '0.2s' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Live Activity</h2>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      {activity.map((a, i) => (
                        <div key={i} style={{ padding: '12px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, marginTop: '5px' }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: a.text }}></div>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{a.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {currentAccount && view === 'submissions' && (
            <div id="view-submissions" className="animate-fade-in">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--green)' }}>
                      Sui / Walrus Testnet Active
                    </span>
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>Submissions</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Batch decrypt and verify object-bound records from your permanent data containers.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn" onClick={() => setView('export')}><DownloadSimple size={18} style={{ marginRight: 8 }} /> Batch Export</button>
                  <button className="btn primary"><Check size={18} style={{ marginRight: 8 }} /> Mark as Reviewed</button>
                </div>
              </div>

              <div className="card">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                   <div style={{ position: 'relative', flex: 1 }}>
                      <MagnifyingGlass style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={18} />
                      <input 
                        type="text" 
                        placeholder="Search submissions..." 
                        className="btn" 
                        style={{ width: '100%', paddingLeft: '42px', textAlign: 'left', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                   </div>
                   <select className="btn filter-select" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', height: '42px', padding: '0 16px', fontSize: '13px', fontWeight: '700' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                     <option value="all">Any Status</option>
                     <option value="new">New</option>
                     <option value="reviewed">Reviewed</option>
                     <option value="resolved">Resolved</option>
                   </select>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {filteredSubmissions.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitter</th>
                          <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection</th>
                          <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storage Binding</th>
                          <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                          <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((s) => (
                          <tr key={s.id} onClick={() => openDetail(s.id)} className="table-row" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{s.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s.email}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <span className="tag" style={{ background: 'var(--surface2)', color: 'var(--text-secondary)' }}>{s.form}</span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', fontFamily: 'var(--mono)', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                  WALRUS TESTNET
                                </span>
                                {(s as any).encryptedWithSeal && (
                                  <span title="Threshold Encrypted via Seal SDK" style={{ color: 'var(--green)', display: 'flex', alignItems: 'center' }}>
                                    <Seal size={14} weight="fill" />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <StatusBadge status={s.status} />
                            </td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: '500' }}>
                              {s.time}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openDetail(s.id); }}>
                                <ArrowRight size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state">
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-tertiary)' }}>
                        <MagnifyingGlass size={32} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>No submissions found</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>We couldn't find any records matching your current filters or search query.</p>
                      <button className="btn" style={{ marginTop: '24px', padding: '10px 20px', borderRadius: '8px' }} onClick={() => { setSearch(''); setFilterStatus('all'); }}>Clear all filters</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentAccount && view === 'collections' && (
             <div id="view-collections" className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px', color: 'var(--text-primary)' }}>Collections</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Manage your on-chain data collections and blob persistence.</p>
                  </div>
                  <button className="btn primary" style={{ height: '42px', padding: '0 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' }} onClick={() => setIsModalOpen('newCollection')}>
                    <Plus size={18} weight="bold" style={{ marginRight: 8 }} /> Initialize Collection
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <CollectionCard title="CONTACT FORMS" count={87} icon={<User size={20} weight="regular" />} color="green" />
                  <CollectionCard title="FEEDBACK SURVEY" count={124} icon={<Check size={20} weight="bold" />} color="blue" />
                  <CollectionCard title="DEMO REQUESTS" count={37} icon={<AppWindow size={20} weight="regular" />} color="amber" />
                </div>
             </div>
          )}

          {currentAccount && view === 'export' && (
            <div id="view-export" className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div className="card">
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DownloadSimple size={20} />
                    <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Export Format</h2>
                  </div>
                  <div style={{ padding: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                      <FormatSelectionBtn active={exportFormat === 'CSV'} onClick={() => setExportFormat('CSV')} icon={<FileText size={24} />} title="CSV" sub="Spreadsheet" />
                      <FormatSelectionBtn active={exportFormat === 'JSON'} onClick={() => setExportFormat('JSON')} icon={<Code size={24} />} title="JSON" sub="Raw data" />
                      <FormatSelectionBtn active={exportFormat === 'PDF'} onClick={() => setExportFormat('PDF')} icon={<FilePdf size={24} />} title="PDF" sub="Report" />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date range</label>
                      <select 
                        value={exportDateRange}
                        onChange={(e) => setExportDateRange(e.target.value)}
                        className="btn" 
                        style={{ 
                          width: '100%', 
                          textAlign: 'left', 
                          padding: '12px 16px', 
                          background: 'white', 
                          border: '1px solid rgba(0,0,0,0.1)', 
                          borderRadius: '12px', 
                          fontSize: '14px', 
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236B6B66' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 16px center'
                        }}
                      >
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>All time</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Collection filter</label>
                      <select 
                        value={exportCollection}
                        onChange={(e) => setExportCollection(e.target.value)}
                        className="btn" 
                        style={{ 
                          width: '100%', 
                          textAlign: 'left', 
                          padding: '12px 16px', 
                          background: 'white', 
                          border: '1px solid rgba(0,0,0,0.1)', 
                          borderRadius: '12px', 
                          fontSize: '14px', 
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236B6B66' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 16px center'
                        }}
                      >
                        <option>All collections</option>
                        <option>Contact Forms</option>
                        <option>Feedback Survey</option>
                        <option>Demo Requests</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                      <label onClick={() => setIncludeAdminNotes(!includeAdminNotes)} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: includeAdminNotes ? 'var(--text-primary)' : 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.15s ease' }}>
                          {includeAdminNotes && <Check size={12} weight="bold" />}
                        </div>
                        Include admin notes
                      </label>
                      <label onClick={() => setIncludeMetadata(!includeMetadata)} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: includeMetadata ? 'var(--text-primary)' : 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.15s ease' }}>
                          {includeMetadata && <Check size={12} weight="bold" />}
                        </div>
                        Include metadata
                      </label>
                    </div>

                    {exportToast && (
                      <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--surface2)', border: '1px solid var(--green)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}></div>
                        Successfully exported {exportFormat} package to Secure Downloader.
                      </div>
                    )}

                    <button 
                      onClick={executeExport}
                      disabled={isExporting}
                      className="btn primary" 
                      style={{ 
                        width: '100%', 
                        padding: '16px', 
                        borderRadius: '14px', 
                        fontWeight: '800', 
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isExporting ? 0.7 : 1,
                        cursor: isExporting ? 'wait' : 'pointer'
                      }}
                    >
                      <DownloadSimple size={20} weight="bold" />
                      {isExporting ? `Compiling ${exportFormat} bundle...` : `Execute Data Export (${exportFormat})`}
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Clock size={20} />
                    <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Export History</h2>
                  </div>
                  <div>
                    {exportHistState.map((ex, i) => (
                      <div key={i} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: i < exportHistState.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <DownloadSimple size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>{ex.fmt} · {ex.col}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{ex.records} records</div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)' }}>{ex.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentAccount && view === 'prioritize' && (
            <div id="view-prioritize" className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>Prioritize Feedback & Notes</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Triage incoming data, append persistent admin annotations, and update urgency weights.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Left side list */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Item ({filteredSubmissions.length})
                  </div>
                  <div style={{ maxHeight: '540px', overflowY: 'auto' }}>
                    {filteredSubmissions.map(s => {
                      const isSel = s.id === currentSubId;
                      return (
                        <div 
                          key={s.id} 
                          onClick={() => { setCurrentSubId(s.id); setTempNote(s.note || ''); }}
                          style={{ 
                            padding: '16px 20px', 
                            borderBottom: '1px solid var(--border)', 
                            background: isSel ? 'var(--surface2)' : 'white', 
                            borderLeft: isSel ? '3px solid var(--text-primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{s.name}</div>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', background: s.priority === 'high' ? 'var(--red-bg)' : s.priority === 'medium' ? 'var(--amber-bg)' : 'var(--surface2)', color: s.priority === 'high' ? 'var(--red)' : s.priority === 'medium' ? 'var(--amber)' : 'var(--text-tertiary)' }}>
                              {s.priority}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.form}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right side active annotation canvas */}
                <div className="card" style={{ padding: '32px' }}>
                  {currentSub ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Submitter</div>
                          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '2px' }}>{currentSub.name}</h2>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{currentSub.email} · <span style={{ color: 'var(--text-tertiary)' }}>{currentSub.time}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className="tag" style={{ background: 'var(--surface2)' }}>{currentSub.form}</span>
                          <StatusBadge status={currentSub.status} />
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>Message Submission</div>
                        <div style={{ padding: '20px', borderRadius: '14px', background: 'var(--surface2)', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                          {currentSub.content}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>Urgency Weight</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {(['high', 'medium', 'low'] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => {
                                setSubmissions(prev => prev.map(item => item.id === currentSub.id ? { ...item, priority: p } : item));
                                const actText = `Priority updated to <strong>${p.toUpperCase()}</strong> for ${currentSub.name}`;
                                setActivity(prev => [{ color: p === 'high' ? 'var(--red)' : p === 'medium' ? 'var(--amber)' : 'var(--text-tertiary)', text: actText, time: 'Just now' }, ...prev]);
                              }}
                              className="btn"
                              style={{ 
                                flex: 1, 
                                padding: '10px', 
                                borderRadius: '10px', 
                                fontSize: '13px', 
                                fontWeight: '700',
                                textTransform: 'capitalize',
                                border: currentSub.priority === p ? '2px solid var(--text-primary)' : '1px solid var(--border)',
                                background: currentSub.priority === p ? 'var(--surface2)' : 'white',
                                color: currentSub.priority === p ? 'var(--text-primary)' : 'var(--text-secondary)'
                              }}
                            >
                              {p} Priority
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>Admin Annotation Notes</div>
                        <textarea
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Type persistent editorial feedback or escalation routing instructions..."
                          className="btn"
                          style={{ 
                            width: '100%', 
                            height: '140px', 
                            textAlign: 'left', 
                            padding: '16px', 
                            background: 'white', 
                            border: '1px solid var(--border)', 
                            borderRadius: '12px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                          onClick={() => {
                            setSubmissions(prev => prev.map(item => item.id === currentSub.id ? { ...item, note: tempNote, status: 'reviewed' } : item));
                            if (tempNote) {
                              setActivity(prev => [{ color: 'var(--sage)', text: `Note appended to <strong>${currentSub.name}</strong> record`, time: 'Just now' }, ...prev]);
                            }
                            // Cycle to next
                            const nextIdx = filteredSubmissions.findIndex(s => s.id === currentSub.id) + 1;
                            if (nextIdx < filteredSubmissions.length) {
                              setCurrentSubId(filteredSubmissions[nextIdx].id);
                              setTempNote(filteredSubmissions[nextIdx].note || '');
                            }
                          }}
                          className="btn primary" 
                          style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '800' }}
                        >
                          Save Annotation & Next →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: '600' }}>
                      Select a submission record from the triage queue to configure custom priority weights and internal notes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Detail Modal --- */}
      <div className={`modal-overlay ${isModalOpen === 'detail' ? 'open' : ''}`} onClick={() => setIsModalOpen(null)}>
        <div className="modal" style={{ width: '800px' }} onClick={e => e.stopPropagation()}>
           <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <button className="icon-btn" onClick={() => setIsModalOpen(null)}><ArrowLeft size={18} /></button>
                 <span style={{ fontWeight: '700', fontSize: '14px' }}>{currentIndex + 1} of {filteredSubmissions.length}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" onClick={() => navigateToSub('prev')} disabled={currentIndex === 0}><CaretLeft size={16} /></button>
                <button className="btn" onClick={() => navigateToSub('next')} disabled={currentIndex === filteredSubmissions.length - 1}><CaretRight size={16} /></button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
                <button className="icon-btn" onClick={() => setIsModalOpen(null)}><X size={18} /></button>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '500px' }}>
              <div style={{ padding: '40px', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
                 <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Submitter</div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{currentSub?.name}</h3>
                    <div style={{ color: 'var(--blue)', fontWeight: '600' }}>{currentSub?.email}</div>
                 </div>

                 <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Message Body</div>
                    <div style={{ background: 'var(--surface2)', padding: '24px', borderRadius: '16px', fontSize: '15px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                      {currentSub?.content}
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                       <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Collection</div>
                       <span className="tag" style={{ fontSize: '13px' }}>{currentSub?.form}</span>
                    </div>
                    <div>
                       <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Submitted</div>
                       <div style={{ fontWeight: '600' }}>{currentSub?.time}</div>
                    </div>
                 </div>

                 <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={14} /> Persistent Object Coordinates
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-tertiary)', display: 'block', marginBottom: '2px' }}>WALRUS BLOB ID</span>
                        <code style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-primary)', wordBreak: 'break-all', display: 'block', background: 'var(--surface2)', padding: '6px 8px', borderRadius: '6px' }}>
                          {(currentSub as any)?.blobId}
                        </code>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-tertiary)', display: 'block', marginBottom: '2px' }}>SUI OBJECT BINDING</span>
                        <code style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-primary)', wordBreak: 'break-all', display: 'block', background: 'var(--surface2)', padding: '6px 8px', borderRadius: '6px' }}>
                          {(currentSub as any)?.suiObjectId}
                        </code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Seal Encryption</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: (currentSub as any)?.encryptedWithSeal ? 'var(--green)' : 'var(--text-tertiary)' }}>
                          {(currentSub as any)?.encryptedWithSeal ? 'Active (Threshold Keyed)' : 'Unencrypted Cleartext'}
                        </span>
                      </div>
                    </div>
                 </div>
              </div>

              <div style={{ padding: '40px', background: 'var(--surface2)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                 <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Status & Priority</div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                       <StatusBadge status={currentSub?.status || 'new'} />
                       <PriorityTag priority={currentSub?.priority || 'medium'} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                       <button className="btn" style={{ flex: 1, padding: '8px' }}>High</button>
                       <button className="btn active" style={{ flex: 1, padding: '8px' }}>Med</button>
                       <button className="btn" style={{ flex: 1, padding: '8px' }}>Low</button>
                    </div>
                 </div>

                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Admin Annotation</div>
                    <textarea 
                      className="btn" 
                      style={{ width: '100%', height: '160px', textAlign: 'left', padding: '16px', background: 'white', border: '1px solid var(--border)' }} 
                      placeholder="Add internal notes..."
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                    />
                 </div>

                 <button className="btn primary" onClick={saveNote} style={{ padding: '14px', borderRadius: '12px' }}>Save and Close</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <div onClick={onClick} className={`sidebar-btn ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp, icon }: any) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          {icon}
        </div>
        {trend && (
          <div className="trend-pulse" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: trendUp ? 'var(--green)' : 'var(--text-tertiary)' }}>
            {trend} {trendUp && <ArrowUp size={10} />}
          </div>
        )}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function CollectionCard({ title, count, icon, color }: any) {
  return (
    <div className="card" style={{ 
      padding: '32px', 
      borderRadius: '20px', 
      background: 'white', 
      border: '1px solid rgba(0,0,0,0.06)', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div 
        style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '10px', 
          background: `var(--${color}-bg)`, 
          color: `var(--${color})`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        {icon}
      </div>
      
      <div 
        style={{ 
          fontSize: '12px', 
          fontWeight: '500', 
          textTransform: 'uppercase', 
          color: 'var(--text-tertiary)', 
          letterSpacing: '0.05em',
          marginBottom: '10px' 
        }}
      >
        {title}
      </div>
      
      <div 
        style={{ 
          fontSize: '48px', 
          fontWeight: '700', 
          color: 'var(--text-primary)', 
          lineHeight: '1',
          marginBottom: '28px',
          letterSpacing: '-0.04em'
        }}
      >
        {count}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', opacity: 0.85 }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--${color})` }}></div>
        <span>Active · SUI Mainnet</span>
      </div>
    </div>
  );
}

function FormatSelectionBtn({ icon, title, sub, onClick, active }: any) {
  return (
    <button 
      onClick={onClick} 
      className="btn" 
      style={{ 
        padding: '24px 16px', 
        height: 'auto', 
        flexDirection: 'column', 
        gap: '6px', 
        borderRadius: '16px', 
        border: '1px solid',
        borderColor: active ? 'var(--text-primary)' : 'var(--border)',
        boxShadow: active ? '0 0 0 1px var(--text-primary)' : 'none',
        background: active ? 'var(--surface2)' : 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        outline: 'none',
        position: 'relative'
      }}
      onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface2)'; }}
      onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'white'; }}
    >
      <div style={{ color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', marginBottom: '4px' }}>
        {icon}
      </div>
      <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '600', letterSpacing: '0.01em' }}>{sub}</div>
    </button>
  );
}
