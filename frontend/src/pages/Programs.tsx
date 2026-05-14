import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import MagneticButton from '@/components/MagneticButton';
import { ArrowRight, BookOpen, Heart, Leaf, Wheat, Users, Lightbulb, Globe, ArrowUpRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { MEDIA } from '@/data/media';

const programs = [
    {
        id: '01',
        title: 'Education',
        subtitle: 'Empowering Minds',
        icon: BookOpen,
        image: "/assets/p14.webp",
        description: 'We believe education is the catalyst for global change. Our comprehensive scholarship programs and digital infrastructure projects ensure no child is left behind due to financial constraints.',
        stats: [
            { label: 'Childrens', value: '800+' },
            { label: 'Toppers', value: '100+' },
        ]
    },
    {
        id: '02',
        title: 'Healthcare',
        subtitle: 'Saving Lives',
        icon: Heart,
        image: "/assets/p13.webp",
        description: 'Bringing essential medical services to the most remote corners of the world. From mobile surgical units to specialized eye care camps, we bridge the gap in healthcare accessibility.',
        stats: [
            { label: 'Patients', value: '600+' },
            { label: 'Villages', value: '8' },
        ]
    },
    {
        id: '03',
        title: 'Nutritious Food',
        subtitle: 'Food Security',
        icon: Wheat,
        image: "/assets/p11.webp",
        description: 'Providing access to healthy and nutritious food for vulnerable communities. We establish food banks and nutritional programs to combat hunger and promote well-being.',
        stats: [
            { label: 'Meals Served', value: '10k+' },
            { label: 'Families Help', value: '80+' },
        ]
    },
    {
        id: '04',
        title: 'Empowerment',
        subtitle: 'Skill Development',
        icon: Users,
        image: "/assets/emp.webp",
        description: 'Fostering economic independence and female leadership through microfinance, vocational training, and artisan cooperatives. We help communities build sustainable livelihoods.',
        stats: [
            { label: 'Youth Trained', value: '40+' },
            { label: 'Enterprises', value: '20+' },
        ]
    },
    {
        id: '05',
        title: 'Relief',
        subtitle: 'Crisis Response',
        icon: Globe,
        image: "/assets/relief.webp",
        description: 'Providing rapid, dignified aid during natural disasters. We remain on the ground long after the cameras leave to ensure complete rehabilitation of affected families.',
        stats: [
            { label: 'Aid Distributed', value: '200+' },
            { label: 'Families', value: '100+' },
        ]
    }
];

const Card = ({ i, program, progress, range, targetScale }: { i: number, program: any, progress: MotionValue<number>, range: number[], targetScale: number }) => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start end', 'start start']
    });

    const imageScale = useTransform(scrollYProgress, [0, 1], [1.5, 1]); // Cinematic zoom out
    const scale = useTransform(progress, range, [1, targetScale]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={container} className="min-h-[85vh] md:h-screen flex items-center justify-center md:sticky md:top-0 snap-center py-4 md:py-0">
            <motion.div
                style={{ scale: isMobile ? 1 : scale, top: isMobile ? 0 : `calc(-5% + ${i * 25}px)` }}
                className="relative flex flex-col md:flex-row h-auto md:h-[600px] w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-black/5 bg-[#FDFBF7] shadow-xl md:shadow-2xl origin-top"
            >
                {/* 1. Left Content Section */}
                <div className="w-full md:w-5/12 p-6 md:p-16 flex flex-col justify-between relative z-20 bg-[#FDFBF7] order-2 md:order-1">
                    <div>
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                            <span className="text-4xl md:text-6xl font-serif text-slate-200 font-bold">{program.id}</span>
                            <div className="h-px bg-slate-200 flex-1" />
                            <div className="p-2 md:p-3 bg-primary/10 rounded-full text-primary">
                                <program.icon size={20} />
                            </div>
                        </div>

                        <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary mb-2">{program.subtitle}</h3>
                        <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 md:mb-6 leading-tight">{program.title}</h2>

                        <p className="text-slate-500 leading-relaxed text-base md:text-lg font-light mb-6 md:mb-8">
                            {program.description}
                        </p>

                        <div className="flex gap-8 md:gap-12 border-t border-slate-100 pt-6 md:pt-8">
                            {program.stats.map((stat: any, idx: number) => (
                                <div key={idx}>
                                    <div className="text-xl md:text-2xl font-serif font-medium text-slate-900">{stat.value}</div>
                                    <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 md:pt-0">
                        <Link to="/donate" className="group inline-flex items-center gap-3 text-slate-900 font-medium hover:text-primary transition-colors text-sm md:text-base">
                            <span className="border-b border-black group-hover:border-primary transition-colors pb-0.5">Support {program.title}</span>
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* 2. Right Image Section with Cinematic Reveal */}
                <div className="w-full md:w-7/12 relative h-[250px] md:h-full overflow-hidden order-1 md:order-2">
                    <motion.div style={{ scale: imageScale }} className="w-full h-full">
                        <img
                            src={program.image}
                            alt={program.title}
                            className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
                        />
                    </motion.div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-transparent to-black/20 md:to-transparent" />
                </div>
            </motion.div>
        </div>
    )
}

const Programs = () => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });

    return (
        <main ref={container} className="relative bg-slate-50">
            <SEO 
                title="Our Core Programs | Impact Through Global Giving" 
                description="Explore the Patel Foundation's pillars of impact: Education, Healthcare, Nutrition, and Crisis Relief. Supporting rural India since 2019 with 501(c)(3) funding." 
                keywords="Nonprofit Programs India, Rural Healthcare, Digital Literacy India, Free Meals Program, 501c3 Impact, Humanitarian Aid"
            />
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-[#FDFBF7]">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <span className="inline-block py-1.5 px-4 rounded-full border border-black/10 bg-white text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 shadow-sm">
                        Holistic Impact Strategy
                    </span>
                    <h1 className="text-7xl md:text-9xl font-serif font-medium text-slate-900 mb-8 tracking-tight">
                        Our Pillars
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 font-light leading-relaxed">
                        We don't just put bandaids on problems. We architect ecosystems of change that empower communities to rise on their own terms.
                    </p>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
                >
                    <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
                    <div className="w-px h-12 bg-slate-300 relative overflow-hidden">
                        <motion.div
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-1/2 bg-slate-900"
                        />
                    </div>
                </motion.div>
            </section>

            {/* --- STACKING CARDS SECTION --- */}
            <div className="relative z-10 pb-48 px-4 bg-slate-50">
                {programs.map((program, i) => {
                    const targetScale = 1 - ((programs.length - i) * 0.05);
                    return (
                        <Card
                            key={i}
                            i={i}
                            program={program}
                            progress={scrollYProgress}
                            range={[i * 0.25, 1]}
                            targetScale={targetScale}
                        />
                    )
                })}
            </div>

            {/* --- CTA SECTION --- */}
            <section className="bg-black text-white py-32 text-center relative overflow-hidden">
                <div className="relative z-10 container mx-auto px-4">
                    <h2 className="text-5xl md:text-7xl font-serif mb-8">Ready to act?</h2>
                    <MagneticButton>
                        <Link to="/donate" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full text-xl font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            Make a Donation <ArrowUpRight />
                        </Link>
                    </MagneticButton>
                </div>
                {/* Background Texture */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
            </section>

            <GrandFinale />
        </main>
    );
};

export default Programs;
