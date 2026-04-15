import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HandwrittenNote from './HandwrittenNote';

import { MEDIA } from '@/data/media';

const values = [
    {
        id: 1,
        title: "Roots Deep as Earth",
        description: "Born from the red soil of Kavitha. We carry the village spirit in our very soul.",
        image: MEDIA.projects.trees
    },
    {
        id: 2,
        title: "Unstoppable Force",
        description: "We don't just give aid. We ignite potential, creating a wildfire of progress.",
        image: MEDIA.events.reliefWork
    },
    {
        id: 3,
        title: "The Human Thread",
        description: "Connecting a donor in New York to a child in Gujarat. One heart, one pulse.",
        image: MEDIA.hero.global
    },
    {
        id: 4,
        title: "Audacious Hope",
        description: "Dreaming big isn't enough. We build the schools, the clinics, the future.",
        image: MEDIA.hero.future
    },
    {
        id: 5,
        title: "Legacy of Light",
        description: "Every act of kindness casts a shadow that stretches into eternity.",
        image: MEDIA.projects.vidya
    }
];

const Manifesto = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section
            ref={containerRef}
            className="relative bg-black w-full z-20"
            style={{ height: `${values.length * 100}vh` }}
        >
            {/* 1. Fixed Pinned Background / Visual Portal */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Noise & Global Gradient Overlays */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.08] pointer-events-none mix-blend-overlay z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10" />

                {/* The Cinematic "Portal" */}
                {values.map((item, index) => {
                    const start = index / values.length;
                    const end = (index + 1) / values.length;

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const scale = useTransform(scrollYProgress, [start, end], [1.15, 1.05]);
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const blur = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], ["15px", "0px", "0px", "15px"]);

                    return (
                        <motion.div
                            key={item.id}
                            style={{ opacity, scale, filter: blur }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover grayscale-[40%]"
                            />
                            {/* Deep darkening for text readability - Vignette effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
                            <div className="absolute inset-0 bg-black/30" />
                        </motion.div>
                    );
                })}

                {/* 2. Top-left "Our DNA" label - Always Pinned */}
                <div className="absolute top-16 left-16 z-30 hidden md:block">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6"
                    >
                        <HandwrittenNote text="Our DNA" className="text-2xl text-primary/40" />
                        <div className="h-[1px] w-24 bg-primary/10" />
                    </motion.div>
                </div>

                {/* 3. The Content Overlay - Pinned & Changing */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none px-6">
                    <div className="container mx-auto">
                        <div className="max-w-5xl mx-auto relative h-[600px]">
                            {values.map((item, index) => {
                                const start = index / values.length;
                                const end = (index + 1) / values.length;

                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const y = useTransform(scrollYProgress, [start, start + 0.08, end - 0.08, end], [80, 0, 0, -80]);
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const opacity = useTransform(scrollYProgress, [start, start + 0.08, end - 0.08, end], [0, 1, 1, 0]);
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const scaleText = useTransform(scrollYProgress, [start, start + 0.08, end - 0.08, end], [0.95, 1, 1, 0.95]);

                                return (
                                    <motion.div
                                        key={`text-${item.id}`}
                                        style={{ y, opacity, scale: scaleText }}
                                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                                    >
                                        <div className="mb-8 flex flex-col items-center gap-2">
                                            <span className="text-primary font-mono text-xs tracking-[0.8em] opacity-60">PROMISE</span>
                                            <span className="text-white font-mono text-4xl opacity-10">0{index + 1}</span>
                                        </div>
                                        <h2 className="text-6xl md:text-9xl lg:text-[11rem] font-serif text-white leading-[0.85] tracking-tighter mb-10">
                                            {item.title}
                                        </h2>
                                        <p className="soul-text text-white/50 text-xl md:text-3xl max-w-3xl leading-relaxed font-light">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>


            </div>


        </section>
    );
};

export default Manifesto;
