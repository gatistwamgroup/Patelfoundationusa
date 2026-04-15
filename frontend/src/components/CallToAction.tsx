import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="donate" className="py-24 lg:py-32 section-white relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gold-gradient"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      <div className="container px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-10 h-10 text-primary" />
            </motion.div>

            <h2 className="text-headline mb-6">
              Your Generosity Creates{' '}
              <span className="text-primary">Lasting Change</span>
            </h2>

            <p className="text-subhead max-w-2xl mx-auto mb-10">
              Every contribution, no matter the size, helps us expand our reach and
              deepen our impact. Together, we can build a world where opportunity knows no bounds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px -4px hsl(38 70% 50% / 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/donate"
                  className="btn-premium flex items-center gap-2"
                >
                  <Heart size={18} />
                  <span>Donate Now</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/get-involved"
                  className="btn-outline-premium flex items-center gap-2"
                >
                  <span>Partner With Us</span>
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>501(c)(3) Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>100% Tax Deductible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Transparent Reporting</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
