import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import SEO from "@/components/SEO";

const NotFound = () => {
  return (
    <main className="h-screen w-full relative overflow-hidden bg-black text-white selection:bg-orange-500 selection:text-white">
      <SEO title="Page Not Found - Lost?" description="You seem to be lost. Let us guide you back home." />

      {/* 1. Cinematic Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>

      <Navbar theme="dark" />

      {/* 2. Content */}
      <section className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <h1 className="text-[12rem] md:text-[16rem] font-serif font-bold leading-none text-white/5 blur-sm select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass size={80} className="text-orange-500 animate-spin-slow opacity-80" style={{ animationDuration: '20s' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-medium mb-6">
            You seem to have wandered off.
          </h2>
          <p className="text-xl md:text-2xl text-white/70 font-light mb-12 leading-relaxed">
            The path you are looking for doesn't exist here. <br />
            But sometimes, getting lost is the first step to finding something new.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              to="/"
              className="group px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-3"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Link>

            <Link
              to="/stories"
              className="group px-8 py-4 border border-white/30 text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors backdrop-blur-md flex items-center gap-3"
            >
              <MapPin size={16} />
              Explore Stories
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Decorative Coordinates */}
      <div className="absolute bottom-10 left-10 text-xs font-mono text-white/30 hidden md:block">
        LAT: 23.0225° N <br />
        LONG: 72.5714° E
      </div>
    </main>
  );
};

export default NotFound;
