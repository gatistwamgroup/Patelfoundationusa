import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const impactMessages = [
    "Educating 500+ children through our classrooms.",
    "Daily feeding program serving 200+ nutritious meals.",
    "Sunday picnics bring joy and community bonding to 100+ families.",
    "Youth activities centers now open in 3 new locations.",
    "Emergency relief teams deployed to support disaster-hit regions.",
    "Free health camps provided medical care to 100+ villagers this month.",
    "Nutrition kits distributed to expecting mothers across Kavitha."
];

const ImpactHeartbeat = () => {
    const { pathname } = useLocation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showTimeout = setTimeout(() => setIsVisible(true), 5000);

        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % impactMessages.length);
                setIsVisible(true);
            }, 1000);
        }, 20000);

        return () => {
            clearTimeout(showTimeout);
            clearInterval(interval);
        };
    }, []);

    // Never render on the donate page (checked after all hooks)
    if (pathname === '/donate') return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: -50, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
                    className="fixed bottom-24 left-6 z-[100] hidden md:block"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-xs group transition-all hover:bg-white">
                        <div className="p-2 bg-primary/10 rounded-full text-primary animate-pulse">
                            <Heart size={16} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Pulse of Impact</p>
                            <p className="text-xs text-slate-900 leading-relaxed font-serif">
                                {impactMessages[currentIndex]}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-slate-300 hover:text-slate-900 transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImpactHeartbeat;
