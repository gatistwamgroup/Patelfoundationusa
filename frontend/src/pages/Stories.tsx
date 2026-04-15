import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import GrandFinale from '@/components/GrandFinale';
import { Calendar, ArrowRight, BookOpen, Quote, ArrowUp, Clock } from 'lucide-react';
import { stories } from '@/data/stories';
import { MEDIA } from '@/data/media';

// --- HERO CAROUSEL DATA ---
const HERO_STORIES = [
    {
        id: 1,
        category: "Relief Missions",
        title: "Essentials for Every Door.",
        subtitle: "When disasters strike, we don't wait. Our rapid relief teams deliver essential aid kits — rice, flour, and medicine — directly to families.",
        date: "May 10, 2024",
        image: MEDIA.hero.relief,
    },
    {
        id: 4,
        category: "Health Camps",
        title: "A New Lens on Life.",
        subtitle: "Over 100 villagers received critical medical care and vision screenings this month. For many, it was the first time they felt truly seen and cared for.",
        date: "August 12, 2024",
        image: MEDIA.projects.health,
    },
    {
        id: 8,
        category: "Feeding Programs",
        title: "Feeding the Future.",
        subtitle: "Daily nutritious meals for every student. And every Sunday — our special community picnic that brings over 100+ families together in joy.",
        date: "July 10, 2024",
        image: MEDIA.hero.nutrition,
    },
];

const CATEGORIES = ["All", "Education", "Feeding Programs", "Health Camps", "Community & Joy", "Youth Activities", "Relief Missions", "Nutrition"];

