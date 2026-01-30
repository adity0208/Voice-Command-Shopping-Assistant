import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';

const TranscriptionHeader = ({ transcript, isListening }) => {
    return (
        <div className="w-full bg-slate-900 text-white rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden min-h-[120px] flex items-center justify-center">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20" />

            <AnimatePresence mode='wait'>
                {isListening ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key="listening"
                        className="text-center z-10"
                    >
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-medium text-blue-200">Listening...</h2>
                    </motion.div>
                ) : transcript ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key="transcript"
                        className="text-center z-10 max-w-2xl"
                    >
                        <p className="text-sm text-blue-300 font-bold uppercase tracking-wider mb-2">You said</p>
                        <h3 className="text-2xl md:text-3xl font-medium leading-relaxed">"{transcript}"</h3>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key="empty"
                        className="text-center z-10"
                    >
                        <h3 className="text-xl text-slate-400 font-medium">Tap the mic to add items</h3>
                        <p className="text-sm text-slate-500 mt-1">Try "Add aadha kilo tamatar"</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TranscriptionHeader;
