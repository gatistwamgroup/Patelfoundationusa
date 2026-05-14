import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MEDIA } from '@/data/media';

const programs = [
    {
    id: 1,
    title: 'Education',
    category: '',
    description: 'Bridging the gap regarding talent and opportunity through digital literacy.',
    image: "/assets/pt10.webp",
    color: 'from-blue-900 to-blue-800'
  },
  {
    id: 2,
    title: 'Healthcare',
    category: 'Medical Access',
    description: 'Mobile clinics and free health camps for remote villages.',
    image: "/assets/img0002.webp",
    color: 'from-rose-900 to-rose-800'
  },
  {
    id: 3,
    title: 'Nutritious Food',
    category: 'Feeding Programs',
    description: 'Daily feeding initiatives providing healthy, nutritious meals to communities.',
    image: "/assets/img0001.webp",
    color: 'from-amber-900 to-amber-800'
  },
  {
    id: 4,
    title: 'Relief',
    category: 'Emergency',
    description: 'Rapid response teams for disaster aid and local relief.',
    image: "/assets/relief.webp",
    color: 'from-emerald-900 to-emerald-800'
  },
  {
    id: 5,
    title: 'Community Joy',
    category: 'Activities',
    description: 'Sunday picnics and youth activities that build lasting community bonds.',
    image: "/assets/pt2.webp",
    color: 'from-indigo-900 to-indigo-800'
  }
];

const ProgramCard = ({ program }: { program: typeof programs[0] }) => {
  return (
    <div className="relative h-[55vh] w-[85vw] md:h-[600px] md:w-[500px] shrink-0 rounded-[2rem] overflow-hidden group shadow-2xl border border-white/10">
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10" />
      <img
        src={program.image}
        alt={program.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        loading="lazy"
        width={500}
        height={600}
      />

      <div className={`absolute inset-0 bg-gradient-to-t ${program.color} opacity-60 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

      <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-12 text-white transform transition-transform duration-500">
        <span className="text-xs font-bold tracking-widest uppercase mb-4 opacity-80">{program.category}</span>
        <h3 className="text-3xl sm:text-4xl md:text-6xl font-serif font-medium mb-4 leading-none">{program.title}</h3>
        <p className="text-base sm:text-lg text-white/80 line-clamp-3 mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 translate-y-4 group-hover:translate-y-0 transform">
          {program.description}
        </p>

        <Link to="/programs" className="inline-flex items-center gap-4 text-sm font-medium hover:gap-6 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
            <ArrowRight size={20} />
          </div>
          <span>Explore Initiative</span>
        </Link>
      </div>
    </div>
  );
};

const Programs = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Adjust scroll mechanics - Reduced range to prevent over-scrolling into empty space
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] md:h-[400vh] bg-[#FDFBF7]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

        {/* Horizontal Scroll Area */}
        <div className="w-full flex items-center pl-4 md:pl-6 pt-0 h-full">
          <motion.div style={{ x }} className="relative flex items-center gap-4 md:gap-6 w-max">

            {/* Intro Card / Title */}
            <div className="w-[85vw] md:w-[30vw] shrink-0 pr-4 md:pr-8 flex flex-col justify-center">
              <span className="block text-xs font-bold tracking-widest uppercase text-primary mb-6 pl-1">01 — Our Impact</span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-medium text-black leading-[0.9] mb-6 tracking-tighter">
                Architects <br /><span className="text-black/20 italic">of Change.</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 font-light leading-relaxed max-w-xl pl-1 border-l-2 border-slate-200 ml-2 py-2">
                Our programmatic approach is holistic, targeting the root cause of inequality with precision.
              </p>
            </div>

            {/* Program Cards */}
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}

            {/* "See All" End Card */}
            <div className="relative h-[450px] w-[85vw] md:h-[600px] md:w-[400px] shrink-0 flex items-center justify-center">
              <Link to="/programs" className="group flex flex-col items-center gap-6 p-12 rounded-full border border-black/10 hover:border-black/30 hover:bg-white transition-all duration-500 aspect-square">
                <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight size={32} />
                </div>
                <span className="text-2xl font-serif font-medium text-center">View All <br /> Initiatives</span>
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Progress Bar - Pinned Bottom */}
        <div className="absolute bottom-12 left-6 right-6 md:left-12 md:right-auto md:w-96 h-[2px] bg-black/5 overflow-hidden">
          <motion.div style={{ scaleX: scrollYProgress, transformOrigin: "0%" }} className="h-full bg-primary" />
        </div>

      </div>
    </section>
  );
};

export default Programs;
