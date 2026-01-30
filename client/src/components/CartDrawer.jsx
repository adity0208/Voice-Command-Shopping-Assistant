import { X, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems = [], onAdd, onRemove, totalPrice }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex md:justify-end items-end md:items-stretch">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            />

            {/* Drawer Panel - Bottom sheet on mobile, side drawer on desktop */}
            <div
                className="relative w-full md:max-w-sm bg-[#F5F7FA] dark:bg-slate-900 shadow-2xl z-[60] flex flex-col max-h-[85vh] md:max-h-full md:h-full transform transition-transform duration-300 ease-in-out rounded-t-3xl md:rounded-none"
            >
                {/* Drag Handle (Mobile Only) */}
                <div className="md:hidden flex justify-center pt-2 pb-1">
                    <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#FF6F00]" />
                        Your Basket
                    </h2>
                    <button onClick={onClose} className="p-2 md:p-2.5 min-w-[44px] min-h-[44px] bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {/* Cart List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-60">
                                <ShoppingBag className="w-12 h-12 mb-2" />
                                <p className="text-sm">Your cart is empty</p>
                            </div>
                        ) : (
                            cartItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    {/* Icon Placeholder */}
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                                        📦
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm">{item.display_name}</h4>
                                        <p className="text-xs text-slate-500">₹{item.price || 100} / unit</p>
                                    </div>
                                    {/* Controls */}
                                    <div className="flex items-center gap-1.5 bg-[#FF6F00]/10 rounded-lg px-1 py-1">
                                        <button onClick={() => onRemove(item.name)} className="p-1.5 min-w-[36px] min-h-[36px] text-[#FF6F00] hover:bg-[#FF6F00] hover:text-white rounded transition-colors flex items-center justify-center">
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-bold text-[#FF6F00] w-6 text-center">{item.qty}</span>
                                        <button onClick={() => onAdd(item.name)} className="p-1.5 min-w-[36px] min-h-[36px] text-[#FF6F00] hover:bg-[#FF6F00] hover:text-white rounded transition-colors flex items-center justify-center">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bill Details */}
                    {cartItems.length > 0 && (
                        <div className="mt-auto p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 font-medium text-sm">Estimated Cost</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">₹{totalPrice}</span>
                            </div>

                            <button
                                onClick={() => {
                                    const text = "🛒 *My Shopping List*:\n\n" + cartItems.map(item => `- ${item.qty} ${item.display_name}`).join("\n");
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 min-h-[48px] rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                            >
                                Share on WhatsApp <ArrowRight className="w-5 h-5" />
                            </button>

                            <div className="mt-3 flex justify-center items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3 text-green-500" /> Secure & Private
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