// --- STORY CARD COMPONENT ---
const StoryCard = ({ story, index }: { story: any; index: number }) => (
    <motion.article
        key={story.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: index * 0.08, duration: 0.7, ease: 'easeOut' }}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-100"
    >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {/* Category Badge */}
            <span className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                {story.category}
            </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                <span className="flex items-center gap-1.5">
                    <Calendar size={11} /> {story.date}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5">
                    <Clock size={11} /> 5 min read
                </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-serif font-medium text-slate-900 mb-3 leading-snug group-hover:text-orange-600 transition-colors duration-300">
                <Link to={`/stories/${story.id}`}>{story.title}</Link>
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-slate-500 font-light leading-relaxed line-clamp-3 mb-5 flex-1">
                {story.excerpt}
            </p>

            {/* CTA */}
            <Link
                to={`/stories/${story.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-800 group-hover:text-orange-600 transition-colors duration-300 mt-auto"
            >
                Read Story <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </div>
    </motion.article>
);

// --- FEATURED (LARGE) CARD ---
const FeaturedCard = ({ story }: { story: any }) => (
    <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="group col-span-1 md:col-span-2 lg:col-span-2 flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-100"
    >
        {/* Image */}
        <div className="relative w-full md:w-[55%] aspect-[4/3] md:aspect-auto overflow-hidden bg-slate-100 shrink-0">
            <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            <span className="absolute top-5 left-5 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                {story.category}
            </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-4">
                <span className="flex items-center gap-1.5"><Calendar size={11} /> {story.date}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5"><Clock size={11} /> 7 min read</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-4 leading-tight group-hover:text-orange-600 transition-colors duration-300">
                <Link to={`/stories/${story.id}`}>{story.title}</Link>
            </h3>
            <p className="text-slate-500 font-light leading-relaxed mb-8 text-sm md:text-base">
                {story.excerpt}
            </p>
            <Link
                to={`/stories/${story.id}`}
                className="inline-flex items-center gap-3 px-7 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full self-start hover:bg-orange-600 transition-colors duration-300"
            >
                Read Full Story <ArrowRight size={14} />
            </Link>
        </div>
    </motion.article>
);


// --- QUOTE CARD ---
const QuoteCard = () => (
    <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-8 rounded-2xl flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -top-4 -right-4 opacity-10">
            <Quote size={100} />
        </div>
        <blockquote className="text-xl md:text-2xl font-serif leading-relaxed relative z-10 mb-5 font-medium">
            "When meals arrived every morning, our children's smiles returned. Education followed hunger out the door."
        </blockquote>
        <cite className="not-italic text-orange-100 font-bold text-xs uppercase tracking-widest">
            — A Parent from Kavitha Village
        </cite>
    </div>
);


// --- MAIN PAGE ---
const Stories = () => {
    const [filter, setFilter] = useState('All');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_STORIES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const activeStory = HERO_STORIES[currentIndex];

    const filteredStories = filter === 'All'
        ? stories
        : stories.filter((s) => s.category === filter);

    // Split: first story is featured, rest are grid cards
    const [featuredStory, ...gridStories] = filteredStories;

    return (
        <main className="bg-[#FDFBF7] min-h-screen text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
            <SEO 
                title="Impact Stories | Real Change in Rural India" 
                description="Read the latest updates and personal stories from our programs in Kavitha, Gujarat. See how your US-based donations provide rapid relief, nutrition, and education." 
                keywords="Charity Success Stories, NGO Impact Blog, Rural India News, Patel Foundation Journal, Humanitarian Stories"
            />

            <Navbar theme="dark" />

            {/* ─── 1. HERO SLIDER ─── */}
            <section className="relative h-screen w-full flex items-end overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="popLayout">
                        <motion.img
                            key={activeStory.id}
                            src={activeStory.image}
                            alt={activeStory.title}
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.6 }}
                            className="absolute inset-0 w-full h-full object-cover opacity-75"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />
                </div>

                <div className="relative z-10 w-full container mx-auto px-6 md:px-12 pb-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStory.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                    {activeStory.category}
                                </span>
                                <span className="flex items-center gap-2 text-white/70 text-xs font-medium tracking-widest uppercase">
                                    <Calendar size={12} /> {activeStory.date}
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-medium leading-[0.9] mb-6 text-white tracking-tight">
                                {activeStory.title}
                            </h1>

                            <p className="text-lg md:text-xl text-white/75 max-w-2xl font-light leading-relaxed mb-10">
                                {activeStory.subtitle}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to={`/stories/${activeStory.id}`}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-xs tracking-widest uppercase rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300"
                                >
                                    Read Full Story <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Slide indicators */}
                    <div className="absolute bottom-10 right-6 md:right-12 flex gap-2">
                        {HERO_STORIES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-10 bg-orange-500' : 'w-5 bg-white/30 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 2. THE JOURNAL GRID ─── */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-7xl">

                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8 border-b border-slate-100 pb-10">
                        <div>
                            <span className="text-orange-600 font-bold uppercase tracking-widest text-xs block mb-2">Our Impact Log</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                                Stories That <br className="hidden md:block" />
                                <span className="italic text-slate-400">Matter.</span>
                            </h2>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${filter === cat
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-700 hover:text-slate-900'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Story (First one, full-width) */}
                    {featuredStory && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <FeaturedCard story={featuredStory} />
                            <QuoteCard />
                        </div>
                    )}

                    {/* Regular Cards Grid */}
                    {gridStories.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gridStories.map((story, i) => (
                                <StoryCard key={story.id} story={story} index={i} />
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {filteredStories.length === 0 && (
                        <div className="text-center py-24 text-slate-400">
                            <p className="text-xl font-serif">No stories in this category yet.</p>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-20 pt-12 border-t border-slate-100">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowUp size={14} /> Back to Top
                        </button>
                    </div>

                </div>
            </section>

            {/* ─── 3. NEWSLETTER ─── */}
            <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #ea580c 0%, transparent 60%)' }}
                />
                <div className="container mx-auto px-6 text-center relative z-10 max-w-xl">
                    <BookOpen size={40} className="mx-auto mb-6 text-orange-500" />
                    <h2 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">
                        Stories, straight <br /> to your inbox.
                    </h2>
                    <p className="text-slate-400 mb-10 font-light leading-relaxed">
                        No spam. Just real stories of how your support is changing the world — once a month.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-light text-sm"
                        />
                        <button className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-xs whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            <GrandFinale />
        </main>
    );
};

export default Stories;
