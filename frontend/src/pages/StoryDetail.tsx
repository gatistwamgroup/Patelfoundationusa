import { useParams, Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, Clock, ArrowRight, ArrowUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import GrandFinale from '@/components/GrandFinale';
import { stories } from '@/data/stories';
import NotFound from './NotFound';

// ─── FEATURED STORY (id 99) ────────────────────────────────────────────────
const FEATURED_STORY = {
    id: 99,
    title: "The Girl Who Built a Library",
    category: "Education",
    date: "Feb 10, 2026",
    author: "Sarah Jenkins",
    excerpt: "In a village where girls were forbidden to read, Ananya started a revolution with just one book.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2074",
    content: `
        <p>The first time Ananya held a book, she hid it under her shawl. In her village, nestled deep in the valleys of rural India, education was considered a luxury for boys and a distraction for girls.</p>
        <p>"My father told me that books would give me dangerous ideas," Ananya recalls, sitting in the sun-drenched courtyard that serves as her makeshift classroom. "He was right. They gave me the idea that I could clear the path for others."</p>
        <h3>The First Step</h3>
        <p>It began with a single English dictionary, found in a pile of donations intended for the boys' school. Ananya, then just 14, taught herself to decipher the words by comparing them to old newspapers. Word spread. Other girls, hungry for knowledge, began to gather in secret.</p>
        <blockquote>"Knowledge is the only wealth that cannot be stolen."</blockquote>
        <p>When the Patel Foundation learned of Ananya's initiative, we didn't come in with bulldozers. We came with a question: "What do you need?" The answer was simple: "We need a roof."</p>
        <h3>Building the Dream</h3>
        <p>Today, the 'Ananya Library' stands as a beacon of hope. It houses over 5,000 books and serves as a community hub for 300 girls. It is entirely solar-powered, connected to the internet, and managed by the girls themselves.</p>
        <p>Ananya is now studying law on a full scholarship. "This library is not just a building," she says. "It is a fortress. Inside these walls, we are scientists, poets, and leaders."</p>
    `
};

// ─── MAIN ROUTE WRAPPER ───────────────────────────────────────────────────
const StoryDetail = () => {
    const { id } = useParams();

    if (id === '99') return <RenderStoryDetail story={FEATURED_STORY} />;

    const story = stories.find((s) => s.id === Number(id));
    if (!story) return <NotFound />;
    return <RenderStoryDetail story={story} />;
};

// ─── RENDER COMPONENT ────────────────────────────────────────────────────
const RenderStoryDetail = ({ story }: { story: any }) => {
    const { scrollYProgress } = useScroll();
    const relatedStories = stories.filter((s) => s.id !== story.id).slice(0, 3);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: story.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <main className="bg-[#FDFBF7] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 min-h-screen">
            <SEO title={`${story.title} | Patel Foundation Journal`} description={story.excerpt} />

            {/* Reading Progress Bar */}
            <motion.div
                style={{ scaleX: scrollYProgress }}
                className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-orange-700 origin-left z-[60] rounded-r-full"
            />

            <Navbar theme="light" />

            {/* ─── HERO BANNER ─── */}
            <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-slate-900">
                <motion.img
                    src={story.image}
                    alt={story.title}
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                {/* Hero Text */}
                <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-6 md:px-12 pb-12 md:pb-16">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            to="/stories"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors group mb-6"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            Back to Stories
                        </Link>
                    </motion.div>

                    {/* Category + Date */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                            {story.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-white/60 text-xs uppercase tracking-widest font-medium">
                            <Calendar size={11} /> {story.date}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-white leading-tight max-w-4xl"
                    >
                        {story.title}
                    </motion.h1>
                </div>
            </section>

            {/* ─── ARTICLE ─── */}
            <article className="container mx-auto px-6 max-w-3xl py-16">

                {/* Excerpt / Lead */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl md:text-2xl text-slate-500 font-serif italic leading-relaxed mb-10 border-l-4 border-orange-500 pl-6"
                >
                    {story.excerpt}
                </motion.p>

                {/* Author + Meta Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between py-5 mb-12 border-t border-b border-slate-100"
                >
                    <div className="flex items-center gap-4">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(story.author)}&background=ea580c&color=ffffff&bold=true&size=80`}
                            alt={story.author}
                            className="w-11 h-11 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{story.author}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Patel Foundation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                            <Clock size={13} /> 5 min read
                        </span>
                        <div className="w-px h-5 bg-slate-200" />
                        <button
                            onClick={handleShare}
                            aria-label="Share this story"
                            className="p-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <Share2 size={16} />
                        </button>
                    </div>
                </motion.div>

                {/* ─── ARTICLE BODY ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="
                        prose prose-lg prose-slate max-w-none
                        prose-headings:font-serif prose-headings:font-medium prose-headings:text-slate-900 prose-headings:mt-10 prose-headings:mb-4
                        prose-p:text-slate-600 prose-p:leading-[1.9] prose-p:mb-6
                        prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-500 prose-blockquote:text-xl prose-blockquote:font-serif prose-blockquote:not-italic
                        prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                        prose-strong:text-slate-800
                        first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-orange-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none
                    "
                >
                    <div dangerouslySetInnerHTML={{ __html: story.content }} />
                </motion.div>

                {/* ─── TAGS ─── */}
                <div className="flex flex-wrap gap-2 mt-14 pt-8 border-t border-slate-100">
                    {[story.category, 'Patel Foundation', 'Impact', 'Community'].map((tag) => (
                        <span
                            key={tag}
                            className="px-4 py-2 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full cursor-default transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* ─── SCROLL TO TOP ─── */}
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors"
                    >
                        <ArrowUp size={13} /> Back to Top
                    </button>
                </div>

            </article>

            {/* ─── READ NEXT ─── */}
            {relatedStories.length > 0 && (
                <section className="bg-white border-t border-slate-100 py-20">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-orange-600 text-xs font-bold uppercase tracking-widest block mb-2">Continue Reading</span>
                                <h3 className="text-3xl md:text-4xl font-serif font-medium text-slate-900">More Stories</h3>
                            </div>
                            <Link
                                to="/stories"
                                className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors"
                            >
                                View All <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {relatedStories.map((s, i) => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link to={`/stories/${s.id}`} className="group block">
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-slate-100">
                                            <img
                                                src={s.image}
                                                alt={s.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        <span className="text-orange-600 text-[10px] font-bold uppercase tracking-widest block mb-2">
                                            {s.category}
                                        </span>
                                        <h4 className="text-lg font-serif font-medium text-slate-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                                            {s.title}
                                        </h4>
                                        <p className="text-sm text-slate-400 mt-2 line-clamp-2 font-light">{s.excerpt}</p>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-12 md:hidden">
                            <Link
                                to="/stories"
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors"
                            >
                                View All Stories <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <GrandFinale />
        </main>
    );
};

export default StoryDetail;
