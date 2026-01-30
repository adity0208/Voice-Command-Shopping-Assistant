import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product, quantity, onAdd, onRemove }) => {
    const Icon = product.icon;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="qc-card flex flex-col items-center text-center p-2 md:p-3 relative group h-full"
        >
            {/* Discount Tag */}
            <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-[#2979FF] text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                FAST
            </div>

            {/* Image Area */}
            <div className="w-full aspect-square bg-white rounded-lg mb-2 md:mb-3 flex items-center justify-center relative overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <Icon className="w-10 h-10 md:w-12 md:h-12 text-slate-400" strokeWidth={1.5} />
                )}

                {/* Quantity Badge */}
                {quantity > 0 && (
                    <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#28A745] text-white text-[10px] md:text-xs font-bold flex items-center justify-center shadow-md animate-scale-in z-20">
                        {quantity}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="w-full text-left mb-2 md:mb-3 mt-auto">
                <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{product.name}</h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">{product.unit}</p>
            </div>

            {/* Action Row */}
            <div className="w-full flex items-center justify-between">
                <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">₹{product.price}</div>

                {quantity === 0 ? (
                    <button
                        onClick={onAdd}
                        className="bg-white border border-[#FF6F00] text-[#FF6F00] px-2.5 md:px-3 py-1.5 min-h-[36px] rounded-lg text-[10px] md:text-xs font-bold uppercase hover:bg-[#FF6F00] hover:text-white transition-all shadow-sm"
                    >
                        ADD
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 md:gap-2 bg-[#FF6F00] rounded-lg px-1 py-1 shadow-md shadow-orange-500/30">
                        <button onClick={onRemove} className="p-1.5 md:p-1 min-w-[32px] min-h-[32px] md:min-w-[28px] md:min-h-[28px] hover:bg-orange-600 rounded text-white transition-colors flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[16px] text-center">{quantity}</span>
                        <button onClick={onAdd} className="p-1.5 md:p-1 min-w-[32px] min-h-[32px] md:min-w-[28px] md:min-h-[28px] hover:bg-orange-600 rounded text-white transition-colors flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
