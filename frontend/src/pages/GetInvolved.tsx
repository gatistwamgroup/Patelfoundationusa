import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { ArrowRight, Check, Heart, Globe, Users, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { MEDIA } from '@/data/media';
import { SITE_CONFIG } from '@/data/config';
import api from '@/lib/api';

const testimonials = [
    {
        quote: "My trip to Kavitha changed everything. Seeing the school, the meals, and the joy firsthand made me realize: this isn't just aid, it's family.",
        author: "Sarah Jenkins",
        role: "Volunteer since 2021",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000"
    },
    {
        quote: "The transparency is what hooked me. Knowing exactly where my contribution goes—from the kitchen to the classroom—is truly rare.",
        author: "Michael Chen",
        role: "Corporate Partner",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000"
    },
    {
        quote: "Every Sunday picnic is a celebration of human spirit. It's beautiful to see people from all walks of life coming together as one community.",
        author: "Anita Desai",
        role: "Community Member",
        image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=1000"
    },
    {
        quote: "The health camps aren't just about medicine; they're about bringing dignity and professional care to those who need it most.",
        author: "Dr. Priya Sharma",
        role: "Medical Volunteer",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000"
    },
    {
        quote: "Seeing the digital classrooms in action was a revelation. We aren't just giving books; we are giving children a portal to the entire world.",
        author: "James Wilson",
        role: "Education Specialist",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000"
    }
];

const roles = [
    {
        id: 'volunteer',
        title: 'Volunteer',
        description: 'Join our on-ground teams for education and healthcare drives.',
        icon: Users
    },
    {
        id: 'other',
        title: 'Other',
        description: 'Tell Us how we can help you.',
        icon: Heart
    }
];

const MultiStepForm = ({ selectedRole }: { selectedRole: string }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        interest: selectedRole,
        experience: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        
        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = "Name is required";
        }
        
        if (currentStep === 2) {
            if (!formData.email.trim()) {
                newErrors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Invalid email format";
            }
        }

        if (currentStep === 3) {
            if (!formData.experience.trim()) {
                newErrors.experience = "Please tell us a bit about your background";
            } else if (formData.experience.length < 10) {
                newErrors.experience = "Please provide a bit more detail (min 10 chars)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        } else {
            const errorMsg = errors.name || errors.email || "Please fix the error before continuing";
            toast.error(errorMsg);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(3)) {
            toast.error(errors.experience || "Please fill in your experience");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/inquiries', {
                name: formData.name,
                email: formData.email,
                type: 'volunteer',
                subject: selectedRole.toUpperCase(),
                message: formData.experience
            });

            if (res.data.success) {
                toast.success("Application Received! We will be in touch shortly.");
                setFormData({ name: '', email: '', interest: '', experience: '' });
                setErrors({});
                setStep(1);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-black/5 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="mb-8">
                <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Step {step} of 3</span>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h3 className="text-3xl font-serif font-medium">Let's start with your name.</h3>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Your Full Name"
                                className={`w-full text-2xl md:text-3xl placeholder:text-gray-300 border-b-2 outline-none py-4 bg-transparent transition-colors ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                autoFocus
                            />
                            {errors.name && <p className="text-xs font-bold uppercase tracking-widest text-red-500">{errors.name}</p>}
                        </div>
                        <button onClick={handleNext} className="group flex items-center gap-2 text-lg font-medium hover:gap-4 transition-all mt-8">
                            Continue <ArrowRight />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h3 className="text-3xl font-serif font-medium">Where can we reach you?</h3>
                        <div className="space-y-2">
                            <input
                                type="email"
                                placeholder="email@address.com"
                                className={`w-full text-2xl md:text-3xl placeholder:text-gray-300 border-b-2 outline-none py-4 bg-transparent transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                }}
                                autoFocus
                            />
                            {errors.email && <p className="text-xs font-bold uppercase tracking-widest text-red-500">{errors.email}</p>}
                        </div>
                        <button onClick={handleNext} className="group flex items-center gap-2 text-lg font-medium hover:gap-4 transition-all mt-8">
                            Next Question <ArrowRight />
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h3 className="text-3xl font-serif font-medium">Tell us a bit about your experience.</h3>
                        <div className="space-y-2">
                            <textarea
                                rows={3}
                                placeholder="I have experience in..."
                                className={`w-full text-xl placeholder:text-gray-300 border-b-2 outline-none py-4 bg-transparent transition-colors resize-none ${errors.experience ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                value={formData.experience}
                                onChange={(e) => {
                                    setFormData({ ...formData, experience: e.target.value });
                                    if (errors.experience) setErrors(prev => ({ ...prev, experience: '' }));
                                }}
                                autoFocus
                            />
                            {errors.experience && <p className="text-xs font-bold uppercase tracking-widest text-red-500">{errors.experience}</p>}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:scale-105 transition-transform mt-8 shadow-xl flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                        >
                            {isSubmitting ? "Sending..." : "Submit Application"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TestimonialSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-4xl mx-auto text-center relative h-[450px] md:h-[350px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-x-0"
                >
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary p-1 shadow-lg">
                            <img 
                                src={testimonials[activeIndex].image} 
                                alt={testimonials[activeIndex].author} 
                                className="w-full h-full object-cover rounded-full" 
                            />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-6 px-4">
                        "{testimonials[activeIndex].quote}"
                    </h2>
                    <div className="font-bold text-sm tracking-widest uppercase text-gray-400">
                        {testimonials[activeIndex].author} • {testimonials[activeIndex].role}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-8 bg-primary' : 'bg-gray-200 hover:bg-gray-400'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const GetInvolved = () => {
    const [selectedRole, setSelectedRole] = useState('volunteer');

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            <SEO 
                title="Join Our Global Movement | Volunteer & Partner" 
                description="Become a force for good. Join the Patel Foundation's global network of volunteers and partners to transform lives in rural India. Open to US and international changemakers." 
                keywords="Volunteer in India, NGO Partnerships USA, Charity Work from USA, International Volunteering, Join Patel Foundation"
            />
            <Navbar />

            <section className="pt-32 pb-20 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                        {/* Left Side: Content & Selection */}
                        <div className="space-y-12">
                            <div>
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4 block"
                                >
                                    Join The Mission
                                </motion.span>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-6xl md:text-8xl font-serif font-medium leading-[0.9] text-foreground mb-6"
                                >
                                    Be A Force <br />
                                    <span className="italic text-muted-foreground">For Good.</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl text-muted-foreground max-w-md leading-relaxed"
                                >
                                    Whether you have time, skills, or resources, there is a place for you in our movement. Select your path below.
                                </motion.p>
                            </div>

                            <div className="space-y-4">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex items-center gap-6 ${selectedRole === role.id ? 'bg-white border-primary shadow-xl scale-[1.02]' : 'bg-transparent border-black/10 hover:bg-white hover:border-black/20'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedRole === role.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            <role.icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-medium mb-1">{role.title}</h3>
                                            <p className="text-sm text-muted-foreground">{role.description}</p>
                                        </div>
                                        <ChevronRight className={`transition-transform ${selectedRole === role.id ? 'text-primary' : 'text-gray-300 group-hover:text-gray-400'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: The Form */}
                        <div className="lg:sticky lg:top-32">
                            <MultiStepForm selectedRole={selectedRole} />

                            <div className="mt-8 flex items-center gap-8 justify-center text-sm text-muted-foreground opacity-60">
                                <div className="flex items-center gap-2">
                                    <Users size={16} /> 5,000+ Volunteers
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe size={16} /> Global Network
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Testimonials - Auto-scrolling Social Proof */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <TestimonialSection />
                </div>
            </section>

            {/* Image Strip / Gallery */}
            <section className="py-20 bg-black text-white overflow-hidden">
                <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Gallery</span>
                        <h2 className="text-4xl font-serif">Community in Action</h2>
                    </div>
                    <a href="#" className="hidden md:flex items-center gap-2 text-sm hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">See Full Gallery <ArrowRight size={16} /></a>
                </div>

                {/* Horizontal Scroll with Mask */}
                <div className="relative">
                    <div className="flex gap-6 px-6 overflow-x-auto pb-8 no-scrollbar snap-x">
                        {[
                            { img: MEDIA.events.picnic, title: 'Kavitha Picnic' },
                            { img: MEDIA.hero.education, title: 'Vidya Bhavan Class' },
                            { img: MEDIA.events.reliefWork, title: 'Gujarat Relief' },
                            { img: MEDIA.projects.trees, title: 'Tree Plantation' },
                            { img: MEDIA.events.meeting, title: 'Team Meeting' }
                        ].map((item, i) => (
                            <div key={i} className="min-w-[300px] md:min-w-[400px] h-[300px] rounded-2xl bg-gray-900 overflow-hidden relative group snap-center cursor-pointer">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-6 left-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="text-sm font-bold uppercase tracking-widest text-primary mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Event</div>
                                    <div className="text-xl font-serif text-white">{item.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <GrandFinale />
        </main>
    );
};

export default GetInvolved;
