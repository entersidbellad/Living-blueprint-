import React from 'react';
import { Mic, Activity } from 'lucide-react';

interface LiveControlsProps {
  isConnected: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
  hasBlueprint: boolean;
  volume?: number;
}

const LiveControls: React.FC<LiveControlsProps> = ({ isConnected, isSpeaking, onToggle, hasBlueprint, volume = 0 }) => {
  return (
    <div className="border-4 border-black bg-white p-4 shadow-hard mb-2 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold uppercase mb-0.5 text-black">Live Alignment</h2>
          <div className="flex items-center gap-2 font-mono text-xs text-black">
            STATUS: 
            <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
            {hasBlueprint ? (
                <span className="text-[10px] bg-black text-white px-1">BLUEPRINT_LOADED</span>
            ) : (
                <span className="text-[10px] bg-gray-300 text-black px-1">NO_BLUEPRINT</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
             {isConnected && (
                 <div className="flex flex-col items-end">
                     {isSpeaking && (
                         <div className="flex items-center gap-1 text-brutal-accent font-bold animate-pulse text-xs">
                             <Activity className="w-3 h-3" />
                             <span>SPEAKING</span>
                         </div>
                     )}
                     {!isSpeaking && (
                        <div className="flex items-center gap-1">
                             <span className="text-[10px] font-mono text-gray-500 uppercase">LISTENING...</span>
                        </div>
                     )}
                 </div>
             )}
            
            <div className="flex items-stretch gap-2">
                <div className="w-3 bg-neutral-200 border-2 border-black flex items-end relative overflow-hidden h-12">
                    <div 
                        className="w-full bg-brutal-highlight transition-all duration-75 ease-linear"
                        style={{ height: `${Math.min(100, volume * 100)}%` }}
                    />
                </div>

                <button
                    onClick={onToggle}
                    className={`
                        relative group overflow-hidden px-6 py-2 font-bold text-lg border-4 border-black transition-all shadow-hard active:shadow-none active:translate-x-1 active:translate-y-1 h-12 flex items-center
                        ${isConnected 
                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                            : 'bg-brutal-highlight text-black hover:bg-lime-400'}
                    `}
                >
                    <div className="flex items-center gap-2">
                        {isConnected ? <Activity className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                        <span className="text-sm">{isConnected ? 'SESSION_ACTIVE' : 'INITIATE_SESSION'}</span>
                    </div>
                </button>
            </div>
        </div>
      </div>
      
      {!hasBlueprint && !isConnected && (
         <div className="mt-3 text-center text-[10px] font-mono text-neutral-500 font-bold bg-neutral-100 p-1.5 border border-neutral-300 uppercase">
             NOTICE: STARTING WITHOUT BLUEPRINT WILL USE DEFAULT ARCHITECTURE (TITANIUM-CORE V4.5)
         </div>
      )}
    </div>
  );
};

export default LiveControls;