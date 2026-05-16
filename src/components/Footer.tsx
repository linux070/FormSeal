export function Footer() {
  return (
    <footer className="px-6 md:px-12 lg:px-20 py-16 border-t border-black/[0.03] bg-transparent">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left: Branding & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <img 
                src="/formseal kit/formseal_logo.svg" 
                alt="FormSeal" 
                className="w-5 h-5 opacity-80" 
              />
              <span className="text-[1rem] font-bold text-black tracking-tight">FormSeal</span>
            </div>
            <p className="text-[0.8125rem] font-medium text-black/40 tracking-tight">
              © 2026 FormSeal. All rights reserved.
            </p>
          </div>

          {/* Middle: Links Grid */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[0.875rem] font-medium text-black/50">
            <a 
              href="https://x.com/linux_mode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Twitter
            </a>
            <a 
              href="https://github.com/linux070/FormSeal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://walrus.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Walrus Site
            </a>
            <a 
              href="https://suiscan.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Explorer
            </a>
          </div>

          {/* Right: Technical Attribution */}
          <div className="text-center md:text-right">
            <p className="text-[0.75rem] font-medium text-black/40 leading-relaxed max-w-[200px] md:ml-auto">
              Stored on Walrus Network — Zero Centralized Dependencies
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
