import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Ticket, Heart, Users, BookOpen, Utensils, Star,
  ChevronDown, ArrowRight, ShieldCheck, Globe, Sparkles, CheckCircle2, Phone,
  Mail, User, Quote, Plus, Minus, Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { MEDIA } from '@/data/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import CircularGallery from '@/components/CircularGallery';
import api from '@/lib/api';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-10-24T18:30:00-05:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div variants={fadeInUp} className="flex gap-4 mb-12">
      {[
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HRS', value: timeLeft.hours },
        { label: 'MIN', value: timeLeft.minutes },
        { label: 'SEC', value: timeLeft.seconds }
      ].map((t, idx) => (
        <div key={idx} className="flex flex-col items-center min-w-[70px]">
          <div className="w-full aspect-square bg-slate-900 rounded-2xl flex items-center justify-center mb-2 shadow-2xl">
            <span className="text-2xl font-black text-white font-mono leading-none">
              {t.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-400 tracking-widest">{t.label}</span>
        </div>
      ))}
    </motion.div>
  );
};

const EventRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    guests: '1',
    ticketType: 'Standard ($150)',
    message: '',
    volunteer: false
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Required";
      toast.error("Full name is required");
    }
    
    if (!formData.email.trim()) {
      errors.email = "Required";
      toast.error("Email is required");
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid format";
      toast.error("Valid email is required");
    }
    
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!formData.phone.trim()) {
      errors.phone = "Required";
      toast.error("Phone number is required");
    } else if (!phoneRegex.test(formData.phone.trim().replace(/\s/g, ""))) {
      errors.phone = "Invalid format";
      toast.error("Please enter a valid phone number");
    }
    
    if (!formData.city.trim()) {
      errors.city = "Required";
      toast.error("City/State is required");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting || isRedirecting) return;

    setError(null);
    try {
      setIsSubmitting(true);
      
      // 1. Create the pending registration record
      const response = await api.post('/event-registration', formData);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate registration");
      }

      // 2. Initiate PayPal Payment
      setIsRedirecting(true);
      const paypalRes = await api.post('/paypal/initiate-event', { 
        registrationId: data.data._id 
      });
      const paypalData = paypalRes.data;

      if (paypalData.approvalUrl) {
        // 3. Redirect to PayPal
        window.location.href = paypalData.approvalUrl;
      } else {
        throw new Error("PayPal redirect URL missing.");
      }

    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
      console.error("Registration error:", error);
      toast.error(msg);
      setError(msg);
      setIsRedirecting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { q: "Is this event suitable for families?", a: "Yes, children are welcome to attend with their families." },
    { q: "Where does the donation go?", a: "100% of your donation is used for on-ground impact in Kavitha, Gujarat." },
    { q: "Will I receive a confirmation email?", a: "Immediately after registration and payment, you will receive an e-ticket via email." },
    { q: "Is my contribution tax deductible?", a: "Yes, Patel Foundation USA is a registered 501(c)(3) nonprofit organization." },
    { q: "Can I change my ticket details?", a: "Yes, please contact our support team at least 48 hours before the event." },
    { q: "How does Patel Foundation help children?", a: "We provide a holistic ecosystem including digital literacy, meals, and healthcare." }
  ];

  const itinerary = [
    { time: "6:30 PM", title: "Welcome Reception", desc: "Arrival & Networking" },
    { time: "7:15 PM", title: "Foundation Introduction", desc: "Our Mission" },
    { time: "8:00 PM", title: "Stories of Impact", desc: "Live Testimonials" },
    { time: "8:45 PM", title: "Community Dinner", desc: "Gala Dinner" },
    { time: "9:30 PM", title: "Sponsor Recognition", desc: "Awards" },
    { time: "10:15 PM", title: "Closing Remarks", desc: "Together We Change" }
  ];

  // Animation Variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const galleryItems = [
    { image: MEDIA.hero.education, text: "" },
    { image: MEDIA.hero.nutrition, text: "" },
    { image: MEDIA.hero.relief, text: "" },
    { image: MEDIA.projects.vidya, text: "" },
    { image: MEDIA.projects.water, text: "" },
    { image: MEDIA.projects.health, text: "" },
    { image: MEDIA.stories.libraryGirl, text: "" },
    { image: MEDIA.stories.digitalClass, text: "" },
    { image: MEDIA.events.picnic, text: "" },
    { image: MEDIA.events.reliefWork, text: "" },
  ];

  return (
    <div className="bg-white min-h-screen overflow-x-hidden text-slate-900 font-sans selection:bg-[#e08f24]/20">
      <SEO title="Event Registration | Patel Foundation USA" description="Join us for an evening that can change lives." />
      <Navbar />
      
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-white"
          >
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 animate-spin text-[#e08f24] opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#e08f24] animate-pulse" />
              </div>
            </div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-serif mb-2"
            >
              Preparing secure PayPal checkout...
            </motion.h2>
            <p className="text-slate-400 text-sm max-w-[280px] text-center font-medium leading-relaxed">
              Redirecting you to PayPal to complete your registration securely.
            </p>
            
            <div className="mt-12 flex items-center gap-4 py-3 px-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50">Encrypted Session Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row pt-32 lg:pt-10">
        {/* Left Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="lg:w-[55%] flex flex-col justify-center px-8 lg:px-20 xl:px-32 py-16 lg:py-32 z-10"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fcf3e6] text-[#e08f24] text-[11px] font-bold uppercase tracking-widest w-fit mb-8 border border-[#fae5c7]">
            <Sparkles size={12} className="animate-pulse" />
            <span>AWARENESS & FUNDRAISING 2026</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl xl:text-[5.5rem] font-serif font-medium leading-[1.05] text-slate-900 mb-6">
            An Evening That Can <br />
            <span className="italic text-[#e08f24] relative inline-block">
              Change Lives
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#e08f24]/30 origin-left rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-xl mb-10 font-light leading-relaxed">
            Join Patel Foundation USA for a special gathering dedicated to empowering underprivileged children in rural India through education, nutrition, and care.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-8">
            <Button onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#e08f24] hover:bg-[#c97d1b] text-white px-8 h-14 rounded-full text-base font-medium shadow-lg shadow-[#e08f24]/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <Ticket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Reserve Your Seat
            </Button>
            <Button variant="outline" className="px-8 h-14 rounded-full text-base font-medium border-slate-200 hover:bg-slate-50 text-slate-700 transition-all duration-300 group hover:-translate-y-1">
              Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </motion.div>

          {/* Countdown Timer */}
          <CountdownTimer />

          {/* Info Bar */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-y-8 border-t border-slate-100 pt-8 mt-auto">
            {[
              { icon: Calendar, label: "DATE", value: "October 24, 2026" },
              { icon: Clock, label: "TIME", value: "6:30 PM EST" },
              { icon: MapPin, label: "VENUE", value: "The Grand Ballroom, NY" },
              { icon: Ticket, label: "PRICE", value: "$150 / Seat" }
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 ${i > 0 && i !== 2 ? 'md:border-l md:border-slate-100 md:pl-6' : ''} ${i === 2 ? 'md:border-l md:border-slate-100 md:pl-6 border-t md:border-t-0 border-slate-100 pt-8 md:pt-0' : ''} ${i === 3 ? 'border-t md:border-t-0 border-slate-100 pt-8 md:pt-0' : ''}`}>
                <item.icon className="text-[#e08f24] w-5 h-5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:absolute top-0 right-0 lg:w-[45%] h-[60vh] lg:h-full relative overflow-hidden group"
        >
          <img src={MEDIA.hero.education} alt="Hero" className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[2000ms] ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-12 left-12 right-12 lg:right-auto bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-[340px] border border-white/50 hover:-translate-y-2 transition-transform duration-500"
          >
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Be a Part of Real Change</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">Your presence helps create a brighter future for children in need.</p>
            <div className="w-8 h-8 rounded-full bg-[#fcf3e6] flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#e08f24] fill-[#e08f24] animate-pulse" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. MISSION SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Collage */}
            <div className="relative h-[600px]">
              <motion.div
                initial={{ opacity: 0, x: -30, rotate: -2 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-2/3 h-[300px] rounded-[2rem] overflow-hidden border-8 border-white shadow-xl z-10 group"
              >
                <img src={MEDIA.hero.education} alt="Classroom" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -30, rotate: 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-24 right-0 w-1/2 h-[250px] rounded-[2rem] overflow-hidden border-8 border-white shadow-xl z-20 group"
              >
                <img src={MEDIA.hero.nutrition} alt="Nutrition" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-0 left-12 right-12 h-[250px] rounded-[2rem] overflow-hidden border-8 border-white shadow-xl z-30 group"
              >
                <img src={MEDIA.projects.vidya} alt="Education" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
            </div>

            {/* Text & Icons */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="text-[#e08f24] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">MISSION — THE FUTURE</motion.span>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-medium text-slate-900 mb-6 leading-tight">A Gathering With Purpose</motion.h2>
              <motion.p variants={fadeInUp} className="text-slate-500 text-lg leading-relaxed mb-12">
                This special evening brings together compassionate individuals, families, and community leaders who believe in creating lasting change.<br /><br />
                Through inspiring stories, meaningful connections, and a shared purpose, we unite to support children's education, health, and holistic development.
              </motion.p>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: BookOpen, title: "Education", desc: "Free English medium education for underprivileged children." },
                  { icon: Users, title: "Connection", desc: "Meet like-minded change-makers and build lasting relationships." },
                  { icon: Heart, title: "Impact", desc: "100% of proceeds support on-ground programs." }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="group cursor-default">
                    <div className="w-12 h-12 rounded-full bg-[#fcf3e6] flex items-center justify-center mb-4 group-hover:bg-[#e08f24] transition-colors duration-300">
                      <item.icon className="text-[#e08f24] w-5 h-5 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 mb-2 group-hover:text-[#e08f24] transition-colors duration-300">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT SECTION */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#e08f24] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">OUR IMPACT</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-medium text-slate-900 mb-6">What Your Support Creates</motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-500 max-w-2xl mx-auto text-lg">Every contribution flows to on-ground action initiatives that expand and sustain holistic care for children in rural areas.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {[
              { icon: BookOpen, title: "Free Education", desc: "Providing quality English education to bridge urban-rural divides." },
              { icon: Utensils, title: "Nutritious Meals", desc: "Daily hot, nutritious meals to ensure healthy bodies." },
              { icon: Heart, title: "Health Awareness", desc: "Health checkups and hygiene education." },
              { icon: Star, title: "Sports & Activities", desc: "Sports equipment and extracurricular programs." },
              { icon: Users, title: "Child Development", desc: "Mentorship and counseling for holistic growth." },
              { icon: Globe, title: "Future Opportunities", desc: "Career guidance and digital literacy." }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white p-8 rounded-2xl border border-slate-100 text-center flex flex-col items-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(224,143,36,0.1)] hover:border-[#e08f24]/30 transition-all duration-300 group"
              >
                <item.icon className="text-[#e08f24] w-8 h-8 mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-serif font-bold text-slate-900 mb-3 text-lg leading-tight group-hover:text-[#e08f24] transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. ITINERARY SECTION */}
      <section className="py-24 bg-white border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-6 max-w-[1400px]">
          <div className="grid lg:grid-cols-[1fr_3fr] gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="text-[#e08f24] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">ITINERARY</motion.span>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-medium text-slate-900 mb-6">A Night of Connection</motion.h2>
              <motion.p variants={fadeInUp} className="text-slate-500 text-lg">An evening thoughtfully curated to inspire, engage, and create meaningful impact.</motion.p>
            </motion.div>

            <div className="relative pt-12">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-[4.5rem] left-0 w-full h-[2px] bg-slate-100 hidden md:block origin-left"
              />
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
                className="grid grid-cols-2 md:grid-cols-6 gap-8"
              >
                {itinerary.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                    className="relative text-center flex flex-col items-center group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#fcf3e6] border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold text-[#e08f24] mb-6 relative z-10 group-hover:bg-[#e08f24] group-hover:text-white transition-colors duration-300">
                      {i + 1}
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 mb-2 leading-tight group-hover:text-[#e08f24] transition-colors duration-300">{item.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">{item.desc}</p>
                    <p className="text-xs text-[#e08f24] font-bold uppercase tracking-wider bg-[#fcf3e6] px-2 py-1 rounded-full inline-block">{item.time}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REGISTRATION SECTION */}
      <section id="register" className="py-12 bg-[#faf9f6] min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row"
          >

            {/* Left Image Card */}
            <div className="lg:w-[40%] bg-slate-900 relative p-8 text-white flex flex-col justify-between overflow-hidden group">
              <img src={MEDIA.hero.education} alt="Impact" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40" />

              <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Users, stat: "500+", label: "CHILDREN SUPPORTED" },
                  { icon: Utensils, stat: "100K+", label: "MEALS SERVED" },
                  { icon: Globe, stat: "10+", label: "COMMUNITY PROGRAMS" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 * i, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-1.5 text-[#e08f24] mb-0.5">
                      <item.icon className="w-3.5 h-3.5" />
                      <span className="text-xl font-serif font-bold text-white">{item.stat}</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold">{item.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="relative z-10 bg-white text-slate-900 p-6 rounded-xl hover:shadow-xl transition-shadow"
              >
                <h4 className="font-serif font-bold text-lg mb-3">What's included?</h4>
                <ul className="space-y-2">
                  {[
                    "Access to all networking and sessions",
                    "Premium dinner and seating reserved",
                    "Exclusive physical impact report",
                    "Tax-deductible receipt from Patel Foundation"
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#e08f24] shrink-0" />
                      <span className="text-xs font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right Form Card */}
            <div className="lg:w-[60%] p-8 lg:p-10">
              {/* Ticket Pulse */}
              <div className="p-5 rounded-2xl bg-[#fcf3e6] border border-[#fae5c7] mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-[#e08f24] uppercase tracking-widest">Ticket Pulse</span>
                  <span className="text-[10px] font-bold text-[#e08f24]">82% Capacity</span>
                </div>
                <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden mb-3">
                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: '82%' }} 
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[#e08f24] rounded-full shadow-[0_0_10px_rgba(224,143,36,0.3)]" 
                  />
                </div>
                <p className="text-[10px] text-[#e08f24]/70 font-medium leading-relaxed">
                  Only limited seats remain for the 2026 Gala. Secure yours today.
                </p>
              </div>

              <h3 className="text-2xl font-serif font-medium text-slate-900 mb-1">Reserve Your Seat</h3>
              <p className="text-sm text-slate-500 mb-6">Fill out the form below to secure your ticket. You will be redirected to complete the payment.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${fieldErrors.fullName ? 'text-red-500' : 'text-slate-700'}`}>Full Name <span className="text-red-500">*</span></label>
                    <Input name="fullName" required value={formData.fullName} onChange={handleInputChange} className={`h-10 text-sm bg-slate-50 border-slate-200 focus:border-[#e08f24] focus:ring-[#e08f24] ${fieldErrors.fullName ? 'border-red-500 bg-red-50/50' : ''}`} />
                    {fieldErrors.fullName && <p className="text-[9px] text-red-500 font-bold mt-0.5">{fieldErrors.fullName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${fieldErrors.email ? 'text-red-500' : 'text-slate-700'}`}>Email Address <span className="text-red-500">*</span></label>
                    <Input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={`h-10 text-sm bg-slate-50 border-slate-200 focus:border-[#e08f24] focus:ring-[#e08f24] ${fieldErrors.email ? 'border-red-500 bg-red-50/50' : ''}`} />
                    {fieldErrors.email && <p className="text-[9px] text-red-500 font-bold mt-0.5">{fieldErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${fieldErrors.phone ? 'text-red-500' : 'text-slate-700'}`}>Phone Number <span className="text-red-500">*</span></label>
                    <Input name="phone" required value={formData.phone} onChange={handleInputChange} className={`h-10 text-sm bg-slate-50 border-slate-200 focus:border-[#e08f24] focus:ring-[#e08f24] ${fieldErrors.phone ? 'border-red-500 bg-red-50/50' : ''}`} />
                    {fieldErrors.phone && <p className="text-[9px] text-red-500 font-bold mt-0.5">{fieldErrors.phone}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${fieldErrors.city ? 'text-red-500' : 'text-slate-700'}`}>City, State <span className="text-red-500">*</span></label>
                    <Input name="city" required value={formData.city} onChange={handleInputChange} className={`h-10 text-sm bg-slate-50 border-slate-200 focus:border-[#e08f24] focus:ring-[#e08f24] ${fieldErrors.city ? 'border-red-500 bg-red-50/50' : ''}`} />
                    {fieldErrors.city && <p className="text-[9px] text-red-500 font-bold mt-0.5">{fieldErrors.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Number of Guests <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select name="guests" value={formData.guests} onChange={handleInputChange} className="w-full h-10 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 appearance-none outline-none group-focus-within:border-[#e08f24] group-focus-within:ring-1 group-focus-within:ring-[#e08f24] transition-all">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-[#e08f24] transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Ticket Type <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select name="ticketType" value={formData.ticketType} onChange={handleInputChange} className="w-full h-10 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 appearance-none outline-none group-focus-within:border-[#e08f24] group-focus-within:ring-1 group-focus-within:ring-[#e08f24] transition-all">
                        <option>Standard Seat ($150)</option>
                        <option>VIP Table ($1200)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-[#e08f24] transition-colors" />
                    </div>
                  </div>
                </div>


                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Message (Optional)</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full h-16 text-sm bg-slate-50 border border-slate-200 rounded-md p-3 outline-none resize-none focus:border-[#e08f24] focus:ring-1 focus:ring-[#e08f24] transition-all" placeholder="Enter your message..." />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="volunteer" name="volunteer" checked={formData.volunteer} onChange={handleInputChange} className="mt-0.5 border-slate-300 rounded text-[#e08f24] focus:ring-[#e08f24]" />
                  <label htmlFor="volunteer" className="text-xs text-slate-600 cursor-pointer select-none">I would like to learn about volunteering opportunities</label>
                </div>

                <div className="bg-[#f8f9fa] p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#fcf3e6] flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#e08f24]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Secure Payment</p>
                      <p className="text-[10px] text-slate-500">Redirects to billing.</p>
                    </div>
                  </div>
                  <div className="text-blue-600 font-bold text-lg tracking-tighter">paypal</div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || isRedirecting}
                  className="w-full h-12 bg-[#0A0A0A] text-white text-sm rounded-lg font-bold flex items-center justify-center gap-2 group relative overflow-hidden mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center">
                    {isSubmitting || isRedirecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {isRedirecting ? 'Redirecting...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        Complete Registration & Pay <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  {!(isSubmitting || isRedirecting) && <div className="absolute inset-0 bg-[#e08f24] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />}
                </Button>
                {error && <p className="text-red-500 text-[10px] font-bold text-center mt-2">{error}</p>}
                <p className="text-center text-xs text-slate-400 mt-4">You will receive an email confirmation.</p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. QUOTES SECTION */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-50 p-8 rounded-2xl flex-1 border border-slate-100 relative hover:shadow-lg transition-shadow duration-300 group"
          >
            <Quote className="absolute top-6 left-6 text-[#fcf3e6] w-12 h-12 -z-0 group-hover:text-[#fae5c7] transition-colors" />
            <p className="relative z-10 text-slate-600 italic leading-relaxed text-sm">"Your contribution directly funds the education, nutrition, and care of these children."</p>
            <p className="text-[#e08f24] text-xs font-bold mt-4 uppercase tracking-wider">FOUNDATION DIRECTOR</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center flex-1 shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-[#fcf3e6] mx-auto flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-[#e08f24]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-slate-900 leading-tight">
              Because Every Child <br />
              <span className="italic text-[#e08f24]">Deserves to Dream</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-50 p-8 rounded-2xl flex-1 border border-slate-100 relative hover:shadow-lg transition-shadow duration-300 group"
          >
            <Quote className="absolute top-6 left-6 text-[#fcf3e6] w-12 h-12 -z-0 group-hover:text-[#fae5c7] transition-colors" />
            <p className="relative z-10 text-slate-600 italic leading-relaxed text-sm">"The impact of a single evening can echo through a child's entire life."</p>
            <p className="text-[#e08f24] text-xs font-bold mt-4 uppercase tracking-wider">COMMUNITY LEADER</p>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#e08f24] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">COMMON QUESTIONS</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-medium text-slate-900">Have Questions?</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-x-8 gap-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#e08f24]/30 hover:shadow-md transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-6 flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-bold text-sm transition-colors duration-300 ${activeFaq === i ? 'text-[#e08f24]' : 'text-slate-900'}`}>{faq.q}</span>
                  {activeFaq === i ? <Minus className="w-5 h-5 text-[#e08f24] shrink-0" /> : <Plus className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-slate-500 text-sm leading-relaxed border-t border-slate-50 mt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CIRCULAR GALLERY */}
      <section className="bg-white overflow-hidden w-full m-0 p-0">
        <div className="h-[450px] md:h-[600px] relative w-full">
          <CircularGallery 
            items={galleryItems}
            bend={1} 
            textColor="#0A0A0A" 
            borderRadius={0.05} 
            scrollSpeed={2}
            scrollEase={0.05}
          />
        </div>
      </section>

      {/* 8. FOOTER CTA */}
      <section className="py-12 bg-[#faf9f6]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#0A0A0A] rounded-[2rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(224,143,36,0.15)_0%,transparent_70%)] group-hover:scale-110 transition-transform duration-[2000ms]" />
            <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
              <span className="text-sm font-bold tracking-widest text-[#e08f24] uppercase block mb-4">Join the</span>
              <h2 className="text-5xl font-serif font-medium mb-4">Global Movement.</h2>
              <p className="text-white/70 max-w-md">Become a part of a caring community making a real difference in children's lives in rural India.</p>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <Button onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#e08f24] hover:bg-[#c97d1b] text-white px-8 h-14 rounded-full font-bold shadow-lg shadow-[#e08f24]/20 hover:-translate-y-1 transition-all duration-300">
                Register Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button className="bg-white hover:bg-slate-50 text-slate-900 px-8 h-14 rounded-full font-bold hover:-translate-y-1 transition-all duration-300">
                Donate Now <Heart className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <GrandFinale />
    </div>
  );
};

export default EventRegistration;
