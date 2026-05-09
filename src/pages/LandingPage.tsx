import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, Reorder } from 'framer-motion';
import { Button, cn, ProtocolAttribution } from '@/components/ui';
import {
  ArrowRight,
  Lock,
  Globe,
  Fingerprint,
  HardDrive,
  Shapes,
  Plus,
  Trash,
  DotsSixVertical,
  CaretDown,
  TextAlignLeft,
  CheckSquare,
  ListBullets,
} from '@phosphor-icons/react';

// ─── Constants & Data ───

const BENTO_FEATURES = [
  {
    title: 'Walrus Permanent Storage',
    description: 'Forms are stored as immutable artifacts on the Walrus decentralized network. No servers, no deletions, no limits.',
    icon: HardDrive,
    className: 'lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Seal Cryptography',
    description: 'End-to-end encryption via Seal SDK. Your data is protected by threshold cryptography.',
    icon: Lock,
  },
  {
    title: 'Sui-Native Identity',
    description: 'Your wallet is your admin key. Permissionless ownership of every form you architect.',
    icon: Fingerprint,
  },
  {
    title: 'Zero-Infra Deployment',
    description: 'Deploy globally in one click. Direct protocol-level storage with verifiable integrity.',
    icon: Globe,
    className: 'lg:col-span-2',
  },
];

// ─── Interactive Hero Components ───

type HeroField = {
  id: string;
  type: 'multiple' | 'open' | 'dropdown';
  question: string;
  placeholder?: string;
  answer?: string;
  choices?: { id: string; text: string; checked: boolean }[];
};

