import { motion } from 'framer-motion';

interface HandwrittenNoteProps {
  text: string;
  className?: string;
  delay?: number;
}

const HandwrittenNote = ({ text, className = "", delay = 0 }: HandwrittenNoteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
      transition={{ 
        duration: 1, 
        delay, 
        ease: [0.34, 1.56, 0.64, 1] 
      }}
      className={`font-handwritten text-primary/60 select-none ${className}`}
    >
      <div className="relative inline-block">
        {text}
        {/* Subtle underline SVG to make it feel more like a sketch */}
        <motion.svg
          width="100%"
          height="10"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 w-full h-2 text-primary/20 pointer-events-none"
        >
          <motion.path
            d="M 0 5 Q 25 2 50 5 Q 75 8 100 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: delay + 0.5 }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
};

export default HandwrittenNote;
