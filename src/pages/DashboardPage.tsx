import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWalletStore, useDashboardStore } from "@/stores/appStore";
import { Button } from "@/components/ui";
import { 
  Database,
  Hash,
  Clock,
  Plus,
  Eye,
  Copy,
  PencilSimple,
  DotsThreeVertical,
  TerminalWindow,
  ChartLineUp,
  IdentificationBadge,
  ShieldCheck,
  Globe
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/components/ui";

type DashboardTab = 'registry' | 'live' | 'archived';

export function DashboardPage() {
  const { address, connect, isConnecting } = useWalletStore();
  const { forms } = useDashboardStore();
  const [activeFilter, setActiveFilter] = useState<DashboardTab>('registry');

  // ─── Stats Derivation ───
  const stats = useMemo(() => {
    const totalRecords = forms.reduce((acc, f) => acc + (f.submissionCount || 0), 0);
    return [
      { label: 'Active Collections', value: forms.length, trend: 'SUI Mainnet', trendType: 'neutral', icon: Database },
      { label: 'Encrypted Records', value: totalRecords.toLocaleString(), trend: '+14% / 24h', trendType: 'positive', icon: ShieldCheck },
      { label: 'Network Integrity', value: '99.9%', trend: 'Walrus Protocol', trendType: 'positive', icon: Globe },
      { label: 'Sync Latency', value: '142ms', trend: 'Optimized', trendType: 'neutral', icon: Clock },
    ];
  }, [forms]);

  // ─── Wallet Gate ───
  if (!address) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-[480px] w-full bg-white rounded-[2.5rem] border border-black/[0.04] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-black/[0.02] border border-black/[0.04] flex items-center justify-center mx-auto mb-8">
            <IdentificationBadge weight="duotone" className="w-10 h-10 text-black/20" />
          </div>
          <h1 className="text-3xl font-black text-black mb-4 tracking-tight">Identity Required</h1>
          <p className="text-black/40 font-medium mb-10 leading-relaxed">
            Please connect your wallet to access the decentralized form management studio.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={connect}
            loading={isConnecting}
            className="w-full h-16 !bg-black !text-white !rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] pt-32 pb-20 px-6 md:px-12 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* ─── Header Section ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="mb-0">
            <h1 className="text-[1.75rem] font-bold tracking-tight text-black leading-tight">
              Dashboard
            </h1>
            <p className="text-[1rem] text-black/50 mt-2 font-medium max-w-2xl leading-relaxed">
              Manage data streams, monitor Walrus blob persistence, and verify threshold-encrypted records.
            </p>
          </div>
          <Link to="/templates">
            <Button 
              variant="primary" 
              className="!bg-black !text-white h-14 px-8 !rounded-2xl shadow-2xl shadow-black/10 flex items-center gap-3 hover:scale-[1.02] transition-transform"
            >
              <Plus weight="bold" className="w-5 h-5" />
              <span className="text-[0.875rem] font-bold uppercase tracking-wider">Initialize Collection</span>
            </Button>
          </Link>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] p-8 border border-black/[0.04] shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-black/[0.02] border border-black/[0.04] flex items-center justify-center">
                  <stat.icon weight="duotone" className="w-6 h-6 text-black" />
                </div>
                <button className="text-black/10 hover:text-black/40 transition-colors">
                  <DotsThreeVertical weight="bold" className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-1">
                <div className="text-[0.6875rem] font-black text-black/20 uppercase tracking-[0.2em]">{stat.label}</div>
                <div className="flex flex-col gap-4">
                  <div className="text-[2.5rem] font-bold text-black tracking-tighter leading-none font-mono">{stat.value}</div>
                  <div className={cn(
                    "inline-flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-widest",
                    stat.trendType === 'positive' ? "text-green-600" : "text-black/30"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", stat.trendType === 'positive' ? "bg-green-500" : "bg-black/10")} />
                    {stat.trend}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Main Content Area ─── */}
        <div className="bg-white rounded-[2.5rem] border border-black/[0.04] p-12 shadow-sm space-y-10">
          
          {/* List Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-black/[0.03] pb-10">
            <div className="flex items-center gap-4">
               <TerminalWindow weight="bold" className="w-6 h-6 text-black/20" />
               <h2 className="text-[1.5rem] font-bold text-black tracking-tight">Registry Feed</h2>
            </div>
            <div className="flex p-1.5 bg-black/[0.02] rounded-2xl border border-black/[0.04]">
              {(['registry', 'live', 'archived'] as DashboardTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={cn(
                    "px-7 py-3 rounded-xl text-[0.75rem] font-black transition-all uppercase tracking-widest whitespace-nowrap",
                    activeFilter === tab 
                      ? "bg-white text-black shadow-lg border border-black/[0.02]" 
                      : "text-black/20 hover:text-black/40"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {forms.map((form, i) => (
              <motion.div
                key={form.formBlobId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group p-10 rounded-[2.5rem] border border-black/[0.04] hover:border-black/10 hover:shadow-2xl hover:shadow-black/[0.03] transition-all duration-500 bg-white flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-black/[0.02] border border-black/[0.04] flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-500">
                    <Database weight="bold" className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-xl hover:bg-black/[0.03] text-black/20 hover:text-black transition-all">
                      <Eye weight="bold" className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 rounded-xl hover:bg-black/[0.03] text-black/20 hover:text-black transition-all">
                      <Copy weight="bold" className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 rounded-xl hover:bg-black/[0.03] text-black/20 hover:text-black transition-all">
                      <PencilSimple weight="bold" className="w-5 h-5" />
                    </button>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[0.625rem] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2",
                      !form.isPaused 
                        ? "bg-green-50 text-green-700 border border-green-100" 
                        : "bg-black/[0.03] text-black/40 border border-black/5"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", !form.isPaused ? "bg-green-500 animate-pulse" : "bg-black/20")} />
                      {!form.isPaused ? 'Live' : 'Paused'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-10">
                  <h3 className="text-[1.5rem] font-bold text-black tracking-tighter group-hover:text-black transition-colors">
                    {form.title || 'Untitled Collection'}
                  </h3>
                  <div className="flex flex-col gap-3">
                    <p className="text-[0.875rem] font-medium text-black/40 leading-relaxed">
                      {form.description || 'System-generated decentralized data stream.'}
                    </p>
                    <div className="flex items-center gap-3 text-[0.625rem] font-mono text-black/20 uppercase tracking-tight">
                       <Hash weight="bold" className="w-3.5 h-3.5" />
                       <span className="group-hover:text-black/40 transition-colors">{form.formBlobId.slice(0, 32)}...</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#fafafa] border border-black/[0.02] rounded-2xl p-6 space-y-1 group-hover:bg-white group-hover:border-black/5 transition-all">
                    <div className="text-[0.625rem] font-black text-black/20 uppercase tracking-widest">Encrypted Records</div>
                    <div className="text-[1.75rem] font-bold text-black font-mono tracking-tighter">{form.submissionCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#fafafa] border border-black/[0.02] rounded-2xl p-6 space-y-1 group-hover:bg-white group-hover:border-black/5 transition-all">
                    <div className="text-[0.625rem] font-black text-black/20 uppercase tracking-widest">Walrus Sync</div>
                    <div className="flex items-center gap-2">
                       <ChartLineUp weight="bold" className="w-4 h-4 text-green-500" />
                       <div className="text-[1.75rem] font-bold text-black font-mono tracking-tighter">100%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
