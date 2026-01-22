import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product, quantity, onAdd, onRemove }) => {
    const Icon = product.icon;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="qc-card flex flex-col items-center text-center p-3 relative group h-full"
        >
            {/* Discount Tag */}
            <div className="absolute top-2 left-2 bg-[#2979FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                FAST
            </div>

            {/* Image Area */}
            <div className="w-full aspect-square bg-white rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <Icon className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                )}

                {/* Quantity Badge */}
                {quantity > 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#28A745] text-white text-xs font-bold flex items-center justify-center shadow-md animate-scale-in z-20">
                        {quantity}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="w-full text-left mb-3 mt-auto">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{product.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{product.unit}</p>
            </div>

            {/* Action Row */}
            <div className="w-full flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900 dark:text-white">₹{product.price}</div>

                {quantity === 0 ? (
                    <button
                        onClick={onAdd}
                        className="bg-white border border-[#FF6F00] text-[#FF6F00] px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-[#FF6F00] hover:text-white transition-all shadow-sm"
                    >
                        ADD
                    </button>
                ) : (
                    <div className="flex items-center gap-2 bg-[#FF6F00] rounded-lg px-1 py-1 shadow-md shadow-orange-500/30">
                        <button onClick={onRemove} className="p-1 hover:bg-orange-600 rounded text-white transition-colors">
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[12px]">{quantity}</span>
                        <button onClick={onAdd} className="p-1 hover:bg-orange-600 rounded text-white transition-colors">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
