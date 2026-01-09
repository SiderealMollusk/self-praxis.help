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

        </div>
        <div className="text-right tracking-widest uppercase flex flex-col items-end gap-1">
          <div className="text-base tracking-widest mt-2 uppercase text-zinc-500">
            "Security" through obscurity
          </div>
          <div className="text-base tracking-widest mt-2 uppercase text-zinc-500">
            Melt <span className="grayscale">&#129482;</span> // Free <span className="grayscale">&#127817;</span>
          </div>
        </div>
      </header>

      {/* Content Body as Invoice Items */}
      <main className="flex-grow">
        <div className="border-2 border-black p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
          {/* Hazard Stripe Top */}
          <div className="h-2 w-full border-b-2 border-black" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 10px, #fff 10px, #fff 20px)' }}></div>

          <div className="bg-black text-white p-3 flex justify-between text-xs uppercase tracking-widest font-bold">
            <span>Caution: Anyone can view and edit information on this site </span>
            <span>Doc: #001</span>
          </div>

          {/* Hazard Stripe Bottom */}
          <div className="h-2 w-full border-t-2 border-black" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 10px, #fff 10px, #fff 20px)' }}></div>

          <div className="p-8 leading-relaxed text-lg font-sans">
            <p className="mb-6 font-bold text-3xl uppercase tracking-tight">
              Welcome Comrade
            </p>
            <p className="mb-6 text-base tracking-tight">
              This domain is maintained by Virgil (SignalApp). The Only thing here is Eastmont Food Distribution shift sign-ups. Just like the cryptopad anyone with the URL can see and edit the information, and we rely on security through obscurity. People like cryptopad because users can hide information from the platform owners. Using this domain has the same level of trust as using a pad I created. The trade off is that I don’t have anything like their reputation, HOWEVER it is <b>a custom ui for our needs, and automatically deletes all information about past shifts.</b>
            </p>
            <p className="mb-6 text-base tracking-tight">
              I am interested in figuring out how to contribute to technical abilities to Bay Area organizing. That is what motivated me to spend the energy to set up a secure server for something ultimately so simple. It we don't adopt it, promise I will not be but hurt.
            </p>
            <div className="mb-6 text-base tracking-tight">
              <p className="mb-2">For some basic evidence I know what I'm doing:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The server is hosted by <u><a href="https://www.netcup.de">netcup</a></u> physically in Germany, out of reach of US law enforcement.</li>
                <li>SSL Lab Rating: <u><a href="https://www.ssllabs.com/ssltest/analyze.html?d=unvetted.net">https://www.ssllabs.com/ssltest/analyze.html?d=unvetted.net</a></u></li>
                <li>Security Headers: <u><a href="https://securityheaders.com/?q=unvetted.net&followRedirects=on">https://securityheaders.com/?q=unvetted.net&followRedirects=on</a></u></li>
                <li>Finally, for easy verification:</li>
              </ul>
            </div>
            <div className="mb-6 bg-zinc-50 border border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
              <div className="flex justify-between items-center border-b border-dashed border-zinc-300 pb-1 mb-1">
                <div className="text-[9px] uppercase tracking-widest text-zinc-400">
                  <span className="inline-block grayscale">⚠️</span> Don't paste bash from the internet into a terminal:
                </div>
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
            <p className="mb-6 text-base tracking-tight">
              <b>Please be aware</b>
              <ul>
                <li>There is zero identity verification on this site</li>
                <li>Pages are read/writeable by anyone in unvetted signal groups.</li>
                <li>This is not "strong security posture" according to <u><a href="https://www.schneierfacts.com">Bruce Schneier</a></u>
                </li>
              </ul>
            </p>

            <p className="text-zinc-600 mb-4 font-mono-custom text-sm">
                    // Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          <div className="border-t-2 border-dashed border-black p-2 flex justify-between text-[10px] uppercase font-bold bg-zinc-50">
            <span>See you out there</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </main >

      {/* Footer */}
      < footer className="mt-12 py-8 border-t border-black border-dashed flex flex-col items-center gap-4 text-[9px] uppercase tracking-widest text-zinc-400" >
        <div>Virgil // unvetted.posting359@passmail.com</div>
      </footer >
    </div >
  );
};
export default App;
