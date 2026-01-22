import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems = [], onAdd, onRemove, totalPrice }) => {

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#F5F7FA] dark:bg-slate-900 shadow-2xl z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#FF6F00]" />
                                Your Basket
                            </h2>
                            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {/* Cart List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {cartItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-60">
                                        <ShoppingBag className="w-12 h-12 mb-2" />
                                        <p className="text-sm">Your cart is empty</p>
                                    </div>
                                ) : (
                                    cartItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                            {/* Icon Placeholder */}
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                                                📦
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 dark:text-white truncate">{item.display_name}</h4>
                                                <p className="text-xs text-slate-500">₹{item.price || 100} / unit</p>
                                            </div>
                                            {/* Controls */}
                                            <div className="flex items-center gap-2 bg-[#FF6F00]/10 rounded-lg px-1 py-1">
                                                <button onClick={() => onRemove(item.name)} className="p-1 text-[#FF6F00] hover:bg-[#FF6F00] hover:text-white rounded transition-colors"><Minus className="w-3 h-3" /></button>
                                                <span className="text-xs font-bold text-[#FF6F00] w-4 text-center">{item.qty}</span>
                                                <button onClick={() => onAdd(item.name)} className="p-1 text-[#FF6F00] hover:bg-[#FF6F00] hover:text-white rounded transition-colors"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Bill Details */}
                            {cartItems.length > 0 && (
                                <div className="mt-auto p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-slate-500 font-medium text-sm">To Pay</span>
                                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">₹{totalPrice}</span>
                                    </div>

                                    <button className="w-full bg-[#FF6F00] hover:bg-[#e65100] text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                        Proceed to Pay <ArrowRight className="w-5 h-5" />
                                    </button>

                                    <div className="mt-3 flex justify-center items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest">
                                        <ShieldCheck className="w-3 h-3 text-green-500" /> Secure Checkout
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
