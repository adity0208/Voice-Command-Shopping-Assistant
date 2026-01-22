import { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, Activity } from 'lucide-react';

const DebugPanel = ({ apiResponse, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const endRef = useRef(null);

    // Auto-scroll to bottom of log (if we were logging history, but for now we show latest)
    useEffect(() => {
        if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [apiResponse, error, isOpen]);

    // Don't show anything until first interaction
    if (!apiResponse && !error) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-[90vw] md:w-[400px]' : 'w-auto'}`}>

            {/* Header / Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md border border-green-500/30 text-green-400 text-sm font-mono rounded-t-lg shadow-2xl w-full hover:bg-black/90 transition-colors"
            >
                <Terminal className="w-4 h-4" />
                <span className="flex-grow text-left">NLP_KERNEL_DEBUG</span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Terminal Body */}
            {isOpen && (
                <div className="bg-black/80 backdrop-blur-xl border border-t-0 border-green-500/30 p-4 rounded-b-lg font-mono text-xs overflow-hidden shadow-2xl">

                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 text-slate-400">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span>LATEST_TRANSACTION</span>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar">
                        {error ? (
                            <div className="text-red-400">
                                <span className="text-red-500 font-bold">[ERROR]</span> {error}
                            </div>
                        ) : (
                            <pre className="text-green-300 break-words whitespace-pre-wrap">
                                {JSON.stringify(apiResponse, null, 2)}
                            </pre>
                        )}
                        <div ref={endRef} />
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[10px] text-slate-500 uppercase">
                        <span>Status: {error ? 'FAIL' : 'OK'}</span>
                        <span>Latency: &lt;100ms</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
