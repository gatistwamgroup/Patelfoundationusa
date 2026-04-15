import { useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ImpactMap from '@/components/ImpactMap';

const stats = [
  {
    id: 1,
    value: 200,
    label: "Nutritious Meals Served",
    suffix: "+",
    color: "text-amber-600"
  },
  {
    id: 2,
    value: 500,
    label: "Students Educated",
    suffix: "+",
    color: "text-blue-600"
  },
  {
    id: 3,
    value: 100,
    label: "Patients in Health Camps",
    suffix: "+",
    color: "text-rose-600"
  },
  {
    id: 4,
    value: 500,
    label: "Community Activities",
    suffix: "+",
    color: "text-emerald-600"
  }
];

const Counter = ({ value, suffix, className }: { value: number, suffix: string, className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        if (latest >= 1000000) {
          ref.current.textContent = (latest / 1000000).toFixed(1) + 'M' + suffix;
        } else if (latest >= 1000) {
          ref.current.textContent = (latest / 1000).toFixed(0) + 'K' + suffix;
        } else {
          ref.current.textContent = Math.floor(latest).toString() + suffix;
        }
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} className={className}>0{suffix}</span>;
};

const ImpactStats = () => {
  return (
    <section className="py-16 md:py-32 bg-[#050505] relative overflow-hidden text-white">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="container px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 border-b border-white/10 pb-8">
          {/* ... Header content ... */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium tracking-widest uppercase text-white/80">Live Impact Tracker</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-medium bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Scale of Operations
            </h2>
          </div>
          <div className="mt-8 md:mt-0 max-w-sm text-white/80 text-lg">
            Real-time data reflecting our commitment to transparent and measurable change across the globe.
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 lg:gap-8 mb-20">
          {stats.map((stat, index) => (
            // ... Stats cards ...
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block hidden"></div>

              <div className={`text-4xl sm:text-6xl md:text-7xl font-light mb-4 tracking-tight ${stat.color} group-hover:scale-110 transition-transform origin-left duration-500`}>
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-lg font-medium text-white/90 group-hover:text-white transition-colors flex items-center gap-2">
                {stat.label}
                <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1 translate-x-1" size={12} />
              </p>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10 rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* The New Map Component */}
        <ImpactMap />

      </div>
    </section>
  );
};


export default ImpactStats;