function HeroInteractiveForms() {
  const [fields, setFields] = useState<HeroField[]>([
    {
      id: 'f1',
      type: 'multiple',
      question: 'How did you find out about FormSeal?',
      choices: [
        { id: 'c1', text: 'Twitter', checked: false },
        { id: 'c2', text: 'Instagram', checked: true },
        { id: 'c3', text: 'Telegram', checked: false },
      ],
    },
    {
      id: 'f2',
      type: 'open',
      question: 'What is your occupation?',
      placeholder: 'Developer',
      answer: '',
    },
  ]);

  const addTemplates = () => {
    const f1: HeroField = {
      id: 'template_multiple',
      type: 'multiple',
      question: 'How did you find out about FormSeal?',
      choices: [
        { id: 'tc1', text: 'Twitter', checked: false },
        { id: 'tc2', text: 'Instagram', checked: true },
        { id: 'tc3', text: 'Telegram', checked: false },
      ],
    };
    const f2: HeroField = {
      id: 'template_open',
      type: 'open',
      question: 'What is your occupation?',
      placeholder: 'Developer',
      answer: '',
    };
    setFields([f1, f2]);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateQuestion = (id: string, text: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, question: text } : f));
  };

  const updatePlaceholder = (id: string, text: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, placeholder: text } : f));
  };

  const updateAnswer = (id: string, text: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, answer: text } : f));
  };

  const updateChoiceText = (fieldId: string, choiceId: string, text: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.choices) {
        return {
          ...f,
          choices: f.choices.map(c => c.id === choiceId ? { ...c, text } : c)
        };
      }
      return f;
    }));
  };

  const toggleChoice = (fieldId: string, choiceId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.choices) {
        return {
          ...f,
          choices: f.choices.map(c => c.id === choiceId ? { ...c, checked: !c.checked } : c)
        };
      }
      return f;
    }));
  };

  const deleteChoice = (fieldId: string, choiceId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.choices) {
        return {
          ...f,
          choices: f.choices.filter(c => c.id !== choiceId)
        };
      }
      return f;
    }));
  };

  const reorderChoices = (fieldId: string, newChoices: any[]) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, choices: newChoices } : f));
  };

  return (
    <div className="relative w-full max-w-[540px] mx-auto lg:ml-auto min-h-[600px]">
      <div className="relative">
        <AnimatePresence mode="popLayout">
          {fields.map((field, idx) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                zIndex: fields.length - idx,
                marginTop: idx === 0 ? 0 : -50,
                marginLeft: idx % 2 === 0 ? 0 : 30,
                marginRight: idx % 2 === 0 ? 30 : 0,
              }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className={cn(
                "bg-white rounded-3xl border border-black/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]",
                (field.type === 'multiple' || field.type === 'dropdown') ? "p-6" : "p-6 md:p-8"
              )}>
                <div className={cn(
                  "flex items-center justify-between",
                  (field.type === 'multiple' || field.type === 'dropdown') ? "mb-6" : "mb-8"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center">
                      {field.type === 'multiple' ? (
                        <CheckSquare weight="bold" className="w-5 h-5 text-black/40" />
                      ) : field.type === 'dropdown' ? (
                        <ListBullets weight="bold" className="w-5 h-5 text-black/40" />
                      ) : (
                        <TextAlignLeft weight="bold" className="w-5 h-5 text-black/40" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/[0.05] bg-black/[0.01]">
                      <span className="text-[0.75rem] font-bold text-black/60">
                        {field.type === 'multiple' ? 'Multiple choice' : field.type === 'dropdown' ? 'Dropdown' : 'Open question'}
                      </span>
                      <CaretDown weight="bold" className="w-3 h-3 text-black/20" />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black/10 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                  >
                    <Trash weight="bold" className="w-4 h-4" />
                  </button>
                </div>

                <div className={cn(
                  "space-y-6",
                  (field.type === 'multiple' || field.type === 'dropdown') && "space-y-4"
                )}>
                  <input
                    value={field.question}
                    onChange={(e) => updateQuestion(field.id, e.target.value)}
                    className="text-[1.125rem] font-semibold text-black tracking-tight w-full bg-transparent border-none focus:outline-none placeholder:text-black/10"
                    placeholder="Enter question..."
                  />
                  
                  {field.type === 'multiple' && field.choices && (
                    <div className="space-y-2">
                      <Reorder.Group
                        axis="y"
                        values={field.choices}
                        onReorder={(newChoices) => reorderChoices(field.id, newChoices)}
                        className="space-y-2"
                      >
                        {field.choices.map((choice) => (
                          <Reorder.Item
                            key={choice.id}
                            value={choice}
                            className="flex items-center gap-3 group"
                          >
                            <div className="cursor-grab active:cursor-grabbing text-black/10 group-hover:text-black/30 transition-colors">
                              <DotsSixVertical weight="bold" className="w-4 h-4" />
                            </div>
                            <div className={cn(
                              "flex-1 flex items-center gap-3 p-3.5 rounded-2xl border transition-all",
                              choice.checked ? "bg-black/[0.03] border-black/10 shadow-sm" : "bg-black/[0.01] border-black/[0.04] group-hover:border-black/10"
                            )}>
                              <button
                                onClick={() => toggleChoice(field.id, choice.id)}
                                className={cn(
                                  "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                  choice.checked ? "bg-black border-black" : "border-black/10 hover:border-black/30"
                                )}
                              >
                                {choice.checked && (
                                  <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="w-3 h-3 text-white stroke-[4]"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </motion.svg>
                                )}
                              </button>
                              <input
                                value={choice.text}
                                onChange={(e) => updateChoiceText(field.id, choice.id, e.target.value)}
                                className="bg-transparent border-none focus:outline-none text-[0.875rem] font-bold text-black/60 w-full"
                              />
                              <button
                                onClick={() => deleteChoice(field.id, choice.id)}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-black/0 group-hover:text-black/20 hover:text-red-400 transition-all"
                              >
                                <Trash weight="bold" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>

                      <button
                        onClick={() => {
                          const newChoice = { id: Math.random().toString(36).substr(2, 9), text: 'New Option', checked: false };
                          reorderChoices(field.id, [...field.choices!, newChoice]);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-[0.75rem] font-bold text-black/30 hover:text-black transition-colors pt-2"
                      >
                        <Plus weight="bold" className="w-3.5 h-3.5" />
                        Add choice
                      </button>
                    </div>
                  )}

                  {field.type === 'dropdown' && field.choices && (
                    <div className="space-y-4">
                      <HeroDropdownPreview 
                        choices={field.choices}
                        onToggle={(choiceId) => toggleChoice(field.id, choiceId)}
                        onUpdateText={(choiceId, text) => updateChoiceText(field.id, choiceId, text)}
                        onDelete={(choiceId) => deleteChoice(field.id, choiceId)}
                        onAdd={() => {
                          const newChoice = { id: Math.random().toString(36).substr(2, 9), text: 'New Option', checked: false };
                          reorderChoices(field.id, [...field.choices!, newChoice]);
                        }}
                      />
                    </div>
                  )}

                  {field.type === 'open' && (
                    <div className="p-4 rounded-2xl bg-black/[0.01] border border-black/[0.04] focus-within:border-black/10 transition-all">
                      <input
                        value={field.answer || ''}
                        onChange={(e) => updateAnswer(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Type here...'}
                        className="bg-transparent border-none focus:outline-none text-[0.875rem] font-medium text-black/60 w-full placeholder:text-black/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {fields.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-black/5 rounded-[2.5rem] bg-black/[0.01]"
          >
            <div className="w-16 h-16 rounded-3xl bg-white border border-black/5 flex items-center justify-center mb-8 shadow-sm">
              <Shapes weight="bold" className="w-8 h-8 text-black/10" />
            </div>
            
            <div className="text-center mb-10">
              <h3 className="text-[1.125rem] font-black text-black/40 tracking-tight">Workspace Empty</h3>
              <p className="text-[0.75rem] font-bold text-black/20 mt-1">Add a field to begin interacting.</p>
            </div>

            <button 
              onClick={addTemplates}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-black/5 shadow-sm text-[0.9375rem] font-semibold text-black/60 hover:text-black hover:scale-105 hover:shadow-xl hover:border-black/10 active:scale-95 transition-all duration-300"
            >
              <Plus weight="bold" className="w-4 h-4 text-black/20 group-hover:text-black transition-colors" />
              Add Item
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function HeroDropdownPreview({ 
  choices, 
  onToggle, 
  onUpdateText, 
  onDelete, 
  onAdd 
}: { 
  choices: { id: string; text: string; checked: boolean }[];
  onToggle: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const selectedChoice = choices.find(c => c.checked);

  return (
    <div className="space-y-4">
      {/* Dropdown Options (The menu) */}
      <div className="bg-white border border-black/[0.08] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="py-2">
          {choices.map((choice) => (
            <div
              key={choice.id}
              className={`
                w-full px-5 py-3 flex items-center justify-between group transition-colors
                ${choice.checked ? 'bg-black/[0.02]' : 'hover:bg-black/[0.01]'}
              `}
            >
              <input
                value={choice.text}
                onChange={(e) => onUpdateText(choice.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "bg-transparent border-none focus:outline-none text-[0.9375rem] font-medium transition-all w-full",
                  choice.checked ? "text-black" : "text-black/40"
                )}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggle(choice.id)}
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    choice.checked ? "bg-black border-black" : "border-black/10 hover:border-black/30"
                  )}
                >
                  {choice.checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
                <button
                  onClick={() => onDelete(choice.id)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-black/0 group-hover:text-black/10 hover:!text-red-400 transition-all"
                >
                  <Trash weight="bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={onAdd}
            className="w-full px-5 py-3 flex items-center gap-2 text-[0.75rem] font-bold text-black/20 hover:text-black transition-colors"
          >
            <Plus weight="bold" className="w-3 h-3" />
            Add option
          </button>
        </div>
      </div>

      {/* The Selector (The trigger) */}
      <div 
        className="w-full px-5 h-[54px] bg-black/[0.01] border border-black/5 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <ListBullets weight="bold" className="w-4 h-4 text-black/20" />
          <span className="text-[0.9375rem] font-medium text-black/20">
            {selectedChoice?.text || 'Select an option...'}
          </span>
        </div>
        <CaretDown weight="bold" className="w-4 h-4 text-black/20" />
      </div>
    </div>
  );
}

// ─── Layout Components ───

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.05] text-[0.625rem] font-black uppercase tracking-[0.3em] text-text-muted mb-8"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
      {children}
    </motion.span>
  );
}

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Background - Pure Black/White Style */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#f0eeeb]">
        <div className="noise" />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center pt-32 pb-20 px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-20 lg:gap-32 items-center"
        >
          {/* Left: Copy */}
          <div className="relative z-10">
            <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black leading-[1.05] tracking-[-0.03em] text-black mb-10">
              Decentralized Forms<br />
              <span className="text-black/30 italic">
                on Walrus.
              </span>
            </h1>

            <p className="text-[1.125rem] md:text-[1.25rem] text-text-secondary leading-relaxed max-w-[40ch] mb-10 font-medium tracking-tight">
              FormSeal eliminates the middleman. Submissions are stored as immutable blobs on Walrus, protected by Seal threshold cryptography.
            </p>

            <div className="flex flex-col items-center lg:items-start gap-12">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/builder" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      className="h-12 px-10 rounded-full text-[0.875rem] font-bold transition-all !bg-black !text-white hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
                    >
                      Create Form
                    </Button>
                  </Link>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      className="h-12 px-10 rounded-full text-[0.875rem] font-bold border border-black/[0.08] hover:bg-white hover:border-black/20 transition-all duration-300"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </div>

                <ProtocolAttribution compact />
              </div>
            </div>
          </div>

          {/* Right: Interactive Forms */}
          <div className="relative">
            <HeroInteractiveForms />
          </div>
        </motion.div>

      </section>



      {/* ─── Bento Features ─── */}
      <section className="px-6 md:px-12 lg:px-20 py-40 bg-transparent relative border-t border-black/[0.03]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-24 text-center">
            <SectionLabel>Protocol Primitives</SectionLabel>
            <h2 className="text-[clamp(2rem,5vw,3rem)] font-black text-black tracking-tight leading-[1.1]">
              Sovereignty as a Service.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENTO_FEATURES.map((f, i) => {
              const Icon = f.icon;

              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className={cn(
                    "doppelrand group hover:scale-[1.02] transition-all duration-700",
                    f.className
                  )}
                >
                  <div className="doppelrand-inner bg-white p-10 flex flex-col h-full min-h-[300px]">
                    <div className="w-14 h-14 rounded-2xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center mb-10 group-hover:bg-black group-hover:border-black/20 transition-all duration-500">
                      <Icon weight="bold" className="w-7 h-7 text-black/40 group-hover:text-white transition-colors" />
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-[1.25rem] font-black text-black mb-4 tracking-tight">
                        {f.title}
                      </h3>
                      <p className="text-text-secondary text-[1rem] leading-relaxed max-w-[32ch]">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="px-6 md:px-12 lg:px-20 py-60 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black/[0.01] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <SectionLabel>Genesis Phase</SectionLabel>
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black tracking-[-0.04em] leading-[0.95] text-black mb-12">
            Build for the<br />Permanent Web.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/builder" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="h-16 px-12 py-8 rounded-2xl text-[0.9375rem] shadow-2xl shadow-black/10 hover:scale-105 active:scale-95 transition-all !bg-black !text-white"
              >
                Create First Form
              </Button>
            </Link>
            <a href="https://walrus.site" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="h-16 px-12 py-8 rounded-2xl text-[0.9375rem] border border-black/[0.08] hover:bg-white hover:border-black/20 transition-all"
              >
                Protocol Docs
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="px-6 md:px-12 lg:px-20 py-16 border-t border-black/[0.03]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-black/[0.03] border border-black/[0.05] flex items-center justify-center">
              <Shapes weight="fill" className="w-5 h-5 text-black/40" />
            </div>
            <span className="text-lg font-black tracking-tighter text-black uppercase italic">FormSeal</span>
          </div>
          <div className="flex items-center gap-10 text-[0.75rem] font-black uppercase tracking-[0.2em] text-text-muted">
            <a href="#" className="hover:text-black transition-colors">X / Twitter</a>
            <a href="#" className="hover:text-black transition-colors">GitHub</a>
            <a href="#" className="hover:text-black transition-colors">Explorer</a>
          </div>
          <p className="text-[0.625rem] font-mono text-text-muted/40 uppercase tracking-widest">
            Stored on Walrus Network — Zero Centralized Dependencies
          </p>
        </div>
      </footer>
    </div>
  );
}
