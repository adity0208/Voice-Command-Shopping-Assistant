import { Trash2, Milk, Carrot, Croissant, Package, Cookie, Coffee, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryIcon = ({ category }) => {
    const iconProps = { className: "w-6 h-6 text-blue-300" };
    const map = {
        'Dairy & Eggs': <Milk {...iconProps} />,
        'Produce': <Carrot {...iconProps} />,
        'Bakery & Breads': <Croissant {...iconProps} />,
        'Pantry Staples': <Package {...iconProps} />,
        'Snacks': <Cookie {...iconProps} />,
        'Beverages': <Coffee {...iconProps} />,
    };
    return map[category] || <ShoppingBag {...iconProps} />;
};

const SkeletonCard = () => (
    <div className="glass-panel rounded-xl p-4 flex items-center justify-between animate-pulse border-blue-400/30">
        <div className="space-y-2 w-full">
            <div className="h-5 bg-blue-400/20 rounded w-1/2"></div>
            <div className="h-3 bg-blue-400/10 rounded w-1/4"></div>
        </div>
        <div className="w-8 h-8 bg-blue-400/10 rounded-full"></div>
    </div>
);

const ShoppingList = ({ list, onRemove, isProcessing }) => {
    const categories = Object.keys(list).sort();

    if (categories.length === 0 && !isProcessing) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <ShoppingBag className="w-24 h-24 mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-slate-300">Your cart is empty</h3>
                <p className="text-slate-400">Try saying "Add 2kg potatoes"</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <AnimatePresence>
                {/* Ghost Card "Processing" State - Shown at top for visibility */}
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                    >
                        <h2 className="text-lg font-semibold text-blue-200/50 flex items-center gap-2 px-2 mb-3">
                            <Plus className="w-5 h-5 animate-spin" />
                            Adding item...
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SkeletonCard />
                        </div>
                    </motion.div>
                )}

                {categories.map((category) => (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <h2 className="text-lg font-semibold text-blue-200 flex items-center gap-2 px-2">
                            <CategoryIcon category={category} />
                            {category}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <AnimatePresence mode='popLayout'>
                                {Object.entries(list[category]).map(([key, data]) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.3 }}
                                        layout
                                        className="group glass-panel rounded-xl p-4 flex items-center justify-between hover:bg-white/15 transition-colors border border-transparent hover:border-blue-400/30"
                                    >
                                        <div>
                                            <h3 className="text-lg font-medium text-white">{data.display_name}</h3>
                                            <p className="text-sm text-blue-200/70">{data.quantity}</p>
                                        </div>

                                        <button
                                            onClick={() => onRemove(key)}
                                            className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ShoppingList;
