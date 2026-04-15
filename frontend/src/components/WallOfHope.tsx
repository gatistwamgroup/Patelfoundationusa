import { motion } from 'framer-motion';
import HandwrittenNote from './HandwrittenNote';

const items = [
    {
        id: 1,
        image: "/assets/arya.png",
        note: "I want to be a teacher!",
        name: "Arya, 7",
        rotation: -3
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop",
        note: "Lunch is the best time.",
        name: "Rahul, 9",
        rotation: 2
    },
    {
        id: 3,
        image: "/assets/sneha.png",
        note: "Thank you for the books!",
        name: "Sneha, 10",
        rotation: -1
    },
    {
        id: 4,
        image: "/assets/vikram.png",
        note: "I love our Sunday picnics.",
        name: "Vikram, 6",
        rotation: 4
    }
];

const WallOfHope = () => {
    return (
        <section className="py-24 bg-[#FAFAF8] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Voices from the field</span>
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif text-slate-900 leading-tight">
                        The Faces of <br />
                        <span className="italic text-slate-400">Our Future.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30, rotate: item.rotation - 5 }}
                            whileInView={{ opacity: 1, y: 0, rotate: item.rotation }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="bg-white p-4 shadow-xl shadow-slate-200/50 rounded-sm relative group cursor-pointer"
                        >
                            <div className="aspect-[4/5] overflow-hidden bg-slate-100 mb-6">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                />
                            </div>
                            <div className="px-2 pb-4">
                                <HandwrittenNote text={item.note} className="text-2xl mb-2" delay={0.4} />
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-4">— {item.name}</p>
                            </div>

                            {/* Tape Effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-black/5 backdrop-blur-sm -rotate-2" />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center px-4">
                    <p className="soul-text text-lg sm:text-xl max-w-2xl mx-auto">
                        These aren't just statistics. They are individuals with names, dreams, and favorite colors. Your support turns these notes into reality.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default WallOfHope;
