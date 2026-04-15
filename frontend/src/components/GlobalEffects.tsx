import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const GlobalEffects = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, []);

    return (
        <>
            {/* Global Noise Texture - Reduced opacity for performance */}
            <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] before:content-[''] before:absolute before:inset-0 before:bg-[url('/noise.svg')] before:animate-noise" />

            {/* "The Aura" - Optimized: Reduced blur and opacity for GPU efficiency */}
            <motion.div
                className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full pointer-events-none z-0 blur-[60px] will-change-transform"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />

            {/* Simple Cursor Follower - Restored original look with hardware acceleration */}
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 rounded-full bg-black/80 pointer-events-none z-[9999] hidden lg:block backdrop-invert grayscale will-change-transform"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            />
        </>
    );
};

export default GlobalEffects;

