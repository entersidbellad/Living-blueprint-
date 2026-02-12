import React, { useState, useEffect } from 'react';
import { DriftReport } from '../types';
import { AlertOctagon, Terminal, ArrowRight, Loader2, HelpCircle, Activity, Trash2, ScanEye, MessageSquare, Download, Clock, AlertTriangle } from 'lucide-react';

interface DriftConsoleProps {
  reports: DriftReport[];
  isProcessing: boolean;
  onClearSession: () => void;
  isRestoring: boolean;
  isScanning?: boolean;
  isAnalyzingText?: boolean;
  isConnected?: boolean;
  error?: string | null;
  onReboot: () => void;
}

const DriftConsole: React.FC<DriftConsoleProps> = ({ reports, isProcessing, onClearSession, isRestoring, isScanning, isAnalyzingText, isConnected, error, onReboot }) => {
  const hasDrift = reports.length > 0;
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isConnected) {
        interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleExport = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `drift_audit_log_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Critical Error State for Handshake Failure
  if (error === "WEBSOCKET_HANDSHAKE_FAILED" || error === "MICROPHONE_PERMISSION_DENIED" || error === "AUDIO_DEVICE_ERROR") {
    return (
        <div className="flex flex-col h-full border-4 border-red-600 bg-red-50 text-red-600 shadow-hard overflow-hidden animate-pulse">
            <div className="flex items-center justify-between p-4 border-b-4 border-red-600 bg-red-600 text-white">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-xl font-bold tracking-tighter">CRITICAL_SYSTEM_FAILURE</h2>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="text-6xl font-black mb-2">ERROR</div>
                <div className="text-xl font-mono font-bold">{error}</div>
                <p className="font-mono bg-red-200 p-2 text-sm border-2 border-red-600">
                    {error === "MICROPHONE_PERMISSION_DENIED" 
                        ? "ACCESS DENIED: PLEASE ALLOW MICROPHONE ACCESS AND RETRY." 
                        : "CONNECTION REFUSED. SYSTEM WILL ATTEMPT TO RECONNECT."}
                </p>
                <button 
                    onClick={onReboot}
                    className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-neutral-800 border-4 border-black mt-4"
                >
                    INITIATE_SYSTEM_REBOOT
                </button>
            </div>
        </div>
    )
  }

  return (
    <div 
        className={`
            flex flex-col h-full border-4 transition-colors duration-300
            ${hasDrift ? 'border-brutal-accent' : 'border-black'} 
            bg-black text-neutral-400 shadow-hard overflow-hidden
        `}
    >
      <div 
          className={`
            flex items-center justify-between p-4 border-b-4 border-neutral-800 
            ${hasDrift ? 'bg-brutal-accent text-black' : 'bg-white text-black'}
          `}
      >
        <div className="flex items-center gap-2">
           <Terminal className="w-6 h-6" />
           <h2 className="text-xl font-bold tracking-tighter">DRIFT_CONSOLE</h2>
        </div>
        
        <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-bold">{reports.length} ITEMS</span>
            <button 
                onClick={onClearSession}
                title="CLEAR SESSION DATA"
                className="hover:text-red-600 transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {isConnected && (
         <div className="bg-green-600 text-white p-2 flex items-center justify-between font-bold text-sm border-b-2 border-black animate-pulse">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" />
                <span>LIVE_STREAM_ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4" />
                {time}
            </div>
         </div>
      )}
      
      {isRestoring ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-black text-brutal-highlight p-8">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-mono font-bold text-lg animate-pulse text-center">
                RESTORING_SESSION_FROM_CACHE...
            </p>
        </div>
      ) : (
        <>
            {isProcessing && (
                <div className="bg-brutal-highlight text-black p-2 flex items-center justify-center gap-2 animate-pulse border-b-2 border-black font-bold text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ANALYZING_ARCHITECTURE_COMPLIANCE...</span>
                </div>
            )}
            
            {isScanning && (
                <div className="bg-brutal-accent text-white p-2 flex items-center justify-center gap-2 animate-pulse border-b-2 border-black font-bold text-sm">
                    <ScanEye className="w-4 h-4 animate-spin" />
                    <span>SCANNING_VISUAL_ASSETS...</span>
                </div>
            )}

            {isAnalyzingText && (
                <div className="bg-white text-black p-2 flex items-center justify-center gap-2 animate-pulse border-b-2 border-black font-bold text-sm">
                    <MessageSquare className="w-4 h-4 animate-spin" />
                    <span>ANALYZING_QUERY...</span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
                {reports.length === 0 && !isProcessing && !isScanning && !isAnalyzingText ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                    <p className="text-center">
                        > SYSTEM NOMINAL<br/>
                        > STRICT MODE ACTIVE<br/>
                        > WAITING FOR INPUT...
                    </p>
                </div>
                ) : (
                reports.map((report) => {
                    const isLowConfidence = report.confidence !== undefined && report.confidence < 85 && report.severity !== 'INFO';
                    
                    return (
                        <div 
                            key={report.id} 
                            className={`
                                border-2 p-4 relative transition-all
                                ${report.severity === 'CRITICAL' ? 'border-red-500' :
                                report.severity === 'INFO' ? 'border-blue-400 bg-blue-900/10' :
                                'border-neutral-700'}
                                ${isLowConfidence ? 'animate-pulse border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'hover:translate-x-1'}
                            `}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2">
                                    <span className={`px-2 py-0.5 text-xs font-bold text-black ${
                                        report.severity === 'CRITICAL' ? 'bg-red-500' :
                                        report.severity === 'HIGH' ? 'bg-orange-500' :
                                        report.severity === 'MEDIUM' ? 'bg-yellow-400' : 
                                        report.severity === 'INFO' ? 'bg-blue-400' : 'bg-blue-300'
                                    }`}>
                                        {report.severity}
                                    </span>
                                    {report.confidence !== undefined && report.severity !== 'INFO' && (
                                        <span className={`px-2 py-0.5 text-xs font-bold border ${
                                            isLowConfidence ? 'bg-yellow-900 text-yellow-400 border-yellow-400' : 'bg-black text-green-500 border-green-500'
                                        }`}>
                                            CONF: {report.confidence}%
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-neutral-500">{new Date(report.timestamp).toLocaleTimeString()}</span>
                            </div>

                            {/* Low Confidence Warning */}
                            {isLowConfidence && (
                                <div className="mb-2 flex items-center gap-2 text-yellow-400 text-xs font-bold border border-yellow-400 p-1 bg-yellow-400/10">
                                    <Activity className="w-3 h-3" />
                                    HUMAN_IN_THE_LOOP_REQUIRED
                                </div>
                            )}

                            {/* Title & Component */}
                            <h3 className={`text-lg font-bold mb-1 uppercase tracking-tight ${report.severity === 'INFO' ? 'text-blue-400' : 'text-brutal-highlight'}`}>
                                {report.title}
                            </h3>
                            <p className="text-sm mb-2 text-neutral-500">
                                Target: {report.component}
                            </p>

                            {/* Description */}
                            <p className="text-sm mb-4 border-l-2 border-neutral-600 pl-2 text-neutral-300">
                                {report.description}
                            </p>
                            
                            {/* Remediation / Suggestion Box */}
                            <div className={`
                                border p-3 mt-2 font-mono text-xs
                                ${report.severity === 'INFO' 
                                    ? 'bg-blue-900/20 border-blue-500 shadow-[2px_2px_0px_0px_rgba(59,130,246,0.2)]' 
                                    : 'bg-neutral-900 border-green-900 shadow-[2px_2px_0px_0px_rgba(0,255,0,0.2)]'}
                            `}>
                                <div className={`${report.severity === 'INFO' ? 'text-blue-400' : 'text-green-500'} font-bold mb-1 flex items-center gap-2`}>
                                    {report.severity === 'INFO' ? <HelpCircle className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                    {report.severity === 'INFO' ? 'CLARIFICATION_NEEDED:' : 'REMEDIATION_PROTOCOL:'}
                                </div>
                                <div className={`${report.severity === 'INFO' ? 'text-blue-200' : 'text-green-300'} leading-relaxed pl-5`}>
                                    {report.suggestion}
                                </div>
                            </div>
                        </div>
                    );
                })
                )}
            </div>

            <div className="p-4 border-t-4 border-neutral-800 bg-neutral-900">
                <button 
                    onClick={handleExport}
                    disabled={reports.length === 0}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Download className="w-4 h-4" />
                    DOWNLOAD_AUDIT
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default DriftConsole;