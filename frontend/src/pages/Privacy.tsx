import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';

const Privacy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#FAFAF8] min-h-screen font-sans text-slate-900">
            <SEO 
                title="Privacy Policy | Patel Foundation USA" 
                description="Our commitment to your privacy and the security of your data."
            />
            <Navbar theme="dark" />

            <main className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-serif font-medium mb-8">Privacy Policy</h1>
                        <p className="text-slate-500 mb-12 italic">Last Updated: May 14, 2026</p>

                        <section className="prose prose-slate prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">1. Our Commitment</h2>
                                <p>
                                    Patel Foundation USA ("we," "us," or "our") is committed to protecting your privacy. 
                                    This Privacy Policy explains how we collect, use, and safeguard your personal information 
                                    when you visit our website or interact with our services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                                <p>We collect information that you provide directly to us, including:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li><strong>Personal Details:</strong> Name, email address, and phone number when you register for events or contact us.</li>
                                    <li><strong>Donation Data:</strong> We process donations through secure third-party processors like PayPal. We do not store your credit card information on our servers.</li>
                                    <li><strong>Technical Data:</strong> IP address, browser type, and usage data via cookies to improve your experience.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                                <p>We use the collected data for:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li>Processing your donations and event registrations.</li>
                                    <li>Sending newsletters and updates (you can opt-out at any time).</li>
                                    <li>Improving our website functionality and security.</li>
                                    <li>Complying with legal and tax obligations as a 501(c)(3) nonprofit.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">4. 100% Transparency Promise</h2>
                                <p>
                                    In line with our transparency model, we never sell, rent, or trade your personal information 
                                    with third parties for marketing purposes. Your trust is our most valuable asset.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">5. Security</h2>
                                <p>
                                    We implement industry-standard security measures, including SSL encryption, to protect your 
                                    data. However, no method of transmission over the internet is 100% secure.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">6. Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us at 
                                    <a href="mailto:info@mypatelfoundation.org" className="text-primary hover:underline ml-1">info@mypatelfoundation.org</a>.
                                </p>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>

            <GrandFinale />
        </div>
    );
};

export default Privacy;
