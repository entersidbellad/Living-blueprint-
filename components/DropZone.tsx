import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { analyze_visual_blueprint } from '../services/geminiService';

interface DropZoneProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (summary: string) => void;
  onAnalysisError: () => void;
  isLocked?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError, isLocked }) => {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLocked && status !== 'done') {
        setStatus('done');
        setFileName('RESTORED_FROM_SESSION_MEMORY');
    } else if (!isLocked && status === 'done' && fileName === 'RESTORED_FROM_SESSION_MEMORY') {
        setStatus('idle');
        setFileName('');
    }
  }, [isLocked, status, fileName]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Only image files (PNG/JPG) are supported for diagram analysis.");
        return;
    }

    setFileName(file.name);
    setStatus('analyzing');
    onAnalysisStart();

    try {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const summary = await analyze_visual_blueprint(base64String, file.type);
            onAnalysisComplete(summary);
            setStatus('done');
        };
        reader.readAsDataURL(file);
    } catch (e) {
        console.error(e);
        setStatus('error');
        onAnalysisError();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`
        relative h-full min-h-[300px] border-4 border-black p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-100
        ${dragActive ? 'bg-brutal-highlight' : 'bg-white hover:bg-stone-50'}
        ${status === 'error' ? 'bg-red-50 border-red-500' : ''}
        shadow-hard
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={triggerFileSelect}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        onChange={handleChange}
        accept="image/*"
      />

      {status === 'idle' && (
        <>
          <Upload className="w-16 h-16 mb-4" />
          <h3 className="text-2xl font-bold mb-2">DROP BLUEPRINT</h3>
          <p className="text-sm font-mono opacity-60">PNG, JPG (MAX 10MB)</p>
          <div className="absolute bottom-4 right-4 text-xs font-bold bg-black text-white px-2 py-1">
            WAITING_FOR_INPUT
          </div>
        </>
      )}

      {status === 'analyzing' && (
        <>
          <Loader2 className="w-16 h-16 mb-4 animate-spin text-brutal-accent" />
          <h3 className="text-xl font-bold mb-2">INGESTING ARCHITECTURE...</h3>
          <p className="font-mono text-sm">{fileName}</p>
        </>
      )}

      {status === 'done' && (
        <>
          <CheckCircle className="w-16 h-16 mb-4 text-green-600" />
          <h3 className="text-xl font-bold mb-2">BLUEPRINT LOCKED</h3>
          <p className="font-mono text-sm mb-4">{fileName}</p>
          <div className="p-2 border-2 border-black bg-brutal-highlight text-xs font-mono max-w-xs truncate">
            READY_FOR_ALIGNMENT
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertTriangle className="w-16 h-16 mb-4 text-red-600" />
          <h3 className="text-xl font-bold mb-2">INGESTION FAILED</h3>
          <p className="font-mono text-sm">TRY AGAIN</p>
        </>
      )}
    </div>
  );
};

export default DropZone;