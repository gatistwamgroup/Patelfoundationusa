import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PayPalButtonsWrapper from '@/components/PayPalButtonsWrapper';
import api from '@/lib/api'; // Use our axios instance
import { useBlocker } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EmotionalExitPopup from '@/components/EmotionalExitPopup';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { Check, Heart, Globe, Zap, Leaf, Gift, MoveRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { MEDIA } from '@/data/media';
import { toast } from 'sonner';

// Proper asset imports for production builds
import imgPt9 from '@/assets/pt9.jpg';
import imgPt1 from '@/assets/pt1.jpeg';
import imgP13 from '@/assets/p13.jpeg';
import imgPt5 from '@/assets/pt5.jpg';

const impactGallery = [
    {
        title: 'Studying',  
        category: 'Education',
        image: imgPt9,
        stat: '500+',
        statLabel: 'Students Enrolled',
        desc: "Transforming rural education through digital classrooms, scholarship programs, and comprehensive mentorship."
    },
    {
        title: 'Mission Jal',
        category: 'Water',
        image: MEDIA.projects.water,
        stat: '50+',
        statLabel: 'Villages Served',
        desc: "Implementing sustainable water harvesting systems and purification plants in drought-prone regions."
    },
    {
        title: 'Mobile Health',
        category: 'Healthcare',
        image: MEDIA.projects.health,
        stat: '15k+',
        statLabel: 'Patients Treated',
        desc: "Bringing critical healthcare, diagnostics, and medicines directly to remote tribal communities."
    },
    {
        title: 'Green Earth',
        category: 'Sustainability',
        image: MEDIA.projects.trees,
        stat: '50k+',
        statLabel: 'Trees Planted',
        desc: "Large-scale reforestation initiatives to restore local biodiversity and combat climate change."
    }
];

const donationTiers = [
    {
        value: 50,
        label: '$50',
        desc: 'Seed',
        icon: Heart,
        image: MEDIA.hero.global,
        impact: "Provides initial school kits for 5 children."
    },
    {
        value: 100,
        label: '$100',
        desc: 'Growth',
        icon: Globe,
        image: MEDIA.projects.vidya,
        impact: "Expands our digital literacy program to a new village."
    },
    {
        value: 250,
        label: '$250',
        desc: 'Scale',
        icon: Leaf,
        image: MEDIA.projects.trees,
        impact: "Installs a solar pump serving 50+ families."
    },
    {
        value: 500,
        label: '$500',
        desc: 'Global',
        icon: Zap,
        image: MEDIA.projects.health,
        impact: "Funds a mobile health camp for an entire region."
    },
];

const tickerItems = [
    "📚 Educate: 500+ students enrolled in digital literacy programs",
    "🍲 Feeding: 200+ nutritious meals served this month",
    "🧺 Picnic: Weekly community bonding events for rural families",
    "🎨 Activities: 3 youth development centers launched",
    "🏥 Health Camps: 100+ free medical consultations provided",
    "🆘 Relief: Rapid response teams assisting local communities",
    "🥗 Food (Nutrition): 200+ nutrition kits distributed"
];

const Donate = () => {
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
    const [customAmount, setCustomAmount] = useState('');

    // Dedication State
    const [isDedication, setIsDedication] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    const [message, setMessage] = useState('');

    const [activeIndex, setActiveIndex] = useState(0);

    const currentAmount = selectedAmount === 'custom' ? (Number(customAmount) || 0) : selectedAmount;
    const activeTier = donationTiers.slice().reverse().find(t => currentAmount >= t.value) || donationTiers[0];

    const [isProcessing, setIsProcessing] = useState(false);
    const [hasDonated, setHasDonated] = useState(false);

    // Setup exit intent blocker
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !hasDonated && currentLocation.pathname !== nextLocation.pathname
    );

    const handleDonateSuccess = useCallback((details: any) => {
        toast.success("Donation Successful!", {
            description: `Thank you, ${details.payer.name.given_name}, for your generous gift of $${currentAmount}.`,
            duration: 5000,
        });
        setHasDonated(true);
        setCustomAmount('');
        setSelectedAmount(100);
    }, [currentAmount]);

    // Stable callbacks — only recreated when currentAmount changes
    const handleApprove = useCallback(async (data: any) => {
        try {
            setIsProcessing(true);
            const response = await api.post('/paypal/capture-order', { orderID: data.orderID });
            setIsProcessing(false);
            if (response.data.status === 'COMPLETED') {
                handleDonateSuccess(response.data);
            } else {
                toast.error('Payment not completed. Please check your PayPal account.');
            }
        } catch (error: any) {
            setIsProcessing(false);
            console.error('[PayPal] Capture Error:', error);
            toast.error(error.response?.data?.message || 'Payment error. Please contact support.');
        }
    }, [handleDonateSuccess]);

    const handleError = useCallback((err: any) => {
        console.error('[PayPal] SDK Error:', err);
        setIsProcessing(false);
        toast.error('An unexpected PayPal error occurred. Please try again.');
    }, []);

    const handleCancel = useCallback(() => {
        setIsProcessing(false);
    }, []);

    return (
        <main className="bg-[#FDFBF7] text-foreground font-sans selection:bg-primary/20">
            <SEO 
                title="Donate to Patel Foundation | Support 501(c)(3) Impact" 
                description="Make a US tax-deductible donation to the Patel Foundation. Your contribution directly funds education, healthcare, and nutrition programs for rural communities in India." 
                keywords="Donate to NGO, Tax Deductible Donation, 501c3 Charity India, Support Rural Education, Child Health Charity, Global Giving"
            />
            <Navbar />

            <div className="flex flex-col lg:flex-row pt-20">

                {/* Left Column - Visual Storyteller OR Dedication Card */}
                <div className="lg:w-1/2 h-[50vh] lg:h-[calc(100vh-80px)] lg:sticky lg:top-20 relative overflow-hidden bg-slate-900 group order-1 transition-all duration-700">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none" />

                    <AnimatePresence mode="popLayout">
                        {isDedication ? (
                            // DEDICATION CARD PREVIEW
                            <motion.div
                                key="dedication-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center p-8 z-10"
                            >
                                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none" />
                                <div className="w-full max-w-md aspect-[4/5] bg-[#FDFBF7] rounded-sm p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600" />

                                    <div className="mt-8">
                                        <div className="w-16 h-16 mx-auto bg-slate-900 rounded-full flex items-center justify-center text-white mb-6">
                                            <Gift size={24} />
                                        </div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">A Gift of Impact</h3>
                                        <h2 className="text-3xl font-serif text-slate-900">Donation Certificate</h2>
                                    </div>

                                    <div className="py-8 w-full border-t border-b border-slate-100 my-4">
                                        <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">In Honor Of</p>
                                        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 break-words">
                                            {recipientName || "Recipient Name"}
                                        </h1>
                                        {message && <p className="mt-4 font-serif italic text-slate-500 max-w-[80%] mx-auto">"{message}"</p>}
                                    </div>

                                    <div className="text-sm font-mono text-slate-400">
                                        verified.patelfoundation.org <br />
                                        {new Date().toLocaleDateString()}
                                    </div>

                                    {/* Watermark/Pattern */}
                                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                                </div>
                            </motion.div>
                        ) : (
                            // STANDARD IMPACT VISUAL
                            <motion.div
                                key={activeTier.image}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                <img src={activeTier.image} alt="Impact" className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/20" />

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-16 z-10 text-white">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                                <activeTier.icon size={24} />
                                            </div>
                                            <span className="text-sm font-mono uppercase tracking-widest text-white/70">
                                                Active Program
                                            </span>
                                        </div>

                                        <h2 className="text-4xl lg:text-5xl font-serif leading-tight mb-4">
                                            "Your ${currentAmount || '0'} contribution {activeTier.impact}"
                                        </h2>
                                        <p className="text-white/50 text-xl font-light">
                                            Join 2,500+ donors changing lives today.
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column - The Interactive Form */}
                <div className="lg:w-1/2 bg-[#FDFBF7] flex flex-col justify-center order-2">
                    <div className="max-w-xl mx-auto w-full p-8 lg:p-20">

                        <div className="mb-10">
                            <span className="inline-block py-1 px-3 rounded-full bg-black/5 text-black/60 text-xs font-bold uppercase tracking-widest mb-4">Invest in Humanity</span>
                            <h1 className="text-4xl font-serif mb-2">From Local Roots to Global Scale.</h1>
                            <p className="text-slate-500 mt-2">
                                Your US tax-deductible donation doesn't just help one person; it fuels a scalable model. Originating in Kavitha, we are expanding our proven solutions across India and the globe.
                            </p>
                        </div>


                        {/* Amount Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {donationTiers.map((tier) => {
                                const isSelected = selectedAmount === tier.value;
                                return (
                                    <button
                                        key={tier.value}
                                        onClick={() => { setSelectedAmount(tier.value); setCustomAmount(''); }}
                                        className={`relative p-6 rounded-2xl border text-left transition-all group overflow-hidden ${isSelected ? 'border-transparent text-white' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                    >
                                        {/* Animated Background for Selection */}
                                        {isSelected && (
                                            <motion.div
                                                layoutId="amount-active"
                                                className="absolute inset-0 bg-slate-900 z-0"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        <div className="relative z-10">
                                            <span className={`text-2xl font-bold block mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                ${tier.value}
                                            </span>
                                            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                                                {tier.desc}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="absolute top-4 right-4 text-orange-400"
                                            >
                                                <Check size={20} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Input */}
                        <div className="mb-8 relative">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={customAmount}
                                onChange={(e) => {
                                    // Strip anything that isn't a digit or a single decimal point
                                    let raw = e.target.value.replace(/[^0-9.]/g, '');
                                    // Allow only one decimal point
                                    const parts = raw.split('.');
                                    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');
                                    // Cap at 10,000,000
                                    if (parseFloat(raw) > 10_000_000) raw = '10000000';
                                    setCustomAmount(raw);
                                    setSelectedAmount('custom');
                                }}
                                placeholder="Enter Custom Amount"
                                className={`w-full p-4 bg-transparent border-2 rounded-2xl outline-none text-xl font-medium transition-all ${selectedAmount === 'custom' ? 'border-primary bg-white shadow-xl' : 'border-gray-200 focus:border-gray-400'}`}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-widest text-gray-400">USD</span>
                        </div>

                        {/* Dedication Toggle */}
                        <div className="mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDedication(!isDedication)}>
                                <div className="flex items-center gap-3">
                                    <Gift size={20} className={isDedication ? 'text-primary' : 'text-gray-400'} />
                                    <span className="font-medium text-sm">Dedicate this donation</span>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDedication ? 'bg-primary' : 'bg-gray-200'}`}>
                                    <motion.div
                                        animate={{ x: isDedication ? 24 : 0 }}
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {isDedication && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Recipient's Name (e.g. Mom, Best Friend)"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                className="w-full p-3 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Short Message (Optional)"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="w-full p-3 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Transparency Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-[10px] items-end uppercase tracking-widest font-bold text-gray-400 mb-2">
                                <span>Allocation</span>
                                <span>Transparency A+</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-black w-[90%]" />
                                <div className="h-full bg-gray-300 w-[10%]" />
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 text-gray-400">
                                <span>90% Programs</span>
                                <span>10% Admin/Growth</span>
                            </div>
                        </div>

                        {/* PayPal Integration */}
                        <PayPalButtonsWrapper
                            amount={currentAmount}
                            onProcessingChange={setIsProcessing}
                        />
                    </div>
                </div>
            </div>

            {/* OUR WORKS SECTION - The 'Unique' Addition */}
            <div className="bg-[#111] text-white py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Our Works</span>
                            <h2 className="text-4xl md:text-5xl font-serif">See the Impact.</h2>
                        </div>
                        <p className="max-w-md text-gray-400 text-sm md:text-base leading-relaxed">
                            Every dollar acts as a seed. Across 12 countries, we are building infrastructure, funding education, and saving lives. Here are the active projects you support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Teaching',
                                category: 'Education',
                                image: imgPt9,
                                stat: '500+ Students'
                            },
                            {
                                title: 'Nutrition',
                                category: 'Food',
                                image: imgPt1,
                                stat: '100000+ Meals'
                            },
                            {
                                title: 'Mobile Health',
                                category: 'Healthcare',
                                image: imgP13,
                                stat: '1k Patients'
                            },
                            {
                                title: 'Covid Relief',
                                category: 'Relief program',
                                image: imgPt5,
                                stat: '5k Relief'
                            }
                        ].map((work, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-900 cursor-pointer"
                            >
                                <img
                                    src={work.image}
                                    alt={work.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{work.category}</div>
                                    <h3 className="text-2xl font-serif mb-1 group-hover:text-white transition-colors">{work.title}</h3>
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-primary rounded-full" />
                                        {work.stat}
                                    </div>
                                </div>

                                {/* Hover overlay icon */}
                                <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoveRight size={14} className="text-white" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 flex justify-center">
                        <button className="px-8 py-4 border border-white/20 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            View All Projects
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Ticker - The 'Bloomberg' of Impact */}
            <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-md text-white py-2 md:py-3 z-50 overflow-hidden border-t border-white/10 shadow-up-lg">
                <div className="container mx-auto flex items-center px-4">
                    <div className="flex items-center gap-2 mr-4 md:mr-6 text-primary font-bold uppercase tracking-widest text-[10px] md:text-xs whitespace-nowrap">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Live Impact
                    </div>
                    <div className="flex-1 overflow-hidden relative mask-image-gradient">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                            className="flex items-center gap-8 md:gap-16 whitespace-nowrap text-xs md:text-sm font-mono text-gray-300"
                        >
                            {[...tickerItems, ...tickerItems].map((item, i) => (
                                <span key={i}>{item}</span>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            <GrandFinale />

            {/* Exit Intent Popup */}
            <EmotionalExitPopup 
                isOpen={blocker.state === "blocked"}
                onStay={() => blocker.reset && blocker.reset()}
                onLeave={() => blocker.proceed && blocker.proceed()}
            />
        </main>
    );
};

export default Donate;
