import { motion } from 'framer-motion';
import { ShoppingBag, Zap, Clock, ArrowRight } from 'lucide-react';

const PROMOS = [
    {
        id: 1,
        title: "Fresh Farm Picks",
        subtitle: "Flat 20% Off",
        bg: "bg-green-100",
        text: "text-green-800",
        icon: ShoppingBag,
        accent: "bg-green-500",
        image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 2,
        title: "Midnight Munchies",
        subtitle: "Delivery by 11 PM",
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        icon: Clock,
        accent: "bg-indigo-500",
        image: "https://images.unsplash.com/photo-1513639776629-9be61b9031c6?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 3,
        title: "Super Saver",
        subtitle: "Stock up & Save",
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: Zap,
        accent: "bg-orange-500",
        image: "https://images.unsplash.com/photo-1572584642822-6f8de0243c93?auto=format&fit=crop&q=80&w=600"
    }
];

const HeroBanner = () => {
    return (
        <div className="w-full overflow-hidden py-4">
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-1 snap-x">
                {PROMOS.map((promo, i) => (
                    <motion.div
                        key={promo.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`min-w-[85%] md:min-w-[45%] h-40 rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow snap-center cursor-pointer group`}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img src={promo.image} alt={promo.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                            <div className={`absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent`} />
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-center items-start">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1.5 rounded-lg ${promo.accent} text-white`}>
                                    <promo.icon className="w-4 h-4" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${promo.text}`}>Limited Time</span>
                            </div>

                            <h2 className={`text-2xl font-extrabold ${promo.text} mb-1 leading-tight`}>{promo.title}</h2>
                            <p className={`${promo.text} opacity-90 text-sm font-medium`}>{promo.subtitle}</p>
                        </div>

                        <div className={`absolute bottom-4 right-4 ${promo.accent} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 z-20`}>
                            Shop <ArrowRight className="w-3 h-3" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HeroBanner;
