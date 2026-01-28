import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { Search, Menu, ShoppingBag, Mic, TrendingUp, Sun, Moon } from 'lucide-react';
import DebugPanel from './components/DebugPanel';
import CartDrawer from './components/CartDrawer';
import ProductCard from './components/ProductCard';
import CartBar from './components/CartBar';
import HeroBanner from './components/HeroBanner';
import VoiceFloatingButton from './components/VoiceFloatingButton';
import { CATALOG, CATEGORIES } from './constants/catalog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SUCCESS_SOUND = "https://actions.google.com/sounds/v1/science_fiction/scifi_laser.ogg";

function App() {
    const [shoppingList, setShoppingList] = useState({});
    const [commandText, setCommandText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI States
    const [drawerState, setDrawerState] = useState({ isOpen: false, mode: 'cart' }); // 'cart' | 'suggestions'
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Tech States
    const [audioStream, setAudioStream] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [apiError, setApiError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Stats Calculations
    const dashboardStats = useMemo(() => {
        let totalItems = 0;
        let estTotal = 0;
        const cartListArray = [];

        Object.values(shoppingList).forEach(items => {
            Object.values(items).forEach(item => {
                const catalogItem = CATALOG.find(c => c.name.toLowerCase() === item.display_name.toLowerCase());
                const price = catalogItem ? catalogItem.price : 100;
                const qtyMatch = item.quantity.match(/\d+/);
                const qty = qtyMatch ? parseInt(qtyMatch[0]) : 1;

                totalItems += 1; // Unique items or total quantity? Using unique items for list length usually
                estTotal += price * qty;

                cartListArray.push({
                    name: item.display_name,
                    display_name: item.display_name,
                    qty: qty,
                    price: price
                });
            });
        });

        return { totalItems, estTotal, cartListArray };
    }, [shoppingList]);


    const playSuccess = () => new Audio(SUCCESS_SOUND).play().catch(() => { });

    useEffect(() => {
        fetchList();
        fetchSuggestions();

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
    }, []);

    const fetchList = async () => axios.get(`${API_URL}/shopping-list`).then(res => setShoppingList(res.data));
    const fetchSuggestions = async () => axios.get(`${API_URL}/suggest`).then(res => setSuggestions(res.data.suggestions || []));

    const sendCommand = async (text) => {
        if (!text.trim()) return;
        setApiResponse(null); setApiError(null); setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/command`, { command: text });
            setApiResponse(res.data);

            if (res.data.status === 'success') {
                playSuccess();
                setShoppingList(res.data.shopping_list);
                toast.success(res.data.message);
                setCommandText('');
                if (res.data.warnings?.length) res.data.warnings.forEach(w => toast.warning(w));
            } else {
                toast.error(res.data.message);
                setApiError(res.data.message);
            }
        } catch (err) {
            setApiError(err.message);
            toast.error("Server Error");
        } finally {
            setLoading(false);
        }
    };

    const toggleRecording = () => isVoiceActive ? stopRecording() : startRecording();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = handleAudioStop;
            mediaRecorderRef.current.start();
            setIsVoiceActive(true);
        } catch (err) { toast.error('Microphone access denied'); }
    };

    const stopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsVoiceActive(false); } };

    const handleAudioStop = async () => {
        if (audioStream) { audioStream.getTracks().forEach(track => track.stop()); setAudioStream(null); }
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData(); formData.append('audio', blob);
        const toastId = toast.loading('Analysing audio...');

        try {
            const res = await axios.post(`${API_URL}/recognize`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.status === 'success') {
                const transcript = res.data.transcript;
                toast.dismiss(toastId);
                setApiResponse({ step: "TRANSCRIPTION", transcript, ...res.data });
                await sendCommand(transcript);
            } else { toast.dismiss(toastId); toast.error('Could not understand audio'); }
        } catch (err) { toast.dismiss(toastId); toast.error('Processing failed'); setApiError(err.message); }
    };

    const getItemQuantity = (itemName) => {
        for (const cat in shoppingList) {
            for (const key in shoppingList[cat]) {
                if (shoppingList[cat][key].display_name.toLowerCase().includes(itemName.toLowerCase())) {
                    const qtyMatch = shoppingList[cat][key].quantity.match(/\d+/);
                    return qtyMatch ? parseInt(qtyMatch[0]) : 1;
                }
            }
        }
        return 0;
    };

    const toggleDrawer = (mode) => setDrawerState({ isOpen: true, mode });
    const closeDrawer = () => setDrawerState(prev => ({ ...prev, isOpen: false }));

    return (
        <div className={`min-h-screen pb-24 md:pb-8 flex flex-col relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>

            {/* Background handled in CSS now (light/dark vars) */}

            {/* --- Header --- */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-4 pb-2 px-4 shadow-sm">
                <div className="max-w-6xl mx-auto space-y-3">

                    {/* Search Bar Row */}
                    <div className="flex items-center gap-3">
                        <form onSubmit={(e) => { e.preventDefault(); sendCommand(commandText); }} className="flex-grow relative">
                            <div className="absolute left-4 top-3 text-slate-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={commandText}
                                onChange={(e) => setCommandText(e.target.value)}
                                placeholder='Search for "Milk"...'
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 ring-orange-500/50 transition-all text-slate-800 dark:text-white"
                            />
                        </form>

                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-orange-500">
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow p-4 md:px-8 max-w-6xl mx-auto w-full space-y-8">

                {/* Promo Banner */}
                <section>
                    <HeroBanner />
                </section>

                {/* Category Filter */}
                <section className="sticky top-[80px] z-30 py-2 -mx-4 px-4 md:mx-0 md:px-0 bg-[#F5F7FA]/95 dark:bg-slate-950/95 backdrop-blur-sm">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeCategory === cat
                                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-orange-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Catalog */}
                <section className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            {activeCategory === "All" ? "Trending Near You" : activeCategory}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {CATALOG
                            .filter(p => activeCategory === "All" || p.category.includes(activeCategory === "Vegetables" ? "Vegetables" : activeCategory))
                            .map(product => {
                                const qty = getItemQuantity(product.name);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        quantity={qty}
                                        onAdd={() => sendCommand(`add 1 ${product.name}`)}
                                        onRemove={() => sendCommand(`remove ${product.name}`)}
                                    />
                                );
                            })}
                    </div>
                </section>
            </main>

            <CartBar
                totalItems={dashboardStats.totalItems}
                totalPrice={dashboardStats.estTotal}
                onClick={() => setDrawerState({ isOpen: true, mode: 'cart' })}
            />

            <VoiceFloatingButton
                isListening={isVoiceActive}
                onClick={toggleRecording}
                audioStream={audioStream}
            />

            <DebugPanel apiResponse={apiResponse} error={apiError} />

            <CartDrawer
                isOpen={drawerState.isOpen}
                onClose={closeDrawer}
                cartItems={dashboardStats.cartListArray}
                totalPrice={dashboardStats.estTotal}
                onAdd={(name) => sendCommand(`add 1 ${name}`)}
                onRemove={(name) => sendCommand(`remove ${name}`)}
            />
        </div>
    );
}

export default App;
