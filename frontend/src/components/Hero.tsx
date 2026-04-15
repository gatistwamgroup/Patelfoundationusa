import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticButton from './MagneticButton';
import TextType from './TextType';

import { MEDIA } from '@/data/media';
import HandwrittenNote from './HandwrittenNote';

const GALLERY_IMAGES = [
  { id: 1, src: "/assets/kavitha.jpg", title: "Kavitha", note: "Where it all began" },
  { id: 2, src: "/assets/study.webp", title: "Education", note: "Knowledge is hope" },
  { id: 3, src: "/assets/p11.jpg", title: "Nutrition", note: "A meal is a promise" },
  { id: 4, src: "/assets/pt5.jpg", title: "Relief", note: "Always there" },
  { id: 5, src: MEDIA.hero.global, title: "Global", note: "One world, one family" },
  { id: 6, src: MEDIA.hero.future, title: "Future", note: "Dreaming together" },
];

const Hero = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative min-h-screen w-full bg-[#FDFBF7] flex flex-col justify-center overflow-hidden pt-32 pb-20">

      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Live Field Metadata - Making it feel 'Alive' */}
      <div className="absolute top-10 right-10 z-30 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 bg-white/50 backdrop-blur-md border border-black/5 px-5 py-2.5 rounded-full shadow-sm cursor-help transition-all hover:bg-white"
        >

        </motion.div>
      </div>

      {/* 1. Centered Premium Typography */}
      <div className="relative z-10 container px-4 mx-auto text-center mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 shadow-sm text-sm font-medium text-primary mb-8 relative overflow-hidden group"
        >
          <Sparkles size={14} className="fill-primary group-hover:animate-pulse" />
          <span className="tracking-widest uppercase text-[10px] font-black">A Sacred Promise Since 2019</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-serif font-medium text-slate-900 leading-none md:leading-[0.9] tracking-tight mb-8"
        >
          Roots in India. <br />
          <span className="italic text-primary">Reach for Humanity.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.01, 1],
          }}
          transition={{
            delay: 0.2,
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-base sm:text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed mb-12 px-4 sm:px-6 grid grid-cols-1 grid-rows-1 items-center"
        >
          {/* Reserved space to prevent layout jumps */}
          <div className="invisible pointer-events-none select-none col-start-1 row-start-1" aria-hidden="true">
            From the rural heart of Kavitha, Gujarat, to a global platform for change. We provide education, daily nutrition, and crisis relief to children.
          </div>
          <div className="col-start-1 row-start-1 self-start">
            <TextType
              text="From the rural heart of Kavitha, Gujarat, to a global platform for change. We provide education, daily nutrition, and crisis relief to children."
              typingSpeed={30}
              showCursor={true}
              cursorCharacter="|"
              loop={false}
              className="inline"
              startOnVisible={true}
              as="span"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton>
            <Link to="/donate" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-full text-base sm:text-lg font-medium hover:bg-primary transition-colors shadow-xl inline-block text-center">
              Start Donating
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link to="/about" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 border border-slate-200 rounded-full text-base sm:text-lg font-medium hover:bg-slate-50 transition-colors inline-block text-center">
              Our Mission
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* 2. Expandable Pill Gallery (Cinematic Mobile Slider / Desktop Pill) */}
      <div className="relative z-10 w-full overflow-hidden px-0 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex gap-4 md:gap-6 justify-start md:justify-center h-[60vh] md:h-[500px] overflow-x-auto md:overflow-visible snap-x snap-mandatory px-6 md:px-4 pb-8 md:pb-0 scrollbar-hide max-w-[1600px] mx-auto w-full"
        >
          {GALLERY_IMAGES.map((img, index) => (
            <motion.div
              key={img.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              layout
              className={`
                relative h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-500 ease-out snap-center shrink-0
                min-w-[85vw] md:min-w-0 md:flex-1
                ${hoveredIndex === index ? 'md:flex-[3]' : ''}
                ${hoveredIndex !== null && hoveredIndex !== index ? 'md:opacity-50 md:grayscale' : 'opacity-100 grayscale-0'}
              `}
            >
              {/* Continuous subtle breathing & panning effect */}
              <motion.div
                className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%]"
                animate={{
                  x: ["0%", "-2%", "2%", "0%"],
                  y: ["0%", "2%", "-2%", "0%"],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 20 + index * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <motion.img
                  whileInView={{ scale: [1.2, 1], filter: ["brightness(1.4)", "brightness(1)"] }}
                  viewport={{ amount: 0.4 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transform md:scale-110 md:hover:scale-100 transition-transform duration-700"
                  loading={index < 2 ? "eager" : "lazy"}
                  width={600}
                  height={800}
                  // @ts-ignore
                  fetchpriority={index === 0 ? "high" : "auto"}
                />
              </motion.div>

              {/* Shadow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

              {/* Label (Visible on Expand/Mobile) */}
              <div className={`absolute bottom-8 left-8 text-white transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}>
                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Impact</p>
                <p className="text-3xl md:text-5xl font-serif font-medium flex items-center gap-3">
                  {img.title}
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-primary"
                  >
                    ❤
                  </motion.span>
                </p>
                <div className="mt-4">
                  <HandwrittenNote text={img.note} className="text-white/80 text-xl" delay={0.2} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Swipe Hint */}
        <div className="absolute top-1/2 right-4 z-20 md:hidden pointer-events-none animate-pulse">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white border border-white/20">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] bg-black/5 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-widest text-slate-500">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-slate-300 to-transparent overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-slate-900"
          />
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;
