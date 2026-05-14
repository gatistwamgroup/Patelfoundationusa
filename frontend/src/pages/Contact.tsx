import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { Mail, Phone, MapPin, Send, Linkedin, Twitter, Instagram, Loader2, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/data/config';
import { MEDIA } from '@/data/media';
import api from '@/lib/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) newErrors.name = "Name is required";
        
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        
        if (!formData.subject) newErrors.subject = "Please select a subject";
        
        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/inquiries', {
                name: formData.name,
                email: formData.email,
                type: 'contact',
                subject: formData.subject,
                message: formData.message
            });

            if (res.data.success) {
                toast.success("Message sent! We'll reach out to you within 24 hours.");
                setFormData({ name: '', email: '', subject: '', message: '' });
                setErrors({});
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
        <main className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-orange-100 selection:text-orange-900 font-sans">
            <SEO 
                title="Contact Our US Headquarters | Patel Foundation" 
                description="Connect with our New York-based team for partnerships, 501(c)(3) donation inquiries, or volunteering opportunities in India. We're here to bridge the gap." 
                keywords="Contact Patel Foundation, USA NGO Contact, Non-profit Partnerships, Volunteer in India from USA, Donate Inquiry"
            />
            <Navbar theme="light" />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-48 pb-24 overflow-hidden">
                {/* Soft Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-orange-100/50 rounded-full blur-[120px] opacity-40 pointer-events-none" />
                <div className="absolute top-20 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 bg-orange-50 text-orange-600 border border-orange-100">
                                <Sparkles size={12} /> Contact Our Team
                            </span>
                        </motion.div>
                        
                        <div className="grid lg:grid-cols-5 gap-12 items-end">
                            <div className="lg:col-span-3">
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-medium leading-[0.85] tracking-tighter"
                                >
                                    Let's start <br />
                                    <span className="italic text-slate-400">something.</span>
                                </motion.h1>
                            </div>
                            <div className="lg:col-span-2">
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="text-lg sm:text-xl md:text-2xl text-slate-500 font-light leading-relaxed mb-4"
                                >
                                    Whether you're a potential partner, a future volunteer, or simply someone who believes in our mission—we're all ears.
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE CONTENT GRID --- */}
            <section className="pb-32 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
                        
                        {/* Left: Info & Visual Legacy */}
                        <div className="lg:col-span-5 space-y-12">
                            
                            {/* Visual Narrative Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-2xl"
                            >
                                <img 
                                    src="/assets/contact.webp" 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                    alt="Kavitha Village"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10 right-10">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-2 block">Our Foundations</span>
                                    <h3 className="text-3xl font-serif text-white mb-4">Deeply Rooted, <br /> Globally Focused.</h3>
                                    <div className="flex flex-col">
                                        <span className="font-handwritten text-4xl text-white/90">Kunj Patel</span>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Founder & Visionary</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Precise Contact Details */}
                            <div className="space-y-8">
                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-orange-600 transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email</h4>
                                        <p className="text-lg font-medium text-slate-800">info@patelfoundation.org</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-orange-600 transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Phone</h4>
                                        <p className="text-lg font-medium text-slate-800">+1 (800) 555-0199</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-orange-600 transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">HQ</h4>
                                        <p className="text-lg font-medium text-slate-800 leading-snug">
                                            123 Foundation Way, Suite 500<br />
                                            New York, NY 10001
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Presence */}
                            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Join the circle</span>
                                <div className="flex gap-3">
                                    {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                                        <a 
                                            key={i} 
                                            href="#" 
                                            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all"
                                        >
                                            <Icon size={16} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: The High-End Form */}
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden"
                            >
                                {/* Decorative Soft BG */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="mb-12">
                                    <h3 className="text-4xl font-serif mb-4 leading-tight">Send a Dispatch.</h3>
                                    <p className="text-slate-500 text-lg font-light">We typically respond within one business day.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                                            <input
                                                 type="text"
                                                 value={formData.name}
                                                 onChange={(e) => {
                                                     setFormData({ ...formData, name: e.target.value });
                                                     if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                                 }}
                                                 className={`w-full bg-transparent border-b-2 py-3 text-lg transition-all placeholder:text-slate-300 outline-none ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-orange-500'}`}
                                                 placeholder="Kunj Patel"
                                             />
                                             {errors.name && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.name}</span>}
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                                             <input
                                                 type="email"
                                                 value={formData.email}
                                                 onChange={(e) => {
                                                     setFormData({ ...formData, email: e.target.value });
                                                     if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                                 }}
                                                 className={`w-full bg-transparent border-b-2 py-3 text-lg transition-all placeholder:text-slate-300 outline-none ${errors.email ? 'border-red-500' : 'border-slate-100 focus:border-orange-500'}`}
                                                 placeholder="hello@world.com"
                                             />
                                             {errors.email && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.email}</span>}
                                         </div>
                                     </div>

                                     <div className="space-y-2">
                                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Subject</label>
                                         <select
                                             value={formData.subject}
                                             onChange={(e) => {
                                                 setFormData({ ...formData, subject: e.target.value });
                                                 if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
                                             }}
                                             className={`w-full bg-transparent border-b-2 py-3 text-lg transition-all appearance-none cursor-pointer outline-none ${errors.subject ? 'border-red-500' : 'border-slate-100 focus:border-orange-500'}`}
                                         >
                                             <option value="" disabled>How can we help?</option>
                                             <option value="Partnership">Partnership Inquiry</option>
                                             <option value="Volunteering">Volunteering Opportunity</option>
                                             <option value="Donation">Donation Question</option>
                                             <option value="Story">Share a Story</option>
                                             <option value="Other">Other</option>
                                         </select>
                                         {errors.subject && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.subject}</span>}
                                     </div>

                                     <div className="space-y-2">
                                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Your Message</label>
                                         <textarea
                                             rows={5}
                                             value={formData.message}
                                             onChange={(e) => {
                                                 setFormData({ ...formData, message: e.target.value });
                                                 if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
                                             }}
                                             className={`w-full bg-transparent border-b-2 py-3 text-lg transition-all placeholder:text-slate-300 resize-none outline-none ${errors.message ? 'border-red-500' : 'border-slate-100 focus:border-orange-500'}`}
                                             placeholder="Write your message here..."
                                         />
                                         {errors.message && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.message}</span>}
                                     </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-5 rounded-2xl bg-orange-600 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-70 disabled:grayscale"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="animate-spin" /><span>Sending...</span></>
                                        ) : (
                                            <><span>Send dispatch</span><Send size={16} /></>
                                        )}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- GLOBAL PARTNERSHIP SECTION --- */}
            <section className="py-24 bg-white border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-12 items-center text-center md:text-left">
                        <div className="md:col-span-1">
                            <Globe size={48} className="text-orange-500 mb-6 mx-auto md:mx-0 opacity-20" />
                            <h2 className="text-3xl font-serif leading-tight">A Presence <br /> Across Borders.</h2>
                        </div>
                        <div className="md:col-span-2 grid sm:grid-cols-2 gap-8">
                            <div className="p-8 rounded-3xl bg-[#FDFBF7] border border-slate-100">
                                <h4 className="text-orange-600 font-bold uppercase tracking-widest text-[10px] mb-3">USA Operations</h4>
                                <p className="text-lg font-medium text-slate-800">Strategy, Major Gifts, & Global Governance.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-[#FDFBF7] border border-slate-100">
                                <h4 className="text-orange-600 font-bold uppercase tracking-widest text-[10px] mb-3">India Field Teams</h4>
                                <p className="text-lg font-medium text-slate-800">Direct Intervention, Village Care, & Joy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <GrandFinale />
        </main>
    );
};

export default Contact;
