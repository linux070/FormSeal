import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBuilderStore } from '@/stores/builderStore';

const TEMPLATES = [
  {
    id: 'bug_report',
    name: 'Bug Report Form',
    description: 'For collecting details about in-game issues.',
    fields: [
      { type: 'short_text', labelPlaceholder: 'Issue Title', required: true },
      { type: 'long_text', labelPlaceholder: 'Reproduction Steps', required: true },
      { type: 'file_upload', labelPlaceholder: 'Visual Evidence', required: false },
    ]
  },
  {
    id: 'player_feedback',
    name: 'Player Feedback Form',
    description: 'To gather suggestions or reviews from players.',
    fields: [
      { type: 'star_rating', labelPlaceholder: 'Overall Experience', required: true },
      { type: 'long_text', labelPlaceholder: 'What can we improve?', required: true },
      { type: 'checkbox_group', labelPlaceholder: 'Features used', required: false },
    ]
  },
  {
    id: 'event_registration',
    name: 'Event Registration Form',
    description: 'For signing up participants for tournaments or in-game events.',
    fields: [
      { type: 'short_text', labelPlaceholder: 'Participant Name', required: true },
      { type: 'short_text', labelPlaceholder: 'Discord Tag / ID', required: true },
      { type: 'dropdown', labelPlaceholder: 'Tournament Tier', required: true },
    ]
  },
  {
    id: 'feature_request',
    name: 'Feature Request Form',
    description: 'Crowdsource product improvements and architectural suggestions.',
    fields: [
      { type: 'short_text', labelPlaceholder: 'Feature Name', required: true },
      { type: 'long_text', labelPlaceholder: 'Benefit to the Protocol', required: true },
    ]
  },
  {
    id: 'community_feedback',
    name: 'Community Feedback Form',
    description: 'Broad engagement surveys for protocol-level decision making.',
    fields: [
      { type: 'star_rating', labelPlaceholder: 'Protocol Satisfaction', required: true },
      { type: 'long_text', labelPlaceholder: 'Additional Comments', required: false },
    ]
  }
];

function TemplateSVGDesign({ type }: { type: string }) {
  const baseColor = "currentColor";
  
  switch (type) {
    case 'bug_report':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-black/10 transition-all duration-500 group-hover:text-black">
          <rect x="20" y="20" width="80" height="80" rx="4" stroke={baseColor} strokeWidth="2" />
          <path d="M40 45H80M40 60H70M40 75H75" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="90" cy="30" r="15" fill="white" stroke={baseColor} strokeWidth="2" />
          <path d="M85 30L88 33L95 26" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'player_feedback':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-black/10 transition-all duration-500 group-hover:text-black">
          <circle cx="60" cy="60" r="45" stroke={baseColor} strokeWidth="2" />
          <path d="M40 70C40 70 50 85 60 85C70 85 80 70 80 70" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="50" r="4" fill={baseColor} />
          <circle cx="75" cy="50" r="4" fill={baseColor} />
        </svg>
      );
    case 'event_registration':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-black/10 transition-all duration-500 group-hover:text-black">
          <rect x="30" y="20" width="60" height="80" rx="2" stroke={baseColor} strokeWidth="2" />
          <rect x="30" y="20" width="60" height="20" rx="2" fill="white" stroke={baseColor} strokeWidth="2" />
          <circle cx="45" cy="55" r="5" stroke={baseColor} strokeWidth="2" />
          <path d="M60 55H80" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="45" cy="75" r="5" stroke={baseColor} strokeWidth="2" />
          <path d="M60 75H80" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'feature_request':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-black/10 transition-all duration-500 group-hover:text-black">
          <path d="M60 20C40 20 25 35 25 55C25 65 30 75 40 80V95H80V80C90 75 95 65 95 55C95 35 80 20 60 20Z" stroke={baseColor} strokeWidth="2" />
          <path d="M50 105H70" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M60 35V50M50 42.5H70" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'community_feedback':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-black/10 transition-all duration-500 group-hover:text-black">
          <circle cx="45" cy="45" r="15" stroke={baseColor} strokeWidth="2" />
          <circle cx="75" cy="45" r="15" stroke={baseColor} strokeWidth="2" />
          <path d="M25 85C25 75 35 68 45 68C55 68 65 75 65 85" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M55 85C55 75 65 68 75 68C85 68 95 75 95 85" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function MiniFormPreview({ type }: { type: string }) {
  return (
    <div className="absolute inset-0 bg-[#f8f9fa] border-t border-l border-black/[0.03] rounded-none overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
      {/* Mac Window Controls */}
      <div className="h-7 bg-white border-b border-black/[0.03] flex items-center px-4 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
      </div>
      
      {/* Illustration Canvas */}
      <div className="relative w-full h-full flex items-center justify-center pb-8">
        <TemplateSVGDesign type={type} />
      </div>
    </div>
  );
}

