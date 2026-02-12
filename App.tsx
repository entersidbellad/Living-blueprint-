import React, { useState, useEffect } from 'react';
import DropZone from './components/DropZone';
import LiveControls from './components/LiveControls';
import DriftConsole from './components/DriftConsole';
import CommandInput from './components/CommandInput';
import InfoButton from './components/InfoButton';
import { useLiveSession } from './hooks/useLiveSession';
import { DriftReport } from './types';
import { LayoutGrid } from 'lucide-react';
import { validateFeatureCompliance, MOCK_REPOSITORY_CONTEXT } from './services/geminiService';

const STORAGE_KEY = 'living_blueprint_session';

const App: React.FC = () => {
  const [blueprintSummary, setBlueprintSummary] = useState<string>('');
  const [reports, setReports] = useState<DriftReport[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      setIsRestoring(true);
      setTimeout(() => {
        try {
            const { blueprintSummary: savedSummary, reports: savedReports } = JSON.parse(savedSession);
            if (savedSummary) setBlueprintSummary(savedSummary);
            if (savedReports) setReports(savedReports);
        } catch(e) {
            console.error("Error restoring session:", e);
        } finally {
            setIsRestoring(false);
        }
      }, 1000);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isRestoring) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            blueprintSummary,
            reports
        }));
    }
  }, [blueprintSummary, reports, isRestoring]);

  const handleClearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBlueprintSummary('');
    setReports([]);
  };

  const handleDriftReport = (report: DriftReport) => {
    setReports(prev => [report, ...prev]);
  };

  const handleAnalysisStart = () => {
    setIsScanning(true);
  };

  const handleAnalysisError = () => {
    setIsScanning(false);
  };

  const handleAnalysisComplete = (summary: string) => {
    setBlueprintSummary(summary);
    setIsScanning(false);
    
    const report: DriftReport = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        title: "BLUEPRINT_LOADED_FROM_IMAGE",
        severity: 'INFO',
        component: "Visual Cortex",
        description: "Architecture diagram successfully analyzed. Microservices, databases, and protocols have been extracted into system memory.",
        suggestion: "Ready for architectural alignment verification.",
        confidence: 100
    };
    handleDriftReport(report);
  };

  const handleCommand = async (text: string) => {
    setIsAnalyzingText(true);
    const contextToUse = blueprintSummary || MOCK_REPOSITORY_CONTEXT;

    try {
        const result = await validateFeatureCompliance(text, contextToUse);
        const severityMap: Record<number, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
            1: 'LOW', 2: 'LOW', 3: 'LOW', 4: 'MEDIUM', 5: 'MEDIUM', 
            6: 'MEDIUM', 7: 'HIGH', 8: 'HIGH', 9: 'CRITICAL', 10: 'CRITICAL'
        };

        if (result.is_conflict) {
            handleDriftReport({
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                title: "MANUAL_QUERY_VIOLATION",
                severity: severityMap[result.conflict_severity] || 'MEDIUM',
                component: result.affected_component || 'System',
                description: `Proposed Feature: "${text}"`,
                suggestion: result.remediation_steps,
                confidence: result.confidence_score || 100
            });
        } else {
             handleDriftReport({
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                title: "COMPLIANCE_VERIFIED",
                severity: 'INFO',
                component: "Architectural Auditor",
                description: `Feature proposal "${text}" aligns with system constraints.`,
                suggestion: "Proceed with implementation.",
                confidence: result.confidence_score || 100
            });
        }
    } catch (e) {
        console.error("Text command failed", e);
        handleDriftReport({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            title: "QUERY_PROCESSING_ERROR",
            severity: 'HIGH',
            component: "System Interface",
            description: "Failed to process manual query.",
            suggestion: "Check connection and try again.",
            confidence: 0
        });
    } finally {
        setIsAnalyzingText(false);
    }
  };

  const { isConnected, isSpeaking, isProcessing, error, connect, disconnect, volume } = useLiveSession({
    initialContext: blueprintSummary,
    onDriftReport: handleDriftReport
  });

  const handleToggleSession = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };
  
  const handleReboot = () => {
      disconnect();
      setTimeout(() => {
          connect();
      }, 100);
  };

  return (
    <div className="min-h-screen bg-brutal-bg p-4 flex flex-col font-mono selection:bg-brutal-accent selection:text-white text-black overflow-hidden">
      {/* Header */}
      <header className="mb-4 flex flex-col md:flex-row items-baseline justify-between border-b-4 border-black pb-2 gap-4">
        <div className="flex flex-col md:flex-row items-baseline gap-4">
           <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-black leading-none whitespace-nowrap">
             The Living Blueprint
           </h1>
           <p className="text-[10px] font-bold bg-black text-white px-2 py-0.5 uppercase tracking-widest whitespace-nowrap">
             ARCHITECTURAL_DRIFT_ELIMINATOR_V1
           </p>
        </div>
        
        <InfoButton />
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-1">
            <LiveControls 
                isConnected={isConnected}
                isSpeaking={isSpeaking}
                onToggle={handleToggleSession}
                hasBlueprint={!!blueprintSummary}
                volume={volume}
            />

            <CommandInput 
                onSend={handleCommand} 
                disabled={isAnalyzingText || isProcessing || isScanning} 
            />
            
            <div className="flex-1 min-h-[300px]">
                <DropZone 
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete} 
                    onAnalysisError={handleAnalysisError}
                    isLocked={!!blueprintSummary}
                />
            </div>
            
            {blueprintSummary && (
                <div className="border-4 border-black bg-white p-3 shadow-hard-sm text-black mb-4">
                    <h3 className="font-bold border-b-2 border-black mb-1 flex items-center gap-2 uppercase tracking-tighter text-xs">
                        <LayoutGrid className="w-3 h-3" />
                        SYSTEM_CONTEXT
                    </h3>
                    <p className="text-[10px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {blueprintSummary}
                    </p>
                </div>
            )}
        </div>

        {/* Right Column: Console */}
        <div className="lg:col-span-5 h-[500px] lg:h-full">
            <DriftConsole 
                reports={reports} 
                isProcessing={isProcessing} 
                onClearSession={handleClearSession}
                isRestoring={isRestoring}
                isScanning={isScanning}
                isAnalyzingText={isAnalyzingText}
                isConnected={isConnected}
                error={error}
                onReboot={handleReboot}
            />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-4 flex justify-center pb-2">
        <div className="text-[7px] md:text-[9px] font-bold text-black uppercase opacity-60 text-center tracking-tighter">
          ARCH_AUDIT_PROTOCOL_ACTIVE // DEPLOYED_BY: SIDDHARTH BELLAD // CREDENTIALS: DUKE_U // L1_AUDIO: GEMINI_2.5_FLASH_NATIVE // L2_LOGIC: GEMINI_3_FLASH // STATUS: NO_DRIFT_POLICY_ENFORCED
        </div>
      </footer>
    </div>
  );
};

export default App;