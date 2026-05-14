import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, Heart, ArrowRight } from 'lucide-react';
import { MEDIA } from '@/data/media';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Our Work', href: '/programs' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Stories', href: '/stories' },
  { name: 'Events', href: '/event' },
  { name: 'Get Involved', href: '/get-involved' },
  { name: 'Contact', href: '/contact' },
];

interface NavbarProps {
  theme?: 'light' | 'dark';
}

const Navbar = ({ theme = 'light' }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > 100 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    setScrolled(latest > 20);
  });

  return (
    <>
      {/* 
                Floating Island Navbar 
                - Centered max-width container
                - Fixed at top
                - Glassmorphism
            */}
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-150%", opacity: 0 }
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className={`
                    pointer-events-auto
                    relative flex items-center justify-between
                    transition-all duration-500 ease-out
                    w-full max-w-7xl
                    md:shadow-sm md:rounded-full md:border
                    ${scrolled
            ? 'py-2 md:py-3 px-0 md:px-6 bg-transparent md:bg-white/80 md:backdrop-blur-2xl md:border-white/40' // Mobile: Transparent, Desktop: White Pill
            : theme === 'dark'
              ? 'py-4 md:py-5 px-0 md:px-8 bg-transparent md:bg-black/10 md:backdrop-blur-xl md:border-white/10'
              : 'py-4 md:py-5 px-0 md:px-8 bg-transparent md:bg-white/60 md:backdrop-blur-2xl md:border-white/30'
          }
                `}>

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 group" aria-label="Patel Foundation homepage">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
              <img
                src={MEDIA.brand.logo}
                alt="Patel Foundation"
                className="w-12 h-12 md:w-14 md:h-14 object-contain relative z-10 transition-transform duration-500 will-change-transform group-hover:scale-110"
              />
            </div>

            <span className={`block text-lg md:text-2xl font-serif font-medium leading-none tracking-tight transition-colors duration-300 ${!scrolled && theme === 'dark' ? 'text-white group-hover:text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
              Patel Foundation
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border transition-colors duration-300 ${!scrolled && theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-slate-100/50 border-slate-200/50'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`
                                    relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                                    ${location.pathname === link.href
                    ? 'bg-white text-slate-900 shadow-sm'
                    : !scrolled && theme === 'dark'
                      ? 'text-gray-200 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }
                                `}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/donate"
              className={`
                                hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                                ${scrolled
                  ? 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30'
                  : theme === 'dark'
                    ? 'bg-white text-slate-900 hover:bg-primary hover:text-white hover:shadow-xl'
                    : 'bg-slate-900 text-white hover:bg-primary hover:shadow-xl'
                }
                            `}
            >
              <span>Donate</span>
              <Heart size={14} className="fill-current animate-pulse" />
            </Link>

            <button
              className={`
                md:hidden w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg border backdrop-blur-md
                ${scrolled
                  ? 'bg-white/80 border-slate-200 text-black hover:bg-white'
                  : theme === 'dark'
                    ? 'bg-black/20 border-white/10 text-white hover:bg-black/40' // Dark theme (Hero) -> Light glass button
                    : 'bg-white/80 border-white/40 text-black hover:bg-white' // Light theme -> White glass button
                }
              `}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle mobile menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay - Premium Cinematic */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[999] bg-[#020202] text-white flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-30" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

            {/* Background Noise */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-8 pt-10">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-14 h-14 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white text-white hover:text-black transition-all duration-300 backdrop-blur-md group"
                aria-label="Close menu"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 flex flex-col justify-start px-6 relative z-10 overflow-y-auto py-4">
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                  hidden: {}
                }}
                className="flex flex-col gap-2"
              >
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
                    }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3 py-2"
                    >
                      <span className="text-xs font-mono text-white/30 w-6 block group-hover:text-primary transition-colors">0{i + 1}</span>
                      <span className="text-4xl sm:text-5xl font-serif font-light text-white group-hover:text-primary group-hover:translate-x-4 transition-all duration-300 tracking-tight leading-none">
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer CTA */}
            <div className="p-8 pb-10 relative z-10 border-t border-white/5 bg-white/5 backdrop-blur-lg">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <p className="text-white/40 text-xs font-mono uppercase tracking-widest max-w-[200px] leading-relaxed">
                    Building a legacy of <br /> compassion & change.
                  </p>
                  <div className="flex gap-4">
                    {/* Social Icons could go here */}
                  </div>
                </div>

                <Link
                  to="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex justify-between items-center px-8 py-6 bg-white text-black rounded-full text-lg font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 duration-300"
                >
                  <span>Donate Now</span>
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                    <ArrowRight size={18} className="-rotate-45" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

