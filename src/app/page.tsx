import Downloader from "@/components/Downloader";

export default function Home() {
  return (
    <main className="min-h-screen w-full relative flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 pb-12 overflow-hidden selection:bg-primary/30">
      {/* Background Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: "4s" }} />
      
      {/* Navigation/Header Area */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white text-gradient">DownloaderPro</span>
        </div>
      </header>

      <Downloader />

      {/* Footer Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full z-10">
        <FeatureCard 
          title="Universal Support" 
          description="Works with YouTube, Instagram, Twitter, TikTok, and over 1,000 other sites automatically."
          icon="🌍"
        />
        <FeatureCard 
          title="High Quality" 
          description="Download in up to 4K resolution or extract crystal clear audio directly from videos."
          icon="✨"
        />
        <FeatureCard 
          title="Lightning Fast" 
          description="Optimized downloads running directly through our high-speed processing nodes."
          icon="⚡"
        />
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="glass-panel p-6 hover:bg-white/10 transition-colors">
      <div className="text-3xl mb-4 bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-white/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}
