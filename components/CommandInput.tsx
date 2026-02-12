import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommandInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const CommandInput: React.FC<CommandInputProps> = ({ onSend, disabled }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSend(query);
      setQuery('');
    }
  };

  return (
    <div className="border-4 border-black bg-white p-3 shadow-hard-sm">
        <h3 className="font-bold mb-1 flex items-center gap-1 font-mono text-[10px] tracking-tight uppercase">
            <span className="opacity-70 font-black">&gt;_</span> MANUAL_OVERRIDE
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="PROPOSE_FEATURE..."
              disabled={disabled}
              className="flex-1 h-8 px-2 font-mono text-[10px] text-neutral-300 border-2 border-black bg-[#2D2D2D] focus:outline-none placeholder:text-neutral-500 uppercase"
            />
            <button
                type="submit"
                disabled={disabled || !query.trim()}
                className="bg-[#8E8E8E] text-white px-3 h-8 font-bold uppercase hover:bg-neutral-500 disabled:opacity-50 border-2 border-black shadow-hard-sm active:shadow-none flex items-center gap-2"
            >
                <span className="text-[10px]">EXECUTE</span>
                <Send className="w-3 h-3" />
            </button>
        </form>
    </div>
  );
};

export default CommandInput;