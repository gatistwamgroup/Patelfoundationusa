/**
 * CancelPage — PayPal Redirect Return (Cancelled)
 * 
 * Flow:
 * 1. PayPal redirects back with 'token' in URL if user cancels.
 * 2. Component shows cancellation state.
 * 3. User can easily go back to retry.
 */
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";

const CancelPage = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-primary/20">
            <SEO title="Donation Cancelled | Patel Foundation" description="Your donation session has been closed. We hope you'll consider joining us again." />
            <Navbar />
            
            <main className="container mx-auto px-6 py-32 flex flex-col items-center justify-center min-h-[80vh]">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white rounded-3xl p-12 shadow-2xl shadow-red-500/5 flex flex-col items-center text-center border border-gray-100"
                >
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8/2">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    
                    <h1 className="text-4xl font-serif mb-4 text-black mt-8">Session Cancelled</h1>
                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                        Your secure checkout session has been closed. Your account has <span className="font-bold text-red-600/60 transition-colors">not been charged</span>.
                    </p>

                    <div className="w-full flex flex-col gap-4">
                        <Link to="/donate" className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-xl shadow-black/10">
                            <ArrowLeft size={18} />
                            <span>Return to Donation Center</span>
                        </Link>
                        
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <Heart size={14} className="text-primary fill-primary" />
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Patel Foundation</span>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default CancelPage;
