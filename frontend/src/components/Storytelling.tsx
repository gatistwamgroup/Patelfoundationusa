/**
 * Storytelling.tsx
 * GSAP Pinned Image Mask Reveal on Scroll - Scrubbed Version
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/data/media';

gsap.registerPlugin(ScrollTrigger);

const stories = [
  {
    year: '2019',
    chapter: 'Chapter I',
    title: 'The Sacred\nPromise',
    description:
      'A vow was made in Kavitha, Gujarat — that no child born here would go hungry or unschooled. Kunj Patel planted a seed that would reshape a generation.',
    image: MEDIA.hero.kavitha,
    color: '#e07b39',
  },
  {
    year: '2020',
    chapter: 'Chapter II',
    title: 'The First\nSchool',
    description:
      'A year after the promise, bricks were laid and digital infrastructure was established. We started with 42 children. Now hundreds follow.',
    image: MEDIA.projects.trees,
    color: '#4a9d8f',
  },
  {
    year: '2021',
    chapter: 'Chapter III',
    title: 'Health Comes\nHome',
    description:
      'Mobile clinics reached remote hamlets where a doctor had never set foot. We brought medicine. We brought dignity. We brought hope during a global crisis.',
    image: MEDIA.events.reliefWork,
    color: '#7b5ea7',
  },
  {
    year: '2022',
    chapter: 'Chapter IV',
    title: 'One World,\nOne Family',
    description:
      'Borders dissolved. Partnerships formed across continents. A child in Kavitha now stood connected to a world that believed in her.',
    image: MEDIA.hero.global,
    color: '#2d7dd2',
  },
  {
    year: '2024',
    chapter: 'Chapter V',
    title: 'The Future\nBright',
    description:
      "A digital learning platform launches. The next generation of Kavitha's children step into a borderless future — powered by knowledge, driven by love.",
    image: MEDIA.hero.future,
    color: '#c0392b',
  },
];

const N = stories.length;

export default function Storytelling() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const images = imageRefs.current;
      const cards = cardRefs.current;

      // Ensure elements exist
      if (!images.length || !cards.length) return;

      // Initial setup
      images.forEach((img, i) => {
        gsap.set(img, {
          clipPath: i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
          zIndex: i,
        });
      });

      cards.forEach((card, i) => {
        gsap.set(card, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 60 });
      });

      // Create main scrub timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${window.innerHeight * N}`, 
          pin: true,
          scrub: 1, // Smooth scrub
          onUpdate(self) {
            // Update progress bar
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: self.progress });
            }
            
            // Calculate active index based on progress
            const newIdx = Math.min(Math.floor(self.progress * N), N - 1);
            if (newIdx !== activeIdx) {
              setActiveIdx(newIdx);
            }
          }
        }
      });

      // Build animations
      stories.forEach((_, i) => {
        if (i === 0) return;
        
        // Add a delay/pause before the transition to keep text visible for a bit
        tl.to({}, { duration: 0.5 }); 
        
        // The transition block
        const startLabel = `trans_${i}`;
        tl.addLabel(startLabel);

        // Clip path reveal from bottom to top
        tl.to(images[i], {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          ease: 'power2.inOut'
        }, startLabel);
        
        // Old card fades up and out
        tl.to(cards[i - 1], {
          opacity: 0,
          y: -40,
          duration: 0.5,
          ease: 'power2.inOut'
        }, startLabel);
        
        // New card fades up and in
        tl.to(cards[i], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        }, `${startLabel}+=0.5`); // delay slightly relative to out-animation
      });
      
      // End padding so last story stays visible
      tl.to({}, { duration: 0.5 });

    }, sectionRef);

    return () => ctx.revert();
  }, [activeIdx]); // Re-bind if activeIdx dependency implies state-driven changes inside (but not strictly needed as we handle it inside onUpdate)

  const activeStory = stories[activeIdx] || stories[0];

  return (
    <section
        ref={sectionRef}
        className="relative w-full h-screen bg-[#060606] overflow-hidden select-none"
    >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/10 z-50">
            <div
                ref={progressRef}
                className="h-full origin-left transition-colors duration-700"
                style={{ backgroundColor: activeStory.color, transform: 'scaleX(0)' }}
            />
        </div>

        {/* Global Ambient Glow */}
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-colors duration-1000 z-0"
            style={{ backgroundColor: activeStory.color }} 
        />

        <div className="flex h-full w-full max-w-7xl mx-auto items-center">
            
            {/* LEFT TEXT PANEL */}
            <div className="relative w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 z-10 h-full">
                
                <div className="flex items-center gap-3 mb-10 transition-colors duration-700" style={{ color: activeStory.color }}>
                    <div className="w-10 h-px bg-current opacity-50" />
                    <span className="text-[11px] tracking-[0.4em] uppercase font-sans font-bold">
                        {activeStory.chapter}
                    </span>
                </div>

                <div className="relative h-[400px]">
                    {stories.map((s, i) => (
                        <div
                            key={s.year}
                            ref={el => (cardRefs.current[i] = el!)}
                            className="absolute inset-0 flex flex-col justify-start"
                        >
                            <div
                                className="text-[72px] md:text-[96px] font-serif leading-none font-black mb-2 opacity-10 pointer-events-none transition-colors duration-700"
                                style={{ color: s.color }}
                            >
                                {s.year}
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.1] mb-6 whitespace-pre-line tracking-tight">
                                {s.title}
                            </h2>
                            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-sm font-sans font-light">
                                {s.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Dots / Navigation */}
                <div className="absolute bottom-16 left-10 md:left-16 flex items-center gap-8">
                    <div className="flex gap-2">
                        {stories.map((s, i) => (
                            <div
                                key={i}
                                className="h-[4px] rounded-full transition-all duration-500 ease-in-out"
                                style={{
                                    width: activeIdx === i ? 24 : 6,
                                    backgroundColor: activeIdx === i ? s.color : 'rgba(255,255,255,0.2)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT IMAGE PANEL (Minimized & Elegant) */}
            <div className="hidden md:flex relative w-1/2 h-full items-center justify-center p-12 lg:p-16 z-10">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-black/50">
                    {stories.map((s, i) => (
                        <img
                            key={s.year}
                            ref={el => (imageRefs.current[i] = el!)}
                            src={s.image}
                            alt={s.title}
                            className="absolute inset-0 w-full h-full object-cover scale-105"
                            style={{ zIndex: i }}
                        />
                    ))}
                    
                    {/* Inner elegant overlay to darken bottom */}
                    <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    
                    {/* CTA Overlay on the image itself for the last slide */}
                    <div className={`absolute bottom-8 left-8 right-8 z-30 transition-all duration-700 transform ${activeIdx === N - 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                        <Link
                            to="/donate"
                            className="flex items-center justify-between px-6 py-4 rounded-2xl text-white font-sans font-medium tracking-wide border border-white/20 backdrop-blur-md hover:bg-white/10 transition-colors"
                            style={{ backgroundColor: `${stories[N-1].color}80` }}
                        >
                            <span>Join the Journey</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                    </div>
                </div>

                {/* Vertical Ghost Year Watermark slightly offset right */}
                <div 
                    className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 font-serif font-black tracking-tighter transition-all duration-700 z-0 select-none"
                    style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg) translateY(50%)',
                        fontSize: 'min(15vh, 180px)',
                        color: activeStory.color,
                        opacity: 0.15,
                    }}
                >
                    {activeStory.year}
                </div>
            </div>

        </div>
    </section>
  );
}
