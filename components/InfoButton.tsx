import React, { useState } from 'react';
import { HelpCircle, X, Cpu, ShieldAlert, RotateCcw } from 'lucide-react';

const InfoButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Small Square Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 flex items-center justify-center border-4 border-black bg-white hover:bg-brutal-highlight transition-all shadow-hard-sm active:shadow-none active:translate-x-1 active:translate-y-1"
        title="SYSTEM_MANIFESTO"
      >
        <HelpCircle className="w-6 h-6 text-black" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl border-4 border-black bg-white shadow-hard flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
              <div className="px-3 py-1 ml-2">
                <h2 className="text-xl font-black tracking-tighter uppercase font-mono">
                  SYSTEM_MANIFESTO_V1.0
                </h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 transition-colors mr-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto space-y-8 font-mono text-black">
              
              <section className="space-y-3">
                <h3 className="text-lg font-black flex items-center gap-2 border-b-2 border-black pb-1 uppercase">
                  <Cpu className="w-5 h-5" /> 01_COMPUTE_ENGINE
                </h3>
                <div className="py-2">
                  <p className="text-sm leading-relaxed">
                    Employs Multi-Threaded Web Workers for non-blocking real-time audio analysis and a persistent WebSocket (WSS) layer for bidirectional neural-link stability. Orchestration utilizes a dual-stack architecture: Gemini 2.5 Flash (Native Audio) for L1 sensory input and Gemini 3 Flash for L2 architectural reasoning.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-black flex items-center gap-2 border-b-2 border-black pb-1 uppercase">
                  <ShieldAlert className="w-5 h-5" /> 02_EDGE_CASE_HANDLING
                </h3>
                <div className="py-2">
                  <p className="text-sm leading-relaxed">
                    Standard security protocols in hardened browser environments (Brave/Chrome) may intercept the WSS handshake or restrict Worker instantiation, prioritizing client-side privacy over real-time stream stability.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-black flex items-center gap-2 border-b-2 border-black pb-1 uppercase">
                  <RotateCcw className="w-5 h-5" /> 03_MANUAL_OVERRIDE
                </h3>
                <div className="text-sm leading-relaxed py-2">
                  To bypass localized security conflicts and access full-bandwidth alignment, initialize the session via a Chrome Guest Profile or Firefox.
                </div>
              </section>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-4 border-black flex justify-end bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-black text-white px-8 py-2 font-bold uppercase hover:bg-neutral-800 transition-all shadow-hard-sm active:shadow-none active:translate-x-1 active:translate-y-1 mr-2"
              >
                CLOSE_DOCUMENTATION
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default InfoButton;