import { motion } from 'framer-motion';
import HandwrittenNote from './HandwrittenNote';
import { MEDIA } from '@/data/media';

const FounderLetter = () => {
    return (
        <section className="py-24 md:py-48 bg-white overflow-hidden">
            <div className="container px-6 lg:px-12 mx-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left: Experimental Editorial Layout */}
                        <div className="relative">
                            <div className="relative z-10 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                                <img
                                    src="assets/fl.png"
                                    alt="Kunj Patel in Kavitha"
                                    className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>

                            {/* Floating Polaroids / Accents */}
                            <motion.div
                                initial={{ rotate: -10, x: -50, opacity: 0 }}
                                whileInView={{ rotate: -5, x: -30, opacity: 1 }}
                                className="absolute -bottom-10 -left-10 w-48 aspect-square bg-white p-2 shadow-xl rounded-sm hidden md:block"
                            >
                                <img src={MEDIA.hero.nutrition} className="w-full h-full object-cover" alt="Legacy" />
                                <div className="mt-2 text-center">
                                    <span className="font-handwritten text-xs text-slate-400">The first meal, 2019</span>
                                </div>
                            </motion.div>

                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                        </div>

                        {/* Right: The Letter */}
                        <div className="flex flex-col">
                            <div className="mb-10">
                                <HandwrittenNote text="A Letter from Kavitha" className="text-3xl text-primary/60 mb-6" />
                                <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif leading-none tracking-tighter text-slate-900">
                                    Legacy is not <br />
                                    <span className="italic">what we leave.</span>
                                </h2>
                            </div>

                            <div className="soul-text text-lg sm:text-xl md:text-2xl text-slate-600 space-y-8 leading-relaxed font-light">
                                <p>
                                    "When I first walked these streets in 2019, I didn't see poverty. I saw potential waiting to be ignited. I saw children whose dreams were just as vast as those in any city on Earth."
                                </p>
                                <p>
                                    The Patel Foundation wasn't built on boardrooms or statistics. It was built on a single, sacred promise: <span className="text-primary font-medium italic">That no child's destiny should be limited by the soil they were born upon.</span>
                                </p>
                                <p>
                                    Today, we are a global family. But our pulse will always be here, in the red soil of Gujarat. Thank you for being the heartbeat of this mission.
                                </p>
                            </div>

                            <div className="mt-16 pt-10 border-t border-slate-100">
                                <div className="flex flex-col">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        className="font-handwritten text-4xl sm:text-5xl md:text-7xl text-primary opacity-90 mb-2"
                                    >
                                        Kunj Patel
                                    </motion.div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">Founder & Visionary</span>
                                        <div className="h-px w-12 bg-slate-200" />
                                        <span className="font-handwritten text-sm text-primary/40">Kavitha, IN</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default FounderLetter;
