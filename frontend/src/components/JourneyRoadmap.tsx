/**
 * JourneyRoadmap.tsx
 * Premium vertical timeline with alternating glassmorphic cards,
 * animated gold centerline, glowing milestone nodes, and scroll-driven progress.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Heart,
  BookOpen,
  Stethoscope,
  Globe,
  Sparkles,
  GraduationCap,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Data ─── */
const milestones = [
  {
    year: '2019',
    title: 'Pillars of Education',
    description:
      'Our journey began with a promise to ensure every child has access to learning. Today, we educate 500+ children through our rural classrooms.',
    icon: GraduationCap,
    accent: '#e07b39',
    stat: '500+ Students',
  },
  {
    year: '2020',
    title: 'Daily Feeding Program',
    description:
      'Combating hunger at its root. We serve 200+ nutritious, hot meals daily to families and children across the village.',
    icon: Utensils,
    accent: '#d4543c',
    stat: '200+ Daily Meals',
  },
  {
    year: '2021',
    title: 'Mobile Health Camps',
    description:
      'Healthcare reached remote hamlets through dedicated camps, providing free medical care and medicines to 100+ villagers.',
    icon: Stethoscope,
    accent: '#7b5ea7',
    stat: '100+ Patients',
  },
  {
    year: '2022',
    title: 'Rapid Relief Response',
    description:
      'We established emergency relief teams to provide critical assistance and local aid during times of crisis and natural disasters.',
    icon: Heart,
    accent: '#1a9c6e',
    stat: 'Emergency Aid',
  },
  {
    year: '2023',
    title: 'Nutrition & Food Kits',
    description:
      'Targeted nutrition for the most vulnerable. We distribute 200+ specialized food kits to expecting mothers and infants.',
    icon: Globe,
    accent: '#4a9d8f',
    stat: '200+ Kits',
  },
  {
    year: '2024',
    title: 'Youth Activity Centers',
    description:
      'Expanding beyond academics. We now operate 3 youth activity centers focused on creativity, skills, and personal growth.',
    icon: Sparkles,
    accent: '#2d7dd2',
    stat: '3 Centers',
  },
  {
    year: '2025',
    title: 'Sunday Community Picnics',
    description:
      'Joy is a fundamental right. Our weekly Sunday picnics bring joy and community bonding to over 100+ families.',
    icon: Heart,
    accent: '#c0852a',
    stat: '100+ Families',
  },
];

/* ─── Milestone Card ─── */
const MilestoneItem = ({
  milestone,
  index,
}: {
  milestone: (typeof milestones)[0];
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;
  const Icon = milestone.icon;

  return (
    <div ref={ref} className="relative flex w-full items-stretch">
      {/* ─── LEFT SIDE ─── */}
      <div
        className={`hidden md:flex w-[calc(50%-40px)] ${
          isLeft ? 'justify-end pr-8' : 'justify-end pr-8'
        }`}
      >
        {isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <CardContent
              milestone={milestone}
              isLeft={true}
              Icon={Icon}
            />
          </motion.div>
        ) : (
          /* Year display on the opposite side */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-end w-full"
          >
            <span
              className="text-7xl lg:text-8xl font-serif font-bold tracking-tighter select-none"
              style={{ color: `${milestone.accent}15` }}
            >
              {milestone.year}
            </span>
          </motion.div>
        )}
      </div>

      {/* ─── CENTER NODE ─── */}
      <div className="relative flex flex-col items-center w-20 shrink-0">
        {/* Vertical connector */}
        <div
          className="w-px flex-1"
          style={{
            background: `linear-gradient(to bottom, transparent, ${milestone.accent}30)`,
          }}
        />

        {/* Node */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={
            isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
          }
          transition={{ duration: 0.5, delay: 0.15, ease: 'backOut' }}
          className="relative z-10 my-2"
        >
          {/* Pulse */}
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: index * 0.4,
            }}
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${milestone.accent}` }}
          />

          {/* Outer ring */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-110 cursor-default"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${milestone.accent}20, ${milestone.accent}08)`,
              border: `2px solid ${milestone.accent}35`,
              boxShadow: `0 0 24px ${milestone.accent}15, inset 0 0 12px ${milestone.accent}08`,
            }}
          >
            {/* Inner circle */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(145deg, ${milestone.accent}, ${milestone.accent}cc)`,
                boxShadow: `0 4px 16px ${milestone.accent}50`,
              }}
            >
              <Icon className="text-white" size={18} strokeWidth={2.2} />
            </div>
          </div>
        </motion.div>

        {/* Vertical connector */}
        <div
          className="w-px flex-1"
          style={{
            background: `linear-gradient(to bottom, ${milestone.accent}30, transparent)`,
          }}
        />
      </div>

      {/* ─── RIGHT SIDE ─── */}
      <div
        className={`flex w-full md:w-[calc(50%-40px)] ${
          !isLeft ? 'justify-start pl-4 md:pl-8' : 'justify-start pl-4 md:pl-8'
        }`}
      >
        {!isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <CardContent
              milestone={milestone}
              isLeft={false}
              Icon={Icon}
            />
          </motion.div>
        ) : (
          /* Year display on the opposite side (desktop) */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex items-center w-full"
          >
            <span
              className="text-7xl lg:text-8xl font-serif font-bold tracking-tighter select-none"
              style={{ color: `${milestone.accent}15` }}
            >
              {milestone.year}
            </span>
          </motion.div>
        )}

        {/* Mobile: Card always on the right */}
        {isLeft && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md md:hidden"
          >
            <CardContent
              milestone={milestone}
              isLeft={false}
              Icon={Icon}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ─── Card Content ─── */
const CardContent = ({
  milestone,
  isLeft,
  Icon,
}: {
  milestone: (typeof milestones)[0];
  isLeft: boolean;
  Icon: React.ElementType;
}) => (
  <div
    className={`group relative p-6 md:p-7 rounded-2xl border overflow-hidden transition-all duration-500 hover:shadow-lg ${
      isLeft ? 'text-right' : 'text-left'
    }`}
    style={{
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))',
      borderColor: `${milestone.accent}15`,
      backdropFilter: 'blur(16px)',
    }}
  >
    {/* Side accent bar */}
    <div
      className={`absolute top-3 bottom-3 w-[3px] rounded-full ${
        isLeft ? 'right-0' : 'left-0'
      }`}
      style={{
        background: `linear-gradient(to bottom, ${milestone.accent}, ${milestone.accent}30)`,
      }}
    />

    {/* Hover glow */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${
          isLeft ? '90%' : '10%'
        } 30%, ${milestone.accent}10, transparent 60%)`,
      }}
    />

    {/* Content */}
    <div className="relative z-10">
      {/* Year pill + Stat */}
      <div
        className={`flex items-center gap-2 mb-3 ${
          isLeft ? 'justify-end' : 'justify-start'
        }`}
      >
        <span
          className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase font-sans"
          style={{
            color: milestone.accent,
            backgroundColor: `${milestone.accent}10`,
            border: `1px solid ${milestone.accent}18`,
          }}
        >
          {milestone.year}
        </span>
        <span
          className="text-[10px] font-bold tracking-wider uppercase font-sans"
          style={{ color: `${milestone.accent}90` }}
        >
          {milestone.stat}
        </span>
      </div>

      <h3 className="font-serif text-xl md:text-[22px] font-medium text-foreground leading-tight mb-2.5 tracking-tight">
        {milestone.title}
      </h3>

      <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed font-sans font-light">
        {milestone.description}
      </p>
    </div>

    {/* Bottom decorative icon (faint) */}
    <div
      className={`absolute ${
        isLeft ? 'left-4' : 'right-4'
      } bottom-3 opacity-[0.04] pointer-events-none`}
    >
      <Icon size={48} strokeWidth={1} />
    </div>
  </div>
);

