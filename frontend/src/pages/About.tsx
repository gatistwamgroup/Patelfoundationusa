import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, animate, useSpring, useMotionValue } from 'framer-motion';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import {
    Globe, ShieldCheck, Users, Target, ChevronDown
} from 'lucide-react';
import { MEDIA } from '@/data/media';
import aboutBg from '@/assets/bg.webp';

// Team member image imports (proper imports so Vite bundles them for production)
import imgJigneshPatel from '@/assets/img/jignesh-patel.webp';
import imgShreyaPatel from '@/assets/img/shreya-patel.webp';
import imgDeepalMacwan from '@/assets/img/deepal-macwan.webp';
import imgHiralMacwan from '@/assets/img/hiral-macwan.webp';
import imgSejalPanchal from '@/assets/img/Sejal-panchal.webp';
import imgParthPatel from '@/assets/img/parth-patel.webp';
import imgKush from '@/assets/img/kush.webp';
import imgMonica from '@/assets/img/monica.webp';
import imgDarshan from '@/assets/img/darshan.webp';

// --- HELPERS ---

const RevealTitle = ({ children, className = "" }: { children: any, className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    return (
        <motion.div
            ref={ref}
            initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)", y: 40 }}
            animate={isInView ? { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", y: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const Counter = ({ from, to, duration = 2 }: { from: number, to: number, duration?: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true, margin: "0px" });

    useEffect(() => {
        if (!inView) return;
        const node = nodeRef.current;
        const controls = animate(from, to, {
            duration,
            onUpdate(value) {
                if (node) node.textContent = Math.round(value).toLocaleString();
            },
            ease: "easeOut"
        });
        return () => controls.stop();
    }, [from, to, duration, inView]);

    return <span ref={nodeRef}>0</span>;
};

const FadeIn = ({ children, delay = 0, className = "" }: { children: any, delay?: number, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// --- DATA ---
const TIMELINE = [
    { year: "2019", title: "Kavitha's Promise", desc: "Our mission began in Kavitha, Gujarat, driven by a vow to educate 500+ children through rural classrooms." },
    { year: "2020", title: "Feeding the Future", desc: "Launched our daily feeding program, which now serves 200+ nutritious, hot meals to the community every day." },
    { year: "2021", title: "Health & Relief", desc: "Providing medical health camps to 100+ villagers and establishing rapid response relief teams." },
    { year: "2022", title: "Joy & Bonding", desc: "Initiated Sunday community picnics to foster bonding, now attended by over 100+ local families." },
    { year: "2023", title: "Youth Development", desc: "Opening of 3 specialized youth activity centers focused on personal growth, creativity, and skills." },
    { year: "2025", title: "Nutrition Kits", desc: "Scaling our impact by distributing 200+ specialized nutrition kits to mothers across the region." },
];

const VALUES = [
    { icon: Target, title: "Joy as a Right", desc: "We believe happiness is a nutrient. Our educational picnics and sports leagues are just as important as our math classes." },
    { icon: Users, title: "Consistency", desc: "Change happens daily. We have served meals every single day for over a decade. We show up when others leave." },
    { icon: Globe, title: "The Bridge", desc: "We connect the resources of the American diaspora with the specific needs of Indian villages. Direct, efficient, and personal." },
    { icon: ShieldCheck, title: "Radical Transparency", desc: "We operate with a 'Glass Box' policy. Donors can see exactly which village, school, and child their money supports." },
];

const TEAM = [
    { name: "Kush Patel", role: "Founder & Chairman", img: imgKush },
    { name: "Monica Patel", role: "Global CEO", img: imgMonica },
    { name: "Darshan Patel", role: "Director", img: imgDarshan },
    { name: "Jignesh Patel", role: "Head of Operations", img: imgJigneshPatel },
    { name: "Shreya Patel", role: "Treasurer", img: imgShreyaPatel },
    { name: "Deepak Macwan", role: "Treasurer", img: imgDeepalMacwan },
    { name: "Hiral Macwan", role: "Treasurer", img: imgHiralMacwan },
    { name: "Sejal Panchal", role: "Treasurer", img: imgSejalPanchal },
    { name: "Parth Patel", role: "Treasurer", img: imgParthPatel },
];

// --- MOUSE MOVEMENT LOGIC ---
const MouseTimeline = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const x = useSpring(0, { damping: 30, stiffness: 200 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const onMouseMove = (e: React.MouseEvent) => {
        if (isMobile || !containerRef.current || !contentRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        const maxScroll = -(contentWidth - containerWidth) - 100;

        const percentage = e.clientX / window.innerWidth;
        x.set(percentage * maxScroll);
    };

    return (
        <section
            ref={containerRef}
            className="py-12 md:py-20 bg-white overflow-x-auto md:overflow-hidden cursor-grab md:cursor-crosshair no-scrollbar touch-pan-x"
            onMouseMove={onMouseMove}
        >
            <div className="container mx-auto px-6 mb-8 md:mb-12 pointer-events-none sticky left-0">
                <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">History</span>
                <h2 className="text-4xl md:text-5xl font-serif mt-4 text-slate-900 leading-tight">
                    The Journey <br /> So Far.
                </h2>
                <p className="text-slate-400 text-xs md:text-sm mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" /> Swipe or move cursor to explore
                </p>
            </div>

            <motion.div
                ref={contentRef}
                style={{ x: isMobile ? 0 : x }}
                className="flex gap-12 md:gap-24 px-6 md:px-20 w-max pb-8"
            >
                {TIMELINE.map((item, i) => (
                    <div key={i} className="w-[85vw] md:w-[500px] shrink-0 border-l-2 border-slate-100 pl-6 md:pl-8 relative py-4 group hover:border-orange-200 transition-colors select-none">
                        <span className="text-6xl md:text-8xl font-serif font-bold text-slate-50 absolute -top-4 -left-4 md:-left-6 z-0 group-hover:text-orange-50 transition-colors">{item.year}</span>
                        <div className="relative z-10 mt-8 md:mt-12">
                            <span className="text-orange-600 font-bold text-lg md:text-xl block mb-2">{item.year}</span>
                            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-slate-900">{item.title}</h3>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </section>
    );
}

const About = () => {
    const { scrollYProgress } = useScroll();

    // Parallax Effects
    const yHeroText = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <main className="w-full bg-[#FAFAF8] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden relative">
            <SEO
                title="Our Story & Mission | US-Based 501(c)(3) Charity"
                description="Discover how the Patel Foundation bridges the US and India to provide education, health, and joy to rural communities. Learn about our 100% transparency model."
                keywords="About Patel Foundation, NGO History, US-India Charity, Kunj Patel, 501c3 Nonprofit Mission, Global Seva"
            />

            <Navbar theme="dark" />

            {/* --- 1. HERO: CINEMATIC IMAGE --- */}
            <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden perspective-1000">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "easeOut" }}
                        src={aboutBg}
                        className="w-full h-full object-cover"
                        alt="Children smiling"
                    />
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                </div>

                <motion.div style={{ opacity: opacityHero }} className="absolute inset-0 z-0 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                        className="w-[800px] h-[800px] border border-white/10 rounded-full opacity-50 border-dashed"
                    />
                </motion.div>

                <motion.div style={{ y: yHeroText }} className="relative z-10 text-center max-w-5xl px-4 md:px-6 mt-10 w-full">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}>
                        <span className="inline-block py-2 px-4 md:px-6 border border-white/20 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8 bg-white/10 backdrop-blur-md shadow-sm text-white text-center break-words max-w-full">
                            Est. 2019 • Kavitha, Gujarat
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-medium leading-[0.9] tracking-tighter mb-6 md:mb-8 text-white"
                    >
                        From a Village <br /> <span className="italic text-white/70">to a Movement.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light text-shadow-sm px-4 md:px-0"
                    >
                        What started with a single meal in Kavitha has grown into a trans-continental force for good, bridging the United States and India.
                    </motion.p>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 text-white/50"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>

            {/* --- 2. THE PHILOSOPHY --- */}
            <section className="py-20 bg-slate-50 relative border-y border-slate-200">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-orange-600 font-bold uppercase tracking-widest text-xs mb-4 block">The Philosophy</span>
                            <RevealTitle className="text-3xl sm:text-5xl md:text-6xl font-serif mb-8 leading-tight text-slate-900">
                                Joy is as vital <br /> <span className="text-slate-400">as Nutrition.</span>
                            </RevealTitle>
                            <FadeIn className="text-xl text-slate-500 space-y-8">
                                <p>
                                    In Kavitha, we discovered a simple truth: You cannot educate a child who is hungry, but you also cannot inspire a child who is sad.
                                </p>
                                <p>
                                    Our model is built on three pillars: <strong>Daily Nutrition</strong> to fuel the body, <strong>Educational Picnics</strong> to spark creativity, and <strong>Relief</strong> to provide safety. We don't just build schools; we build happiness.
                                </p>
                            </FadeIn>
                        </div>
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <motion.div whileHover={{ scale: 0.98 }} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500 mb-1 md:mb-2 flex items-baseline gap-0.5"><Counter from={0} to={200} duration={1.5} /><span>+</span></h3>
                                    <p className="text-slate-400 text-[10px] md:text-sm uppercase tracking-widest leading-tight">Daily Meals</p>
                                </motion.div>
                                <motion.div whileHover={{ scale: 0.98 }} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 md:mt-12 flex flex-col justify-center">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500 mb-1 md:mb-2 flex items-baseline gap-0.5"><Counter from={0} to={100} duration={1} /><span>+</span></h3>
                                    <p className="text-slate-400 text-[10px] md:text-sm uppercase tracking-widest leading-tight">Picnic Families</p>
                                </motion.div>
                                <motion.div whileHover={{ scale: 0.98 }} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500 mb-1 md:mb-2 flex items-baseline gap-0.5"><Counter from={0} to={100} duration={1.5} /><span>+</span></h3>
                                    <p className="text-slate-400 text-[10px] md:text-sm uppercase tracking-widest leading-tight">Patient Care</p>
                                </motion.div>
                                <motion.div whileHover={{ scale: 0.98 }} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 md:mt-12 flex flex-col justify-center">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500 mb-1 md:mb-2">100%</h3>
                                    <p className="text-slate-400 text-[10px] md:text-sm uppercase tracking-widest leading-tight">Graduation</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. THE FOUNDER'S STORY --- */}
            <section className="bg-white text-slate-900 py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Sticky Image (Desktop) */}
                        <div className="hidden lg:block">
                            <div className="sticky top-32 h-[80vh] w-full rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imgKush} className="w-full h-full object-cover" alt="Kush Patel" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                                    <p className="text-white text-3xl font-serif">"We are the architects of our own future."</p>
                                    <p className="text-white/70 mt-4 uppercase tracking-widest text-sm">— Kunj Patel</p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Founder Image */}
                        <div className="lg:hidden mb-8">
                            <div className="relative h-[50vh] w-full rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imgKush} className="w-full h-full object-cover" alt="Kush Patel" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                                    <p className="text-white text-2xl font-serif">"We are the architects of our own future."</p>
                                    <p className="text-white/70 mt-2 uppercase tracking-widest text-xs">— Kunj Patel</p>
                                </div>
                            </div>
                        </div>

                        {/* Scrolling Content */}
                        <div className="space-y-20 py-10">
                            <FadeIn>
                                <span className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4 block">Chapter 01</span>
                                <h2 className="text-5xl font-serif mb-8 text-slate-900">The Roots.</h2>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Kunj Patel grew up in the dusty lanes of Kavitha. He saw brilliance in his peers but watched opportunity fade due to poverty. He vowed that if he ever succeeded, his success would belong to Kavitha first.
                                </p>
                            </FadeIn>
                            <FadeIn>
                                <span className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4 block">Chapter 02</span>
                                <h2 className="text-5xl font-serif mb-8 text-slate-900">The Bridge.</h2>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Success came in the United States, but his heart remained in Gujarat. In 2019, he launched the foundation not as a charity, but as a bridge. A way for the global community to invest directly in the future of rural India.
                                </p>
                            </FadeIn>
                            <FadeIn>
                                <span className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4 block">Chapter 03</span>
                                <h2 className="text-5xl font-serif mb-8 text-slate-900">The Blueprint.</h2>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Today, we do more than feed and educate. We organize picnics to bring joy, we build labs to bring skills, and we offer relief in times of crisis. We are turning Kavitha into a blueprint for the world.
                                </p>
                            </FadeIn>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. OUR DNA --- */}
            <section className="py-20 bg-[#FAFAF8] border-y border-slate-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">Our DNA</span>
                        <h2 className="text-5xl md:text-7xl font-serif mt-4 text-slate-900">How We Think.</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((val, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-orange-100 transition-all duration-300 group"
                            >
                                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <val.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-4 text-slate-900">{val.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 5. TIMELINE (CURSOR PAN) --- */}
            <MouseTimeline />

            {/* --- 6. LEADERSHIP TEAM --- */}
            <section className="py-20 bg-[#FAFAF8] px-6 border-t border-slate-200">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">The Board</span>
                            <h2 className="text-5xl font-serif mt-4 text-slate-900">Minds Behind the Mission.</h2>
                        </div>
                        <button className="px-8 py-3 rounded-full border border-slate-300 font-bold hover:bg-slate-900 hover:text-white transition-colors text-slate-700 bg-white shadow-sm">
                            View Full Organizational Chart
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {TEAM.map((member, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-6 bg-slate-200 relative shadow-md">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-slate-900">{member.name}</h3>
                                <p className="text-orange-600 font-bold text-sm uppercase tracking-widest mt-1 mb-4">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 7. FAQ --- */}
            <section className="py-20 bg-white px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif mb-4 text-slate-900">Common Questions</h2>
                        <p className="text-slate-500">Transparency is our core value. Ask us anything.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "How much of my donation goes to the cause?", a: "100%. We have a separate group of private donors ('The Circle') who cover all our operating costs, including salaries, rent, and marketing. Every penny you give goes directly to the field." },
                            { q: "Is my donation tax-deductible?", a: "Yes. The Patel Foundation is a registered 501(c)(3) non-profit organization in the United States. You will receive a tax receipt instantly via email." },
                            { q: "Where do you operate?", a: "Our roots and primary operations are in Kavitha, Gujarat (India), with expanding projects across rural India. Our fundraising and headquarters are in the United States." },
                            { q: "Can I volunteer?", a: "Absolutely. We encourage supporters to visit Kavitha. We run a 'Global Fellow' program where you can teach, mentor, and serve in the village." }
                        ].map((item, i) => (
                            <details key={i} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:border-orange-200 transition-colors">
                                <summary className="flex justify-between items-center p-6 font-bold text-lg text-slate-800 list-none group-open:text-orange-600 transition-colors">
                                    {item.q}
                                    <span className="bg-slate-50 rounded-full p-2 group-open:bg-orange-50 group-open:rotate-180 transition-all text-slate-400 group-open:text-orange-600">
                                        <ChevronDown size={20} />
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/30">
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <GrandFinale />
        </main>
    );
};

export default About;
