import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram, Youtube, Facebook, Heart, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from './Icons/WhatsAppIcon';
import { Link } from 'react-router-dom';
import MagneticButton from './MagneticButton';
import { SITE_CONFIG } from '@/data/config';
import { toast } from 'sonner';
import api from '@/lib/api';

const SocialLink = ({ icon: Icon, href, label }: { icon: any, href: string, label: string }) => (
    <MagneticButton>
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-black hover:bg-white hover:border-white transition-all duration-300"
        >
            <Icon size={20} />
        </a>
    </MagneticButton>
);

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link to={to} className="block text-lg text-white/70 hover:text-white transition-colors mb-2 hover:translate-x-2 transition-transform duration-300">
        {children}
    </Link>
);

const NewsletterForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await api.post('/newsletter/subscribe', { email });
            
            if (res.data.success) {
                toast.success("Subscribed successfully!");
                setEmail('');
            } else {
                toast.error(res.data.message || "Error subscribing.");
            }
        } catch (error: any) { 
            const errorMsg = error.response?.data?.message || "Network error.";
            toast.error(errorMsg);
        }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="relative max-w-md">
            <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border-b border-white/20 py-3 text-lg outline-none focus:border-white transition-colors placeholder:text-white/20"
            />
            <button
                type="submit"
                disabled={loading}
                aria-label="Subscribe to newsletter"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
            </button>
        </form>
    );
};


const GrandFinale = () => {
    return (
        <section className="relative min-h-screen lg:h-screen lg:min-h-[700px] w-full bg-black text-white overflow-hidden flex flex-col justify-center py-16 lg:py-0">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute -top-[20%] -right-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40"></div>

            <div className="container mx-auto px-6 lg:px-12 h-full flex flex-col justify-between relative z-10">

                {/* 1. Breaking Headline & CTA */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mt-8 mb-12 lg:mb-0">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-4xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tighter mb-4"
                        >
                            Join the <br />
                            <span className="italic text-white/60 ml-2 sm:ml-4 lg:ml-8">Global Movement.</span>
                        </motion.h2>
                        <p className="text-white/80 text-lg max-w-md block">
                            Started in Kavitha. Growing in the US. Scaling for the World.
                        </p>
                    </div>
                    <div className="lg:mb-4">
                        <MagneticButton>
                            <Link to="/donate" className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-xl font-bold tracking-tight hover:scale-105 transition-transform">
                                <span>Donate Now</span>
                                <Heart size={20} className="fill-current text-red-500 group-hover:scale-125 transition-transform effect-pulse" />
                            </Link>
                        </MagneticButton>
                    </div>
                </div>

                {/* 2. Navigation Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10 pt-8 mt-auto mb-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-6">Discover</h3>
                        <FooterLink to="/">Home</FooterLink>
                        <FooterLink to="/about">Our Story</FooterLink>
                        <FooterLink to="/programs">Impact</FooterLink>
                        <FooterLink to="/stories">Journal</FooterLink>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-6">Engage</h3>
                        <FooterLink to="/donate">Donate</FooterLink>
                        <FooterLink to="/get-involved">Volunteer</FooterLink>
                        <FooterLink to="/careers">Careers</FooterLink>
                        <FooterLink to="/contact">Contact</FooterLink>
                        <FooterLink to="/event">Events</FooterLink>
                    </div>
                    <div className="col-span-2 lg:col-span-2 block">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-6">Newsletter</h3>
                        <NewsletterForm />
                    </div>
                </div>

                {/* 3. Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-5 border-t border-white/10">
                    <p className="text-white/50 text-sm font-light">
                        © 2026 Patel Foundation. Built with purpose.
                    </p>
                    <div className="flex gap-3">
                        <SocialLink icon={Instagram} href="https://www.instagram.com/the_patelfoundation/" label="Instagram" />
                        <SocialLink icon={Youtube} href="https://www.youtube.com/@PatelFoundationUSA" label="YouTube" />
                        <SocialLink icon={WhatsAppIcon} href="https://wa.me/1234567890" label="WhatsApp" />
                        <SocialLink icon={Facebook} href="https://www.facebook.com/patelfoundation2019" label="Facebook" />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default GrandFinale;
