import { useState } from 'react';
import { Trash2, Milk, Carrot, Croissant, Package, Cookie, Coffee, ShoppingBag, Plus } from 'lucide-react';

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

const ShoppingList = ({ list, onRemove, isProcessing, onAddCustom }) => {
    console.log("DEBUG: ShoppingList Render", { listKeys: list ? Object.keys(list) : 'null', isProcessing });

    // Safety check for list prop
    if (!list || typeof list !== 'object') {
        return null; // Return null if list is invalid to prevent crash
    }
    const categories = Object.keys(list).sort();
    const [customItem, setCustomItem] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    if (categories.length === 0 && !isProcessing && !isAdding) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <ShoppingBag className="w-24 h-24 mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-slate-300">Your list is empty</h3>
                <p className="text-slate-400 mb-6">Try saying "Add 2kg potatoes"</p>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition shadow-lg shadow-blue-500/10"
                >
                    <Plus className="w-4 h-4" /> Add Custom Item
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Custom Item Input Card */}
            <div className="px-2">
                <div className="glass-panel rounded-xl p-4 flex items-center justify-between border border-blue-400/20 hover:opacity-100 opacity-80 transition-opacity">
                    <div className="flex-1 mr-4">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (customItem.trim()) {
                                onAddCustom(customItem);
                                setCustomItem("");
                            }
                        }}
                            className="relative"
                        >
                            <input
                                type="text"
                                value={customItem}
                                onChange={(e) => setCustomItem(e.target.value)}
                                placeholder="Add custom item..."
                                className="w-full bg-transparent border-b border-slate-600 focus:border-blue-400 outline-none text-white placeholder-slate-500 py-2 pl-8 transition-colors"
                            />
                            <Plus className="w-4 h-4 text-slate-500 absolute left-0 top-3" />
                        </form>
                    </div>
                </div>
            </div>

            {/* Ghost Card "Processing" State */}
            {isProcessing && (
                <div className="mb-6 px-2 animate-pulse">
                    <h2 className="text-lg font-semibold text-blue-200/50 flex items-center gap-2 mb-3">
                        <Plus className="w-5 h-5 animate-spin" />
                        Adding item...
                    </h2>
                    <SkeletonCard />
                </div>
            )}

            {categories.map((category) => (
                <div key={category} className="space-y-3">
                    <h2 className="text-lg font-semibold text-blue-200 flex items-center gap-2 px-2">
                        <CategoryIcon category={category} />
                        {category}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(list[category] || {}).map(([key, data]) => (
                            <div
                                key={key}
                                className="group glass-panel rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors border border-transparent hover:border-blue-400/30 relative overflow-hidden"
                            >
                                <div className="flex-1 min-w-0 z-10">
                                    <h3 className="text-lg font-medium text-white truncate">{data.display_name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-blue-400">{data.quantity}</p>
                                        {data.transcript && (
                                            <span className="text-xs text-slate-500 italic max-w-full truncate">
                                                Heard: "{data.transcript}"
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onRemove(key)}
                                    className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                                    aria-label="Remove item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                {/* Subtle background glow for aesthetics */}
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShoppingList;
