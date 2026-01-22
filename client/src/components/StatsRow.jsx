import { motion } from 'framer-motion';
import { List, DollarSign, ShoppingBag } from 'lucide-react';
import useMouseTilt from '../hooks/useMouseTilt';
import { useMemo } from 'react';

// Simple Mock Price DB (reused logic for display)
const ITEM_PRICES = {
    "milk": 60, "bread": 40, "eggs": 10, "apple": 120, "onion": 30, "tomato": 40,
    "potato": 25, "sugar": 45, "rice": 80, "flour": 50, "butter": 250, "cheese": 150
};

const Card = ({ title, value, icon: Icon, colorClass, delay = 0 }) => {
    // Each card gets its own independent tilt for a "school of fish" feeling
    const { rotateX, rotateY, shadow } = useMouseTilt({ maxRotation: 8, stiffness: 200, damping: 20 });

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                boxShadow: shadow,
                transformStyle: "preserve-3d"
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group border border-white/5 bg-white/5"
        >
            {/* Specular Highlight Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 relative z-10">{title}</span>
            <span className="text-2xl font-bold text-white flex items-center gap-2 relative z-10">
                <Icon className={`w-5 h-5 \${colorClass}`} /> {value}
            </span>
        </motion.div>
    );
};

const StatsRow = ({ shoppingList }) => {

    const stats = useMemo(() => {
        let totalItems = 0;
        let estTotal = 0;
        const categoryCounts = {};

        Object.entries(shoppingList).forEach(([cat, items]) => {
            const itemCount = Object.keys(items).length;
            totalItems += itemCount;
            categoryCounts[cat] = itemCount;

            Object.values(items).forEach(item => {
                const nameLower = item.display_name.toLowerCase();
                const price = ITEM_PRICES[Object.keys(ITEM_PRICES).find(k => nameLower.includes(k))] || 100;
                const qtyMatch = item.quantity.match(/\d+/);
                const qty = qtyMatch ? parseInt(qtyMatch[0]) : 1;
                estTotal += price * qty;
            });
        });

        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        return { totalItems, estTotal, topCategory };
    }, [shoppingList]);

    return (
        <div className="grid grid-cols-3 gap-4 mb-8 perspective-1000">
            <Card
                title="Pending"
                value={stats.totalItems}
                icon={List}
                colorClass="text-violet-400"
                delay={0}
            />
            <Card
                title="Est. Total"
                value={`₹\${stats.estTotal}`}
                icon={DollarSign}
                colorClass="text-emerald-400"
                delay={0.1}
            />
            <div className="hidden md:block">
                <Card
                    title="Top Category"
                    value={stats.topCategory}
                    icon={ShoppingBag}
                    colorClass="text-pink-400"
                    delay={0.2}
                />
            </div>
        </div>
    );
};

export default StatsRow;
