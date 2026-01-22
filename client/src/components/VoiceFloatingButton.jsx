import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import VoiceWave from './VoiceWave';

const VoiceFloatingButton = ({ isListening, onClick, audioStream }) => {
    return (
        <>
            {/* Expanded Modal Overlay when Active */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-4"
                        onClick={onClick}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 50, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden"
                        >
                            {/* Clean Header */}
                            <div className="absolute top-4 right-4">
                                <button onClick={onClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Visualizer Container */}
                            <div className="w-24 h-24 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
                                <VoiceWave isListening={isListening} audioStream={audioStream} />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Listening...</h3>
                                <p className="text-slate-500 text-base">"Add 5 Apples"</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button (Always Visible) */}
            {!isListening && (
                <motion.button
                    onClick={onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-full shadow-xl shadow-black/20 flex items-center justify-center group"
                >
                    <div className="absolute inset-0 rounded-full bg-slate-500/20 group-hover:scale-110 transition-transform" />
                    <Mic className="w-6 h-6" strokeWidth={2} />
                </motion.button>
            )}
        </>
    );
};

export default VoiceFloatingButton;
