import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    const scrollToTop = () => {
        // Try to use Lenis if available globally, otherwise fallback to native
        if (window.lenis) {
            window.lenis.scrollTo(0, { duration: 1.5 });
        } else {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };
    
    // 1. Reset scroll position on route change
    useEffect(() => {
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    // 2. Show/Hide button based on scroll position
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-white text-black rounded-full shadow-2xl flex items-center justify-center border border-black/10 hover:bg-black hover:text-white transition-colors duration-300 group"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />

                    {/* Ripple Effect Ring */}
                    <span className="absolute inset-0 rounded-full border border-black/10 animate-ping opacity-75 group-hover:border-white/30" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
