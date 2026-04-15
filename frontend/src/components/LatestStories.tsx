import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { stories } from '@/data/stories';
import HandwrittenNote from './HandwrittenNote';

const LatestStories = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const recentStories = stories.slice(0, 4);

    // Auto-Play Logic
    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % recentStories.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPlaying, recentStories.length]);



    return (
        <section className="py-12 md:py-32 bg-background overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('/noise.svg')] pointer-events-none" />

            <div className="container px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Left: Cinematic Viewer */}
                    <div className="lg:col-span-7 hidden lg:block">
                        <div
                            className="relative h-[700px] w-full rounded-[2rem] overflow-hidden shadow-2xl group"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    {/* Ken Burns Effect Image */}
                                    <motion.img
                                        src={recentStories[activeIndex].image}
                                        alt={recentStories[activeIndex].title}
                                        className="w-full h-full object-cover"
                                        animate={{ scale: [1.1, 1.2] }}
                                        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
                                    />

                                    {/* Cinematic Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                    {/* Floating Content Card */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="absolute bottom-12 left-12 right-12 translate-z-20"
                                    >
                                        <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl text-white">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                    <span className="text-xs font-mono uppercase tracking-widest opacity-70">
                                                        Live from the field
                                                    </span>
                                                    <HandwrittenNote text="Truly Inspiring" className="text-white/40 text-xs ml-2 hidden md:block" delay={0.5} />
                                                </div>
                                                <span className="text-xs font-mono border border-white/20 px-2 py-1 rounded">
                                                    {recentStories[activeIndex].date}
                                                </span>
                                            </div>

                                            <h3 className="text-3xl md:text-4xl font-serif font-medium leading-tight mb-6">
                                                {recentStories[activeIndex].title}
                                            </h3>

                                            <Link to={`/stories/${recentStories[activeIndex].id}`} className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
                                                Read Entry
                                                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <ArrowRight size={14} />
                                                </span>
                                            </Link>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Elegant Interactive List */}
                    <div className="lg:col-span-5 flex flex-col justify-center pl-0 lg:pl-4">
                        <div className="mb-12 flex justify-between items-end">
                            <div>
                                <div className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-px bg-primary" /> Live Updates
                                </div>
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-foreground tracking-tight">The Field Journal.</h2>
                            </div>
                            {/* Play/Pause Control */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                                aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                        </div>

                        <div className="flex flex-col relative w-full">
                            {recentStories.map((story, index) => (
                                <div
                                    key={story.id}
                                    onMouseEnter={() => {
                                        setActiveIndex(index);
                                        setIsPlaying(false);
                                    }}
                                    onMouseLeave={() => setIsPlaying(true)}
                                    className="group relative cursor-pointer"
                                >
                                    {/* Progress Bar for Active Item */}
                                    {activeIndex === index && isPlaying && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5, ease: "linear" }}
                                            className="absolute bottom-0 left-0 h-[2px] bg-primary z-20"
                                        />
                                    )}

                                    <div className={`p-6 border-l-2 transition-all duration-500 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 lg:gap-0 ${activeIndex === index ? 'border-primary bg-primary/5 pl-8' : 'border-border hover:border-foreground/20 hover:pl-7'}`}>

                                        {/* Mobile Image (Hidden on Desktop) */}
                                        <div className="block lg:hidden w-full h-48 rounded-xl overflow-hidden shadow-sm">
                                            <img
                                                src={story.image}
                                                alt={story.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                loading="lazy"
                                                width={400}
                                                height={300}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold tracking-widest uppercase mb-2 ${activeIndex === index ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    0{index + 1} / {story.category}
                                                </span>
                                                <h3 className={`text-xl font-serif font-medium leading-tight transition-colors ${activeIndex === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {story.title}
                                                </h3>
                                            </div>

                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${activeIndex === index ? 'bg-primary text-white scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-dashed border-gray-200">
                            <Link to="/stories" className="group inline-flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors">
                                View Full Archive
                                <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LatestStories;
