import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GrandFinale from '@/components/GrandFinale';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#FAFAF8] min-h-screen font-sans text-slate-900">
            <SEO 
                title="Terms of Service | Patel Foundation USA" 
                description="Terms and conditions for using our website and services."
            />
            <Navbar theme="dark" />

            <main className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-serif font-medium mb-8">Terms of Service</h1>
                        <p className="text-slate-500 mb-12 italic">Last Updated: May 14, 2026</p>

                        <section className="prose prose-slate prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using the Patel Foundation USA website, you agree to comply with and be 
                                    bound by these Terms of Service. If you do not agree, please do not use our services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">2. Nonprofit Status</h2>
                                <p>
                                    Patel Foundation USA is a registered 501(c)(3) nonprofit organization. All donations are 
                                    subject to US tax laws and regulations.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">3. Donations and Refunds</h2>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li>Donations are made voluntarily and are generally non-refundable.</li>
                                    <li>If a mistake was made during the donation process, please contact us within 15 days.</li>
                                    <li>We use 100% of public donations for our on-ground programs, as outlined in our mission.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">4. Event Registration</h2>
                                <p>
                                    Registrations for the "Empowering Futures Gala" or other events are subject to availability. 
                                    Tickets are personal and may only be transferred with prior written consent from the foundation.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">5. Intellectual Property</h2>
                                <p>
                                    All content on this website, including text, images, and logos, is the property of Patel 
                                    Foundation USA and is protected by copyright laws. You may not use our content without 
                                    prior written permission.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
                                <p>
                                    Patel Foundation USA shall not be liable for any direct, indirect, or incidental damages 
                                    resulting from your use or inability to use the website or services.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">7. Governing Law</h2>
                                <p>
                                    These terms are governed by the laws of the United States and the State of [Your State, e.g., Texas/New York].
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

export default Terms;
