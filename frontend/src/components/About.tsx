import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import communityImage from '@/assets/community-hero.jpg';
import HandwrittenNote from './HandwrittenNote';

const Char = ({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-1 lg:mr-2">
      {children}
    </motion.span>
  );
};

const ParagraphReveal = ({ children, className }: { children: string; className?: string }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = children.split(" ");
  return (
    <p ref={container} className={`${className} flex flex-wrap`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        return <Char key={i} progress={scrollYProgress} range={[start, end]}>{word}</Char>;
      })}
    </p>
  );
};

const About = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-[#FDFBF7] overflow-hidden relative">
      <div className="container px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text Content */}
          <div className="relative z-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <HandwrittenNote text="The Sacred Promise" className="text-2xl text-primary/80" />
                <div className="h-px w-12 bg-primary/20"></div>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 text-foreground tracking-tight">
                The Soul of <br />
                <span className="text-primary italic">Global Hope.</span>
              </h2>

              <ParagraphReveal className="soul-text text-xl sm:text-2xl md:text-3xl text-foreground mb-12 max-w-xl">
                Our legacy is written in the heartbeat of Kavitha, Gujarat. We don't just bridge the gap between continents; we weave a thread of humanity that connects hearts in the US to the dreams of rural India. Every meal is a vow, and every school is a temple of tomorrow.
              </ParagraphReveal>

              <div className="flex flex-row gap-6 sm:gap-12 pt-8 border-t border-black/5">
                <div>
                  <p className="text-2xl sm:text-3xl md:text-5xl font-serif font-medium mb-1 text-primary">25k+</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Nutritious Meals</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl md:text-5xl font-serif font-medium mb-1 text-primary">500+</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Educated Students</p>
                </div>
              </div>

              <motion.div
                className="mt-10 md:mt-12"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Link to="/about" className="inline-flex items-center gap-2 text-xl font-medium border-b border-black pb-1 hover:text-primary hover:border-primary transition-colors">
                  Read our full manifesto
                  <ArrowUpRight size={24} />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Image Visual */}
          <div className="relative order-1 lg:order-2">
            <motion.div style={{ y, rotate }} className="relative z-10">
              <div className="relative h-[400px] md:h-[600px] w-full bg-gray-200 rounded-t-[100px] md:rounded-t-[200px] rounded-b-[20px] overflow-hidden shadow-2xl">
                <img
                  src={communityImage}
                  alt="Community gathering for food distribution and education"
                  className="w-full h-full object-cover scale-110"
                  loading="lazy"
                  width={800}
                  height={1000}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 md:-bottom-12 md:-left-12 w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-xl z-20 flex"
              >
                <div className="absolute inset-2 border border-dashed border-primary/30 rounded-full animate-spin-slow" />
                <span className="text-3xl md:text-5xl font-serif text-primary mb-1">8</span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-center">Years of<br />Excellence</span>
              </motion.div>
            </motion.div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/10 rounded-full -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-primary/5 rounded-full -z-20" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