/* ─── Main Component ─── */
export default function JourneyRoadmap() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      ref={containerRef}
      className="relative py-20 md:py-32 bg-[#FDFBF7] overflow-hidden"
    >
      {/* ── Backgrounds ── */}
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(38 70% 50% / 0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient blurs */}
      <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-[#7b5ea7]/[0.02] rounded-full blur-[100px] pointer-events-none rotate-12" />

      <div className="container px-4 md:px-6 lg:px-12 relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-px bg-primary/40"
            />
            <span className="text-[10px] md:text-[11px] font-bold tracking-[0.4em] uppercase text-primary font-sans">
              Our Journey
            </span>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-px bg-primary/40"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-[1.1] mb-5 tracking-tight">
            The Road We've{' '}
            <span className="text-primary italic">Traveled</span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto font-sans">
            From a single promise in Kavitha to a global movement — every
            milestone marks a life transformed.
          </p>
        </motion.div>

        {/* ── Timeline ── */}
        <div className="relative max-w-5xl mx-auto">
          {/* Static gray centerline */}
          <div className="absolute top-0 bottom-0 left-10 md:left-1/2 md:-translate-x-px w-[2px] bg-gradient-to-b from-primary/5 via-primary/12 to-primary/5 pointer-events-none" />

          {/* Animated gold centerline */}
          <motion.div
            className="absolute top-0 left-10 md:left-1/2 md:-translate-x-px w-[2px] origin-top pointer-events-none"
            style={{
              height: lineHeight,
              background:
                'linear-gradient(to bottom, hsl(42 80% 60%), hsl(38 70% 50%), hsl(35 65% 42%))',
              boxShadow: '0 0 16px hsl(38 70% 50% / 0.35)',
            }}
          />

          {/* Start node */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="absolute -top-3 left-10 md:left-1/2 -translate-x-1/2 z-30"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-gold flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </motion.div>

          {/* Milestone items */}
          <div className="flex flex-col">
            {milestones.map((m, i) => (
              <MilestoneItem key={m.year} milestone={m} index={i} />
            ))}
          </div>

          {/* End node */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="absolute -bottom-3 left-10 md:left-1/2 -translate-x-1/2 z-30"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-gold flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </motion.div>
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-16 md:mt-24"
        >
          <p className="text-lg md:text-xl text-muted-foreground italic font-serif mb-8">
            "Every milestone is a promise kept."
          </p>
          <Link
            to="/about"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-sans font-medium tracking-wide text-sm transition-all duration-500 hover:gap-5 text-white shadow-elegant-lg hover:shadow-gold"
            style={{
              background:
                'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 65% 42%))',
            }}
          >
            <span>Explore Our Full Story</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
