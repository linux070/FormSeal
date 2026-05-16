import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button, cn, ProtocolAttribution } from '@/components/ui';
import {
  Check,
  CheckSquare,
  ListBullets,
  Star,
  Plus,
  DotsSixVertical,
  TextAlignLeft,
  CaretDown,
  CursorClick,
  Cube,
  LockKey,
} from '@phosphor-icons/react';
import { Footer } from '@/components/Footer';

// ─── Constants & Data ───

const SITE_STEPS = [
  {
    title: 'Drag & drop form builder',
    description: "The easiest way to create a custom form. Simply drag and drop a form field from the menu, and that's it.",
    icon: CursorClick,
  },
  {
    title: 'Store it forever',
    description: "Your forms and responses are saved as permanent blobs on Walrus, ensuring they never disappear or get deleted.",
    icon: Cube,
  },
  {
    title: 'Keep it private',
    description: "Protect sensitive respondent data with Seal threshold cryptography. Only you hold the keys to decrypt submissions.",
    icon: LockKey,
  },
];

type HeroField = {
  id: string;
  type: 'multiple' | 'open' | 'dropdown' | 'rating';
  question: string;
  placeholder?: string;
  answer?: string;
  choices?: { id: string; text: string; checked: boolean }[];
  rating?: number;
};

const HERO_TEMPLATES: HeroField[] = [
  {
    id: 'template_multiple',
    type: 'multiple',
    question: 'How did you find out about FormSeal?',
    choices: [
      { id: 'tc2', text: 'Instagram', checked: false },
      { id: 'tc1', text: 'Twitter', checked: true },
      { id: 'tc3', text: 'Telegram', checked: false },
    ],
  },
  {
    id: 'template_rating',
    type: 'rating',
    question: 'Rate your experience?',
    rating: 4,
  },
];

