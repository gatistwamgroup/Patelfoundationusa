import { Facebook, Youtube, Instagram } from 'lucide-react';
import { WhatsAppIcon } from './Icons/WhatsAppIcon';
import { motion } from 'framer-motion';

const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/patelfoundation2019', label: 'Facebook', color: 'hover:bg-[#1877F2]' },
    { icon: Youtube, href: 'https://www.youtube.com/@PatelFoundationUSA', label: 'YouTube', color: 'hover:bg-[#FF0000]' },
    { icon: Instagram, href: 'https://www.instagram.com/the_patelfoundation/', label: 'Instagram', color: 'hover:bg-[#E4405F]' },
    { icon: WhatsAppIcon, href: 'https://wa.me/1234567890', label: 'WhatsApp', color: 'hover:bg-[#25D366]' },
];

const SocialSidebar = () => {
    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1">
            {socialLinks.map((social, index) => (
                <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
                    className={`flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md shadow-sm border border-border/50 text-muted-foreground transition-all duration-300 ${social.color} hover:text-white hover:w-14 rounded-l-sm`}
                    whileHover={{ x: -5 }}
                    aria-label={social.label}
                >
                    <social.icon size={20} />
                </motion.a>
            ))}
        </div>
    );
};

export default SocialSidebar;
