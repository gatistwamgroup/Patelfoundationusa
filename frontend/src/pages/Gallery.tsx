import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { Play, ChevronDown } from 'lucide-react';
import { CATEGORIES, GALLERY_ITEMS } from '@/data/gallery';

// Data moved to src/data/gallery.ts for easier editing

// --- COMPONENTS ---

const VideoCard = ({ item }: { item: any }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleHover = () => {
        videoRef.current?.play();
        setIsPlaying(true);
    };

    const handleLeave = () => {
        videoRef.current?.pause();
        setIsPlaying(false);
    };

    return (
        <motion.div
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
            className={`relative group overflow-hidden rounded-3xl bg-black cursor-pointer shadow-xl ${item.size === 'large' ? 'md:col-span-2 md:row-span-2' :
                item.size === 'wide' ? 'md:col-span-2 md:row-span-1' :
                    item.size === 'dead' ? 'md:col-span-1 md:row-span-2' :
                        'md:col-span-1 md:row-span-1'
                }`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            layout
        >
            <video
                ref={videoRef}
                src={item.src}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                loop
                muted
                playsInline
            />
            {/* Subtle Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Play Button Indicator */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 ${isPlaying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <Play className="fill-white text-white ml-1" size={24} />
            </div>

            <div className="absolute bottom-6 left-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1 block drop-shadow-sm">{item.category}</span>
                <h3 className="text-white text-2xl font-serif drop-shadow-md">{item.title}</h3>
            </div>
        </motion.div>
    );
};

const ImageCard = ({ item }: { item: any }) => (
    <motion.div
        className={`relative group overflow-hidden rounded-3xl bg-slate-100 cursor-zoom-in shadow-lg hover:shadow-xl transition-shadow border border-slate-100 ${item.size === 'large' ? 'md:col-span-2 md:row-span-2' :
            item.size === 'wide' ? 'md:col-span-2 md:row-span-1' :
                item.size === 'dead' ? 'md:col-span-1 md:row-span-2' :
                    'md:col-span-1 md:row-span-1'
            }`}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        layout
    >
        <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

        {/* Overlay only on hover for images to keep it clean */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1 block translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{item.category}</span>
            <h3 className="text-white text-2xl font-serif translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h3>
        </div>
    </motion.div>
);

const Gallery = () => {
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredItems = activeFilter === "All"
        ? GALLERY_ITEMS
        : GALLERY_ITEMS.filter(item => item.category === activeFilter);

    // Parallax for Hero
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <main className="w-full bg-[#FAFAF8] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden relative">
            <SEO 
                title="Visual Archives | Moments of Impact in India" 
                description="Experience the visual journey of our work. From rural classrooms in Gujarat to global humanitarian relief, see the faces and stories you support." 
                keywords="NGO Gallery, India Charity Photos, Impact Photography, Rural Development Images, Patel Foundation Archives"
            />
            <Navbar theme="dark" />

            {/* --- 1. HERO: CINEMATIC REEL --- */}
            <section className="relative h-[80vh] overflow-hidden flex items-center justify-center bg-black">
                <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                    <video
                        src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4"
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover brightness-[0.7]"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FAFAF8]/90" />

                <div className="relative z-10 text-center max-w-4xl px-6 pt-20">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                        <Play size={64} className="mx-auto mb-8 text-white/90 border rounded-full p-4 border-white/20 backdrop-blur-md cursor-pointer hover:scale-110 transition-transform hover:bg-white hover:text-black" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-6xl md:text-9xl font-serif tracking-tighter mb-6 text-white text-shadow-lg"
                    >
                        Visual <span className="italic text-white/70">Archives.</span>
                    </motion.h1>
                    <p className="text-xl text-white/90 max-w-xl mx-auto font-light text-shadow-sm">
                        Witness the moments that define us. From the quiet mornings in Kavitha to the loud cheers of our sports leagues.
                    </p>
                </div>
            </section>

            {/* --- 2. THE GALLERY GRID --- */}
            <section className="py-20 px-4 md:px-8 max-w-[1800px] mx-auto min-h-screen">

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-8 py-3 rounded-full border text-sm font-bold uppercase tracking-widest transition-all ${activeFilter === cat
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 transform scale-105'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-orange-200 hover:text-orange-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[300px] gap-6 grid-flow-dense">
                    <AnimatePresence>
                        {filteredItems.map((item, idx) => (
                            item.type === 'video' ? <VideoCard key={idx} item={item} /> : <ImageCard key={idx} item={item} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Load More Trigger */}
                <div className="mt-20 text-center">
                    <button className="group inline-flex items-center gap-3 text-slate-400 hover:text-orange-600 transition-colors">
                        <span className="uppercase tracking-widest text-xs font-bold">Load More from Archives</span>
                        <ChevronDown className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </section>

            <GrandFinale />
        </main>
    );
};

export default Gallery;
