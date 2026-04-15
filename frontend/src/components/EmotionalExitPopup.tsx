import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, MoveRight, Star } from 'lucide-react';
import { MEDIA } from '@/data/media';

interface EmotionalExitPopupProps {
    isOpen: boolean;
    onStay: () => void;
    onLeave: () => void;
}

const EmotionalExitPopup = ({ isOpen, onStay, onLeave }: EmotionalExitPopupProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
                    {/* Cinematic Cinematic Backdrop - Deeper and more focused */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onStay}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                    />

                    {/* Drifting Soul Particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, y: 100 }}
                                animate={{ 
                                    opacity: [0, 0.4, 0], 
                                    scale: [0.5, 1, 0.5],
                                    y: -200,
                                    x: (i % 2 === 0 ? 1 : -1) * (i * 20)
                                }}
                                transition={{ 
                                    duration: 4 + i, 
                                    repeat: Infinity, 
                                    delay: i * 0.5 
                                }}
                                className="absolute left-1/2 bottom-1/4 text-orange-400/30"
                            >
                                <Heart size={16 + i * 4} fill="currentColor" />
                            </motion.div>
                        ))}
                    </div>

                    {/* The Soul Card - Small, Unique, Attractive */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 40, rotateX: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-[360px] bg-[#FDFBF7]/90 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] border-2 border-white/20"
                    >
                        {/* Luxury Gold Trim */}
                        <div className="absolute inset-0 border-[8px] border-orange-500/5 pointer-events-none rounded-[3rem]" />
                        
                        <div className="p-8 pb-10 text-center flex flex-col items-center relative z-10">
                            {/* Personal Image - The Heart of the card */}
                            <div className="relative mb-10 pt-4">
                                <motion.div 
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="w-32 h-32 rounded-full overflow-hidden border-[8px] border-white shadow-2xl relative z-10"
                                >
                                    <img 
                                        src={MEDIA.hero.future} 
                                        alt="Hope for Kavitha" 
                                        className="w-full h-full object-cover scale-110"
                                    />
                                </motion.div>
                                
                                {/* Pulse Badge - Positioned like a 'medal' of impact */}
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        boxShadow: ["0 0 0 0px rgba(249,115,22,0.4)", "0 0 0 20px rgba(249,115,22,0)", "0 0 0 0px rgba(249,115,22,0)"]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -bottom-1 -right-1 bg-orange-600 text-white p-3.5 rounded-full shadow-lg z-20 border-[3px] border-white"
                                >
                                    <Heart size={20} fill="currentColor" strokeWidth={0} />
                                </motion.div>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -z-0" />
                            </div>

                            <div className="space-y-2 mb-6">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                    className="flex justify-center gap-1 text-orange-400"
                                >
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                </motion.div>
                                <h2 className="text-4xl font-serif text-slate-900 tracking-tight leading-[1.1]">
                                    Wait... Don't <br />
                                    <span className="italic font-light text-orange-600">close the door.</span>
                                </h2>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-12 px-2 font-light italic">
                                "Today, a child in Kavitha is dreaming of becoming a doctor. Your departure is the only thing standing in their way."
                                <span className="block not-italic font-bold text-slate-950 mt-4 uppercase tracking-[0.2em] text-[10px]">Your pulse is her future.</span>
                            </p>

                            <div className="w-full space-y-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onStay}
                                    className="group w-full py-5 bg-slate-900 text-white rounded-2xl font-bold tracking-widest transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3"
                                >
                                    <Sparkles size={18} className="text-orange-400" />
                                    <span>YES, I WILL HELP</span>
                                </motion.button>
                                
                                <button
                                    onClick={onLeave}
                                    className="group w-full py-2 text-slate-400 hover:text-slate-950 text-[10px] font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Maybe later</span>
                                    <MoveRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </div>

                        {/* Premium Minimal Close */}
                        <button
                            onClick={onStay}
                            className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-all p-2 rounded-full hover:bg-slate-100"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EmotionalExitPopup;
