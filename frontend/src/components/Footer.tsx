import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Send, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from './Icons/WhatsAppIcon';
import { Link } from 'react-router-dom';
import { MEDIA } from '@/data/media';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/data/config';

const footerLinks = {
  about: [
    { name: 'Our Story', href: '/about' },
    { name: 'Leadership', href: '/about' },
    { name: 'Annual Reports', href: '/about' },
    { name: 'Careers', href: '/get-involved' },
  ],
  programs: [
    { name: 'Education', href: '/programs' },
    { name: 'Healthcare', href: '/programs' },
    { name: 'Sustainability', href: '/programs' },
    { name: 'Emergency Relief', href: '/programs' },
  ],
  getInvolved: [
    { name: 'Donate', href: '/donate' },
    { name: 'Volunteer', href: '/get-involved' },
    { name: 'Partner With Us', href: '/get-involved' },
    { name: 'Events', href: '/get-involved' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: SITE_CONFIG.socials.facebook, label: 'Facebook' },

  { icon: Instagram, href: SITE_CONFIG.socials.instagram, label: 'Instagram' },
  { icon: WhatsAppIcon, href: SITE_CONFIG.socials.whatsapp, label: 'WhatsApp' },
  { icon: Youtube, href: SITE_CONFIG.socials.youtube, label: 'YouTube' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome to the community! You've successfully subscribed.");
        setEmail('');
      } else {
        toast.error(data.message || "Something went wrong. Please try again later.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo & Newsletter */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-3 mb-6"
            >
              <img
                src={MEDIA.brand.logoFull}
                alt="Patel Foundation"
                className="h-14 w-auto"
              />
              <div>
                <span className="text-lg font-serif font-semibold tracking-tight">
                  Patel
                </span>
                <span className="block text-xs tracking-[0.2em] text-primary-foreground/70 uppercase">
                  Foundation
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6 max-w-sm">
              Dedicated to transforming lives through education, healthcare, and
              sustainable community development. Together, we create lasting change.
            </p>

            <div className="mb-8 max-w-sm">
              <h4 className="text-sm font-medium mb-3">Stay Updated</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2 relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-sm px-4 py-2 text-sm w-full focus:outline-none focus:border-primary text-primary-foreground placeholder:text-primary-foreground/40 disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Subscribe to newsletter"
                  className="bg-primary text-foreground px-3 py-2 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-medium text-sm tracking-wider uppercase mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm tracking-wider uppercase mb-4">Programs</h3>
            <ul className="space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm tracking-wider uppercase mb-4">Get Involved</h3>
            <ul className="space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Transparency Badges - World Class Trust */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-12 border-t border-primary-foreground/10">
          <div className="flex flex-col items-center">
            <div className="text-primary font-serif italic text-2xl mb-1">100%</div>
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-50">Direct Impact</div>
          </div>
          <div className="w-px h-8 bg-primary-foreground/10 hidden md:block" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-bold uppercase tracking-widest">Certified</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-50">Transparency</div>
          </div>
          <div className="w-px h-8 bg-primary-foreground/10 hidden md:block" />
          <div className="flex flex-col items-center text-center">
            <div className="text-sm font-medium mb-1 italic font-serif">"Every Rupee Tells a Story"</div>
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 text-primary">Sacred Promise</div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary-foreground/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2024 Patel Foundation. All rights reserved.</p>
            <span className="hidden md:block opacity-30">|</span>
            <p className="flex items-center gap-2 italic font-serif">
              Cultivated with <span className="text-primary active:scale-125 transition-transform cursor-heart">❤</span> in Kavitha, Gujarat
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
