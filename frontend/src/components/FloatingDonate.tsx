/**
 * FloatingDonate.tsx
 * Premium floating CTA "Donate" button — fixed bottom-right,
 * appears on scroll, pulses gently, matches warm gold aesthetic.
 */
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const FloatingDonate = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > 500);
  });

  // Hide on event registration and contact pages as requested
  const excludedPaths = ['/event', '/contact'];
  if (excludedPaths.includes(location.pathname)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 30 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-24 right-8 z-[99]"
        >
          <Link
            to="/donate"
            className="group relative flex items-center gap-2.5 pl-5 pr-6 py-3 rounded-full font-sans font-bold text-sm tracking-wide text-white shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, hsl(38 75% 52%), hsl(35 68% 44%))',
              boxShadow:
                '0 8px 32px hsl(38 70% 50% / 0.35), 0 2px 8px hsl(38 70% 50% / 0.2)',
            }}
            aria-label="Donate to Patel Foundation"
          >
            {/* Ambient glow ring */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: '0 0 30px hsl(38 70% 50% / 0.4)',
              }}
            />

            {/* Heartbeat pulse ring */}
            <motion.span
              animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border-2 pointer-events-none"
              style={{ borderColor: 'hsl(38 70% 50%)' }}
            />

            {/* Heart icon */}
            <Heart
              size={15}
              className="fill-current relative z-10 group-hover:scale-110 transition-transform duration-300"
            />

            {/* Label */}
            <span className="relative z-10">Donate</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingDonate;
