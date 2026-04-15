import { motion } from 'framer-motion';
import { useMemo } from 'react';

const ImpactMap = () => {
    // Coordinates for abstract map (approximate relative %)
    const LOCATIONS = [
        { id: 'usa', x: 21, y: 32, label: 'USA HQ', sub: 'Fundraising & Strategy' }, // Shifted West & North to USA
        { id: 'ind', x: 68.5, y: 40.5, label: 'Kavitha, India', sub: 'Field Operations' }, // Shifted North to India
        { id: 'uk', x: 47.6, y: 19.5, label: 'London', sub: 'Partner Hub' }, // Shifted North to UK
    ];

    return (
        <div className="relative w-full h-[400px] md:h-[600px] mt-20 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
            {/* Dark Map Background */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat grayscale contrast-125 invert" />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

            {/* Connecting Lines (The Bridge) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="50%" stopColor="#F97316" /> {/* Orange-500 */}
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                </defs>

                {/* Arc: USA -> India */}
                <motion.path
                    d="M 250, 200 Q 500, 50 700, 270" // Adjust these path commands based on viewport - hardcoded for demo, better with responsive calcs
                    // For a responsive implementation, we usually use % in ViewBox which is complex in simple SVG.
                    // Instead, we'll use a simple straight line with CSS transform for the "bridge" metaphor visual.
                    className="hidden"
                />

                {/* Simple Animated Line for Connection */}
                <motion.line
                    x1="21%" y1="32%"
                    x2="68.5%" y2="40.5%"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="10 10"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="opacity-50"
                />
                <motion.line
                    x1="21%" y1="32%"
                    x2="47.6%" y2="19.5%"
                    stroke="url(#lineGrad)"
                    strokeWidth="1"
                    strokeDasharray="5 5"
                    initial={{ strokeDashoffset: 50 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="opacity-30"
                />
            </svg>

            {/* Location Hotspots */}
            {LOCATIONS.map((loc, i) => (
                <div
                    key={loc.id}
                    className="absolute cursor-pointer group hidden md:block"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                >
                    {/* Pulse */}
                    <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-ping opacity-75" />
                    <div className="absolute -inset-8 bg-orange-500/10 rounded-full animate-pulse opacity-50 animation-delay-500" />

                    {/* Dot */}
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.2, type: "spring" }}
                        className="relative w-4 h-4 bg-orange-500 rounded-full border-2 border-black shadow-[0_0_20px_rgba(249,115,22,0.6)] z-20 group-hover:scale-150 transition-transform"
                    />

                    {/* Tooltip Card */}
                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-30 transform origin-top`}>
                        <p className="text-white font-bold text-sm mb-1">{loc.label}</p>
                        <p className="text-white/80 text-xs">{loc.sub}</p>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/80 border-t border-l border-white/10 rotate-45" />
                    </div>
                </div>
            ))}

            {/* Overlay Stats or Info */}
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 max-w-xs">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Global Reach</p>
                <p className="text-white text-sm leading-relaxed">
                    Our model leverages global resources to solve local problems. <br />
                    <span className="text-orange-500">Distance is no longer a barrier to impact.</span>
                </p>
            </div>
        </div>
    );
};

export default ImpactMap;
