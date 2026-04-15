import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Exact Colors from the Patel Foundation logo (Clockwise starting from Top Yellow)
const logoColors = [
    "#FFED00", // Yellow
    "#E31E24", // Red
    "#9F3E97", // Purple
    "#662D91", // Deep Purple/Indigo
    "#3D5BA9", // Blue
    "#009CA6", // Teal
    "#8DC63F", // Lime Green
    "#C4D600", // Chartreuse/Light Lime
];

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setExit(true);
        }, 3200);

        const timer2 = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ y: 0 }}
            animate={exit ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white text-black overflow-hidden"
        >
            <div className={`flex flex-col items-center justify-center relative z-10 scale-125 md:scale-150 transition-opacity duration-500 ${exit ? 'opacity-0' : 'opacity-100'}`}>

                {/* 1. The "Human Circle" Logo Animation */}
                <div className="relative w-40 h-40 mb-10">
                    <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
                        <g transform="translate(60,60)">
                            {logoColors.map((color, i) => (
                                <motion.g
                                    key={i}
                                    transform={`rotate(${i * 45})`} // 360deg / 8 people = 45deg
                                >
                                    {/* The "Human" Figure */}

                                    {/* Body/Arms: Arch shape */}
                                    <motion.path
                                        d="M -16 -28 C -8 -38 8 -38 16 -28 C 20 -20 10 -5 0 -5 C -10 -5 -20 -20 -16 -28 Z"
                                        fill={color}
                                        initial={{ scale: 0, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: i * 0.1, ease: "backOut" }}
                                    />

                                    {/* Head: Circle sitting on shoulders */}
                                    <motion.circle
                                        cx="0" cy="-42" r="7.5"
                                        fill={color}
                                        initial={{ scale: 0, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: i * 0.1 + 0.05, ease: "backOut" }}
                                    />
                                </motion.g>
                            ))}
                        </g>
                    </svg>
                </div>

                {/* 2. Text Reveal */}
                <div className="text-center overflow-hidden flex flex-col items-center">
                    <div className="overflow-hidden mb-1">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: "0%" }}
                            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 1.5 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight text-[#333333] uppercase leading-tight"
                        >
                            Patel
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: "0%" }}
                            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 1.7 }}
                            className="text-2xl md:text-3xl font-semibold tracking-[0.3em] text-[#333333] uppercase"
                        >
                            Foundation
                        </motion.h1>
                    </div>
                </div>
            </div>

            {/* Subtle Grain Overlay for Premium Texture */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.04 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-[url('/noise.svg')] pointer-events-none"
            />
        </motion.div>
    );
};

export default Preloader;
