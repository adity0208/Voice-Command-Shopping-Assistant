import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Clock, TrendingUp } from 'lucide-react';

const SuggestionsDrawer = ({ isOpen, onClose, suggestions, onSelect }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-80 bg-navy-900/95 border-l border-violet-500/20 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-violet-900/10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                                Smart Picks
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Section 1: Top Recommendations */}
                            <div>
                                <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Recommended
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {suggestions.slice(0, 3).map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSelect(item)}
                                            className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-left"
                                        >
                                            <span className="text-slate-200 group-hover:text-white capitalize">{item}</span>
                                            <span className="text-xs text-slate-500 py-1 px-2 rounded bg-black/20 group-hover:bg-violet-500/20 group-hover:text-violet-200">Add</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Recent History (Simulated for this demo) */}
                            <div>
                                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Frequent
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.slice(3).map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSelect(item)}
                                            className="px-3 py-1.5 rounded-full text-sm bg-black/20 border border-white/10 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors capitalize text-slate-400"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                            <p className="text-xs text-slate-500">AI-Powered Suggestions</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SuggestionsDrawer;
