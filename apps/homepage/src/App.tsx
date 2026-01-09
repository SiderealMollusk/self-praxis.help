import React, { useState } from 'react';

const App: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const verificationCommand = `d=unvetted.net; ip=$(dig +short "$d" | head -1); echo "IP: $ip"; echo "NS: $(dig +short NS "$d" | tr '\\n' ' ')"; curl -s "https://ipapi.co/$ip/json/"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen flex flex-col select-none bg-white text-black font-mono-custom">
      {/* Header */}
      <header className="border-b-4 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-extrabold uppercase tracking-tighter italic">
            Unvetted.net
          </h1>
          <div className="text-xs tracking-widest mt-2 uppercase text-zinc-500">
            Virgil // Signal App
          </div>
        </div>
        <div className="text-right text-[10px] tracking-widest uppercase flex flex-col gap-1">
          <div className="bg-black text-white px-1">Status: Online</div>
          <div>Loc: Unvetted.net</div>
        </div>
      </header>

      {/* Content Body as Invoice Items */}
      <main className="flex-grow">
        <div className="border-2 border-black p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="bg-black text-white p-3 flex justify-between text-xs uppercase tracking-widest font-bold">
            <span>Manifesto / Bio</span>
            <span>Ref: #001</span>
          </div>

          <div className="p-8 leading-relaxed text-lg font-sans">
            <p className="mb-6 font-bold text-3xl uppercase tracking-tight">
              I am Virgil.
            </p>
            <p className="text-zinc-800 mb-6">
              This web page is an anonymous space for people working to melt &#129482; and liberate &#127817;. This domain is held by a privacy focused domain registrar, and served by a privacy focused VPS provider in the EU.
            </p>
            <div className="mb-6 bg-zinc-50 border border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
              <div className="flex justify-between items-center border-b border-dashed border-zinc-300 pb-1 mb-1">
                <div className="text-[9px] uppercase tracking-widest text-zinc-400">Third-Party Verification</div>
                <button
                  onClick={handleCopy}
                  className="text-[9px] uppercase font-bold tracking-widest hover:text-white hover:bg-black px-1 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <code className="text-[10px] whitespace-pre select-all text-black font-mono block overflow-x-auto pb-1">
                {verificationCommand}
              </code>
            </div>
            <p className="text-zinc-600 mb-4 font-mono-custom text-sm">
                    // Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          <div className="border-t-2 border-dashed border-black p-2 flex justify-between text-[10px] uppercase font-bold bg-zinc-50">
            <span>End of Transmission</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-black border-dashed flex flex-col items-center gap-4 text-[9px] uppercase tracking-widest text-zinc-400">
        <div>Njal.la Domain | Finish Data Sovereign VPS | Tailscale {'->'} On Prem Server</div>
        <div>&copy; {new Date().getFullYear()} Virgil // unvetted.posting359@passmail.com</div>
      </footer>
    </div>
  );
};
export default App;