export function TemplatesPage() {
  const navigate = useNavigate();
  const store = useBuilderStore();

  const handleSelectTemplate = (template: typeof TEMPLATES[0] | null) => {
    store.resetBuilder();
    if (template) {
      store.setTitle(template.name);
      store.setDescription(template.description);
      template.fields.forEach((f: any) => {
        store.addField(f.type);
      });
      setTimeout(() => {
        const fields = useBuilderStore.getState().form.fields;
        template.fields.forEach((tf: any, i: number) => {
          const field = fields[i];
          if (field) {
            store.updateField(field.id, { 
              label: "", 
              labelPlaceholder: tf.labelPlaceholder,
              required: tf.required 
            });
          }
        });
      }, 0);
    }
    navigate('/builder');
  };

  return (
    <div className="flex-1 px-6 md:px-12 pt-36 pb-20 bg-[#fcfaf7] min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h1 className="text-[1.25rem] font-bold text-black/80">
            Start new from
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Blank Form Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => handleSelectTemplate(null)}
            className="group relative flex flex-col bg-white rounded-3xl border border-black/[0.04] shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500 overflow-hidden cursor-pointer h-[360px] items-center justify-center text-center p-12"
          >
            <div className="flex flex-col items-center justify-center gap-8 z-10">
               <div className="flex flex-col gap-1.5">
                  <h3 className="text-[1.25rem] font-bold text-black">Blank form</h3>
                  <p className="text-[0.8125rem] font-medium text-black/50">Create new form from scratch</p>
               </div>
               
               <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-2xl shadow-black/20 group-hover:bg-zinc-800 transition-all duration-500 group-hover:scale-105 border border-transparent">
                  <div className="relative w-6 h-6">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white rounded-full -translate-y-1/2" />
                    <div className="absolute top-0 left-1/2 w-[2px] h-full bg-white rounded-full -translate-x-1/2" />
                  </div>
               </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.01] pointer-events-none" />
          </motion.div>

          {/* Template Cards */}
          {TEMPLATES.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => handleSelectTemplate(template)}
              className="group relative flex flex-col bg-white rounded-3xl border border-black/[0.04] shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500 overflow-hidden cursor-pointer h-[360px]"
            >
              <div className="p-7 pb-4 h-[120px]">
                <h3 className="text-[1rem] font-bold text-black mb-1.5">
                  {template.name}
                </h3>
                <p className="text-[0.75rem] font-medium text-black/50 leading-relaxed line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Offset Preview Container - Glued Right, Space Left, All Square Edges */}
              <div className="flex-1 relative mt-2 ml-8 mr-0 mb-0">
                {/* Ghost Stack Effect - Square Boxed */}
                <div className="absolute -left-4 top-4 bottom-0 w-full bg-black/[0.01] border-t border-l border-black/[0.02] rounded-none" />
                
                <div className="h-full w-full relative z-10">
                  <MiniFormPreview type={template.id} />
                </div>
                
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f8f9fa] to-transparent pointer-events-none z-20" />
                
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f1f3f5] text-black text-[0.75rem] font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-lg z-30 border border-black/[0.05]">
                  Use Template
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
}