function HeroInteractiveForms() {
  const [fields, setFields] = useState<HeroField[]>([]);

  const addTemplates = () => {
    setFields(HERO_TEMPLATES);
  };

  const reorderChoices = (fieldId: string, newChoices: any[]) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, choices: newChoices } : f));
  };

  return (
    <div className="relative w-full max-w-[520px] mx-auto lg:ml-auto min-h-[600px]">
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
                marginTop: idx === 0 ? 0 : -40,
                marginLeft: idx % 2 === 0 ? 0 : 20,
                marginRight: idx % 2 === 0 ? 20 : 0,
              }}
              exit={{ opacity: 0, scale: 0.8, x: 50 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="bg-white rounded-xl border border-black/[0.04] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04),0_2px_4px_-1px_rgba(0,0,0,0.02)] p-10 transition-all duration-500 hover:shadow-[0_24px_48px_-8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center">
                      {field.type === 'multiple' ? (
                        <CheckSquare weight="bold" className="w-5 h-5 text-black/40" />
                      ) : field.type === 'dropdown' ? (
                        <ListBullets weight="bold" className="w-5 h-5 text-black/40" />
                      ) : field.type === 'rating' ? (
                        <Star weight="bold" className="w-5 h-5 text-amber-500" />
                      ) : (
                        <TextAlignLeft weight="bold" className="w-5 h-5 text-black/40" />
                      )}
                    </div>
                    <div className="px-3 py-1.5 rounded-md border border-black/[0.05] bg-black/[0.01]">
                      <span className="text-[0.625rem] font-bold text-black/30 uppercase tracking-[0.2em]">
                        {field.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <DotsSixVertical className="w-5 h-5 mt-1 text-black/10 flex-shrink-0 cursor-grab" />
                    <h3 className="text-[1.125rem] font-medium text-black leading-tight tracking-tight">
                      {field.question}
                    </h3>
                  </div>

                  <div className="pl-9">
                    {field.type === 'multiple' && field.choices && (
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
                            className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.04] bg-[#fafafa] group cursor-default"
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-sm border flex items-center justify-center transition-all duration-300",
                              choice.checked ? "bg-black border-black text-white" : "border-black/10 bg-white"
                            )}>
                              <Check 
                                weight="bold" 
                                className={cn(
                                  "w-3.5 h-3.5 transition-opacity",
                                  choice.checked ? "opacity-100" : "opacity-[0.03] group-hover:opacity-10"
                                )} 
                              />
                            </div>
                            <span className={cn(
                              "text-[0.875rem] font-medium transition-colors",
                              choice.checked ? "text-black" : "text-black/40"
                            )}>{choice.text}</span>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}

                    {field.type === 'rating' && (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="transition-transform active:scale-90 p-1"
                          >
                            <Star
                              weight={star <= (field.rating || 0) ? "fill" : "bold"}
                              className={cn(
                                "w-7 h-7 transition-colors",
                                star <= (field.rating || 0) ? "text-amber-500" : "text-black/[0.03]"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {field.type === 'dropdown' && (
                      <div className="relative">
                        <div className="w-full px-4 h-14 rounded-xl border border-black/[0.05] bg-[#fafafa] flex items-center justify-between">
                          <span className="text-[0.875rem] font-medium text-black/30">Select an option...</span>
                          <CaretDown weight="bold" className="w-4 h-4 text-black/20" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {fields.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-[#f3f2f0] rounded-2xl border-2 border-dashed border-black/[0.05] p-12 text-center flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
          >
            {/* Soft Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-white/40 blur-3xl pointer-events-none" />
            
            {/* Logo Tile */}
            <div className="w-20 h-20 rounded-md bg-white shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.03] flex items-center justify-center mb-8 relative group transition-transform duration-500 hover:scale-110">
              <div className="absolute inset-0 bg-gradient-to-br from-black/[0.01] to-transparent rounded-md" />
              <img 
                src="/formseal kit/formseal_logo.svg" 
                alt="FormSeal" 
                className="w-10 h-10 relative z-10 opacity-20 transition-opacity group-hover:opacity-40 duration-500" 
              />
            </div>
            
            <h3 className="text-[1.25rem] font-semibold text-black/60 mb-1 tracking-tight">Workspace Empty</h3>
            <p className="text-[0.9375rem] text-black/25 font-medium mb-10">
              Add a field to begin interacting.
            </p>
            
            <Button
              variant="secondary"
              onClick={addTemplates}
              icon={<Plus weight="bold" className="w-4 h-4" />}
              className="px-10 h-14 !bg-[#e6e5e0] !border-none !text-black/40 hover:!bg-[#dfded9] hover:!text-black/60 transition-all shadow-none"
            >
              Add Item
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="flex-1 bg-[#fcfaf7] min-h-screen relative overflow-x-hidden selection:bg-black selection:text-white">
      {/* ─── Hero Section ─── */}
      <section className="px-6 md:px-12 pt-40 pb-32 relative">
        {/* Ambient Decorative Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-black/[0.02] to-transparent rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-black/[0.01] to-transparent rounded-full blur-[100px] -ml-72 -mb-72 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-12 items-center">
            {/* Left Column: Copy */}
            <div className="text-center lg:text-left relative z-10 animate-fade-in">
              <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tighter text-black leading-[0.9] mb-10">
                Forms that<br />
                live forever<br />
                <span className="text-black/20 italic font-serif pr-2">
                  on Walrus.
                </span>
              </h1>

              <p className="text-[1.125rem] md:text-[1.25rem] text-black/50 leading-relaxed max-w-[55ch] mb-10 font-medium tracking-tight">
                Design beautiful forms and collect responses with total privacy. Every submission is encrypted and stored permanently on Walrus, giving you complete ownership of your data forever.
              </p>

              <div className="flex flex-col items-center lg:items-start gap-8">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link to="/builder" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-10 h-14"
                    >
                      Create Form
                    </Button>
                  </Link>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto px-10 h-14 !bg-[#e6e5e0] !border-none !text-black/40 hover:!bg-[#dfded9] hover:!text-black/60 transition-all shadow-none"
                    >
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Workspace */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <HeroInteractiveForms />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Site Steps ─── */}
      <section className="px-6 md:px-12 py-40 border-t border-black/[0.03] bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {SITE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col gap-8 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="w-16 h-16 rounded-2xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center">
                    <Icon weight="bold" className="w-7 h-7 text-black/30" />
                  </div>
                  <div>
                    <h3 className="text-[1.75rem] font-black tracking-tight text-black mb-4 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-[1.0625rem] text-black/40 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Attribution Footer ─── */}
      <section className="px-6 md:px-12 py-32 bg-[#faf9f6]">
        <div className="max-w-[1400px] mx-auto">
          <ProtocolAttribution />
        </div>
      </section>

      <Footer />
    </div>
  );
}
