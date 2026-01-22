import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, ShieldCheck } from 'lucide-react';

const CartBar = ({ totalItems, totalPrice, onClick }) => {
    return (
        <AnimatePresence>
            {totalItems > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50"
                >
                    <button
                        onClick={onClick}
                        className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-slate-700 flex items-center justify-between group overflow-hidden relative"
                    >
                        {/* Left: Total */}
                        <div className="flex flex-col items-start pl-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#2979FF]" /> {totalItems} ITEMS
                            </span>
                            <span className="text-lg font-extrabold text-slate-800 dark:text-white">
                                ₹{totalPrice}
                            </span>
                        </div>

                        {/* Right: CTA */}
                        <div className="flex items-center gap-2 bg-[#FF6F00] hover:bg-[#e65100] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-500/20">
                            View Cart
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartBar;
